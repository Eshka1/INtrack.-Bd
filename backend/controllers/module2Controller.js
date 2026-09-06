const mongoose = require('mongoose');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const Recipe = require('../models/Recipe');
const ManufacturingRun = require('../models/ManufacturingRun');
const LocationStock = require('../models/LocationStock');

// ==========================================
// 2.1 Suppliers
// ==========================================
exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const filter = req.query.companyId ? { companyId: req.query.companyId } : {};
    const suppliers = await Supplier.find(filter).sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Supplier not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Supplier not found' });
    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ==========================================
// 2.2 Purchase Orders & Intake Engine
// ==========================================
exports.createPurchaseOrder = async (req, res) => {
  try {
    const items = req.body.items || [];
    const totalCost = items.reduce((sum, item) => sum + (Number(item.orderedQuantity) || 0) * (Number(item.unitCost) || 0), 0);
    const po = await PurchaseOrder.create({ ...req.body, totalCost });
    res.status(201).json(po);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find().populate('supplierId').sort({ createdAt: -1 });
    res.status(200).json(pos);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.ingestShipment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { poId } = req.params;
    const { deliverySlipNumber, verifiedWeight, receivedItems, productName, name, sku, quantityReceived, quantity, unit, location } = req.body;

    // Direct intake without a PO
    if (!poId && (productName || name || sku)) {
      const targetName = (productName || name || '').trim();
      const qty = Number(quantityReceived || quantity || 0);
      const targetSku = sku || `RAW-${Math.floor(100 + Math.random() * 900)}`;

      const stock = await LocationStock.findOneAndUpdate(
        { $or: [{ sku: targetSku }, { itemName: targetName }] },
        {
          $inc: { currentQuantity: qty, quantity: qty },
          $setOnInsert: {
            itemName: targetName || 'Unnamed Material',
            sku: targetSku,
            unitOfMeasure: unit || 'kg',
            warehouseName: location || 'Main Warehouse Dock'
          }
        },
        { upsert: true, new: true, session }
      );

      await session.commitTransaction();
      session.endSession();
      return res.status(200).json(stock);
    }

    // Standard PO fulfillment intake
    const po = await PurchaseOrder.findById(poId).session(session);
    if (!po) throw new Error('Purchase Order not found');

    const items = receivedItems || [];
    for (const item of items) {
      const qty = Number(item.quantity || 0);
      await LocationStock.findOneAndUpdate(
        {
          companyId: po.companyId || 'comp_default',
          warehouseName: po.warehouseName || 'Main Warehouse',
          sku: item.sku
        },
        { 
          $inc: { currentQuantity: qty, quantity: qty },
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
    res.status(200).json(po);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
};

// ==========================================
// 2.3 Dynamic Recipe Builder (BOM)
// ==========================================
exports.createRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Recipe.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await Recipe.findOneAndDelete({ $or: [{ _id: id }, { name: id }] });
    }

    if (!deleted) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(200).json({ message: 'Recipe deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 2.4 Manufacturing Execution
// ==========================================
exports.executeManufacturingRun = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { recipeId, warehouseName = 'Main Warehouse', quantityProduced, materialDeductions } = req.body;

    // Direct deduction payload
    if (Array.isArray(materialDeductions)) {
      for (const d of materialDeductions) {
        const rawNeeded = Number(d.totalQty || d.quantityRequired || 0);
        let target = null;

        if (mongoose.Types.ObjectId.isValid(d.rawMaterialId)) {
          target = await LocationStock.findById(d.rawMaterialId).session(session);
        }
        if (!target && d.rawMaterialName) {
          target = await LocationStock.findOne({ itemName: new RegExp(`^${d.rawMaterialName.trim()}$`, 'i') }).session(session);
        }

        if (target) {
          const current = target.currentQuantity || target.quantity || 0;
          const nextBal = Math.max(0, Number((current - rawNeeded).toFixed(4)));
          target.currentQuantity = nextBal;
          target.quantity = nextBal;
          await target.save({ session });
        }
      }
      await session.commitTransaction();
      session.endSession();
      const updated = await LocationStock.find().sort({ createdAt: -1 });
      return res.status(200).json({ message: 'Production run recorded', inventory: updated });
    }

    // Recipe-driven execution
    const recipe = await Recipe.findById(recipeId).session(session);
    if (!recipe) throw new Error('Recipe not found');

    const deducted = [];
    for (const ing of (recipe.ingredients || [])) {
      const requiredQty = Number((ing.consumptionPerPiece * quantityProduced).toFixed(4));

      const stock = await LocationStock.findOne({
        sku: ing.sku
      }).session(session);

      const current = stock ? (stock.currentQuantity || stock.quantity || 0) : 0;
      if (!stock || current < requiredQty) {
        throw new Error(`Insufficient stock for: ${ing.itemName}. Available: ${current}, Required: ${requiredQty}`);
      }

      stock.currentQuantity = Number((current - requiredQty).toFixed(4));
      stock.quantity = stock.currentQuantity;
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
          companyId: recipe.companyId || 'comp_default',
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
    res.status(201).json(run[0]);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
};

// ==========================================
// 2.5 Inventory Ledger & Stock Alerts
// ==========================================
exports.getInventory = async (req, res) => {
  try {
    const stocks = await LocationStock.find().sort({ createdAt: -1 });
    res.status(200).json(stocks);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getInventoryAndAlerts = async (req, res) => {
  try {
    const stocks = await LocationStock.find();
    const alerts = stocks.filter(stock => {
      const qty = stock.currentQuantity || stock.quantity || 0;
      const threshold = stock.safetyStockThreshold || 10;
      return qty <= threshold;
    });
    res.status(200).json({
      success: true,
      totalItems: stocks.length,
      alertsCount: alerts.length,
      inventory: stocks,
      lowStockAlerts: alerts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const deleted = await LocationStock.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Material not found' });
    res.status(200).json({ message: 'Material deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};