const mongoose = require('mongoose');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const Recipe = require('../models/Recipe');
const ManufacturingRun = require('../models/ManufacturingRun');
const LocationStock = require('../models/LocationStock');

// 2.1 Suppliers
exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ companyId: req.query.companyId || 'comp_default' });
    res.status(200).json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2.2 Purchase Orders & Intake Engine
exports.createPurchaseOrder = async (req, res) => {
  try {
    const totalCost = req.body.items.reduce((sum, item) => sum + item.orderedQuantity * item.unitCost, 0);
    const po = await PurchaseOrder.create({ ...req.body, totalCost });
    res.status(201).json({ success: true, data: po });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find().populate('supplierId');
    res.status(200).json({ success: true, data: pos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.ingestShipment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { poId } = req.params;
    const { deliverySlipNumber, verifiedWeight, receivedItems } = req.body;

    const po = await PurchaseOrder.findById(poId).session(session);
    if (!po) throw new Error('Purchase Order not found');

    for (const item of receivedItems) {
      await LocationStock.findOneAndUpdate(
        { companyId: po.companyId, warehouseName: po.warehouseName, sku: item.sku },
        { 
          $inc: { currentQuantity: Number(item.quantity) },
          $setOnInsert: { itemName: item.name, unitOfMeasure: item.unitOfMeasure || 'kg' }
        },
        { upsert: true, new: true, session }
      );
    }

    po.deliverySlipNumber = deliverySlipNumber;
    po.verifiedWeight = verifiedWeight;
    po.status = 'RECEIVED';
    po.receivedAt = new Date();
    await po.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(200).json({ success: true, message: 'Shipment ingested & stock updated', data: po });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
};

// 2.3 Dynamic Recipe Builder (BOM)
exports.createRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);
    res.status(201).json({ success: true, data: recipe });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ isActive: true });
    res.status(200).json({ success: true, data: recipes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2.4 Decimal Stock Adjustments for Manufacturing Run
exports.executeManufacturingRun = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { recipeId, warehouseName = 'Main Warehouse', quantityProduced } = req.body;
    const recipe = await Recipe.findById(recipeId).session(session);
    if (!recipe) throw new Error('Recipe not found');

    const deducted = [];
    for (const ing of recipe.ingredients) {
      const requiredQty = Number((ing.consumptionPerPiece * quantityProduced).toFixed(4));

      const stock = await LocationStock.findOne({
        companyId: recipe.companyId,
        warehouseName,
        sku: ing.sku
      }).session(session);

      if (!stock || stock.currentQuantity < requiredQty) {
        throw new Error(`Insufficient stock for: ${ing.itemName}. Available: ${stock ? stock.currentQuantity : 0}, Required: ${requiredQty}`);
      }

      stock.currentQuantity = Number((stock.currentQuantity - requiredQty).toFixed(4));
      await stock.save({ session });

      deducted.push({
        itemName: ing.itemName,
        sku: ing.sku,
        quantityDeducted: requiredQty,
        unitOfMeasure: ing.unitOfMeasure
      });
    }

    const run = await ManufacturingRun.create(
      [
        {
          companyId: recipe.companyId,
          runNumber: `RUN-${Date.now()}`,
          recipeId,
          warehouseName,
          quantityProduced,
          deductedMaterials: deducted,
          status: 'COMPLETED'
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ success: true, message: 'Production run logged and balances adjusted', data: run[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
};

// 2.5 Low-Stock Alerts & Live Inventory
exports.getInventoryAndAlerts = async (req, res) => {
  try {
    const stocks = await LocationStock.find({ companyId: req.query.companyId || 'comp_default' });
    const alerts = stocks.filter(stock => stock.currentQuantity <= stock.safetyStockThreshold);
    res.status(200).json({ success: true, totalItems: stocks.length, alertsCount: alerts.length, inventory: stocks, lowStockAlerts: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};