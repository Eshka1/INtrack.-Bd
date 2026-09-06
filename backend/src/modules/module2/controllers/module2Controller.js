const mongoose = require('mongoose');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const Recipe = require('../models/Recipe');
const ManufacturingRun = require('../models/ManufacturingRun');
const OperationalStock = require('../models/OperationalStock');
const Warehouse = require('../../../../models/Warehouse');
const { convertUnits } = require('../utils/units');
const { AppError } = require('../../../../utils/errorHandler');
const asyncHandler = require('../../../../utils/asyncHandler');

const scoped = (req, extra = {}) => ({ ...extra, tenantId: req.tenantId });
const round = (value) => Number(Number(value).toFixed(4));

const resolveWarehouse = async (req, warehouseId) => {
  if (!warehouseId || !mongoose.isValidObjectId(warehouseId)) {
    throw new AppError('A valid warehouseId is required', 400);
  }
  const warehouse = await Warehouse.findOne(scoped(req, { _id: warehouseId, isActive: true }));
  if (!warehouse) throw new AppError('Storage destination not found', 404);
  return warehouse;
};

exports.getSuppliers = asyncHandler(async (req, res) => {
  const data = await Supplier.find(scoped(req)).sort({ createdAt: -1 });
  res.json({ success: true, count: data.length, data });
});

exports.createSupplier = asyncHandler(async (req, res) => {
  const data = await Supplier.create({ ...req.body, tenantId: req.tenantId });
  res.status(201).json({ success: true, data });
});

exports.updateSupplier = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  delete updates.tenantId;
  delete updates._id;
  const data = await Supplier.findOneAndUpdate(scoped(req, { _id: req.params.id }), updates, { new: true, runValidators: true });
  if (!data) throw new AppError('Supplier not found', 404);
  res.json({ success: true, data });
});

exports.deleteSupplier = asyncHandler(async (req, res) => {
  const data = await Supplier.findOneAndDelete(scoped(req, { _id: req.params.id }));
  if (!data) throw new AppError('Supplier not found', 404);
  res.json({ success: true, data: {} });
});

exports.getPurchaseOrders = asyncHandler(async (req, res) => {
  const data = await PurchaseOrder.find(scoped(req)).populate('supplierId').populate('warehouse', 'name locationType parentLocation isActive').sort({ createdAt: -1 });
  res.json({ success: true, count: data.length, data });
});

exports.createPurchaseOrder = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findOne(scoped(req, { _id: req.body.supplierId }));
  if (!supplier) throw new AppError('Supplier not found', 404);
  const warehouse = await resolveWarehouse(req, req.body.warehouseId);
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const totalCost = round(items.reduce((sum, item) => sum + Number(item.orderedQuantity) * Number(item.unitCost), 0));
  const payload = { ...req.body };
  delete payload.warehouseId;
  delete payload.warehouseName;
  const data = await PurchaseOrder.create({ ...payload, tenantId: req.tenantId, warehouse: warehouse._id, warehouseName: warehouse.name, items, totalCost });
  res.status(201).json({ success: true, data });
});

exports.ingestShipment = asyncHandler(async (req, res) => {
  const po = await PurchaseOrder.findOne(scoped(req, { _id: req.params.poId }));
  if (!po) throw new AppError('Purchase order not found', 404);
  if (po.status === 'CANCELLED') throw new AppError('Cancelled purchase orders cannot be received', 400);
  const warehouse = await resolveWarehouse(req, po.warehouse);
  const receivedItems = Array.isArray(req.body.receivedItems) ? req.body.receivedItems : [];
  if (!receivedItems.length) throw new AppError('receivedItems is required', 400);

  for (const received of receivedItems) {
    const poItem = po.items.find((item) => item.sku === received.sku);
    if (!poItem) throw new AppError(`SKU ${received.sku} is not part of this purchase order`, 400);
    const quantity = Number(received.quantity);
    if (!(quantity > 0)) throw new AppError('Received quantities must be greater than zero', 400);
  }

  for (const received of receivedItems) {
    const poItem = po.items.find((item) => item.sku === received.sku);
    poItem.receivedQuantity = round(poItem.receivedQuantity + Number(received.quantity));
    await OperationalStock.findOneAndUpdate(
      scoped(req, { warehouse: warehouse._id, sku: received.sku }),
      { $inc: { currentQuantity: Number(received.quantity) }, $set: { warehouseName: warehouse.name }, $setOnInsert: { itemName: poItem.itemName, unitOfMeasure: poItem.unitOfMeasure } },
      { upsert: true, new: true, runValidators: true }
    );
  }
  po.deliverySlipNumber = req.body.deliverySlipNumber || '';
  po.verifiedWeight = Number(req.body.verifiedWeight || 0);
  po.receivedAt = new Date();
  po.status = po.items.every((item) => item.receivedQuantity >= item.orderedQuantity) ? 'RECEIVED' : 'PARTIAL';
  await po.save();
  res.json({ success: true, message: 'Shipment ingested and stock updated', data: po });
});

exports.getRecipes = asyncHandler(async (req, res) => {
  const data = await Recipe.find(scoped(req, { isActive: true })).sort({ createdAt: -1 });
  res.json({ success: true, count: data.length, data });
});

exports.createRecipe = asyncHandler(async (req, res) => {
  const data = await Recipe.create({ ...req.body, tenantId: req.tenantId });
  res.status(201).json({ success: true, data });
});

exports.deleteRecipe = asyncHandler(async (req, res) => {
  const data = await Recipe.findOneAndUpdate(scoped(req, { _id: req.params.id }), { isActive: false }, { new: true });
  if (!data) throw new AppError('Recipe not found', 404);
  res.json({ success: true, data: {} });
});

exports.executeManufacturingRun = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findOne(scoped(req, { _id: req.body.recipeId, isActive: true }));
  if (!recipe) throw new AppError('Recipe not found', 404);
  const quantityProduced = Number(req.body.quantityProduced);
  if (!(quantityProduced > 0)) throw new AppError('quantityProduced must be greater than zero', 400);
  const warehouse = await resolveWarehouse(req, req.body.warehouseId);
  const deductions = [];

  for (const ingredient of recipe.ingredients) {
    const stock = await OperationalStock.findOne(scoped(req, { warehouse: warehouse._id, sku: ingredient.sku }));
    const rawNeeded = Number(ingredient.consumptionPerPiece) * quantityProduced;
    const required = stock ? convertUnits(rawNeeded, ingredient.unitOfMeasure, stock.unitOfMeasure) : rawNeeded;
    if (!stock || stock.currentQuantity < required) {
      throw new AppError(`Insufficient stock for ${ingredient.itemName}`, 400);
    }
    deductions.push({ stock, required: round(required), ingredient });
  }

  await Promise.all(deductions.map(({ stock, required }) => OperationalStock.updateOne(
    scoped(req, { _id: stock._id, currentQuantity: { $gte: required } }),
    { $inc: { currentQuantity: -required } }
  )));
  const data = await ManufacturingRun.create({
    tenantId: req.tenantId,
    runNumber: `RUN-${Date.now()}-${new mongoose.Types.ObjectId().toString().slice(-6)}`,
    recipeId: recipe._id,
    warehouse: warehouse._id,
    warehouseName: warehouse.name,
    quantityProduced,
    deductedMaterials: deductions.map(({ ingredient, required, stock }) => ({ itemName: ingredient.itemName, sku: ingredient.sku, quantityDeducted: required, unitOfMeasure: stock.unitOfMeasure }))
  });
  res.status(201).json({ success: true, message: 'Production run completed', data });
});

exports.getInventoryAndAlerts = asyncHandler(async (req, res) => {
  const inventory = await OperationalStock.find(scoped(req)).populate('warehouse', 'name locationType parentLocation isActive').sort({ createdAt: -1 });
  const lowStockAlerts = inventory.filter((stock) => stock.currentQuantity <= stock.safetyStockThreshold);
  res.json({ success: true, totalItems: inventory.length, alertsCount: lowStockAlerts.length, inventory, lowStockAlerts });
});
