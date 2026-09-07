const mongoose = require('mongoose');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const Recipe = require('../models/Recipe');
const ManufacturingRun = require('../models/ManufacturingRun');
const OperationalStock = require('../models/OperationalStock');
const Warehouse = require('../../../../models/Warehouse');
const { Expense } = require('../../finance/models/Expense');
const { AccountPayable } = require('../../finance/models/AccountPayable');
const { getOrCreateCurrencySetting } = require('../../finance/services/currencyService');
const { convertCurrency, roundMoney } = require('../../finance/utils/money');
const { calculateAgingAndStatus } = require('../../finance/utils/aging');
const { convertUnits } = require('../utils/units');
const { AppError } = require('../../../../utils/errorHandler');
const asyncHandler = require('../../../../utils/asyncHandler');

const scoped = (req, extra = {}) => ({ ...extra, tenantId: req.tenantId });
const round = (value) => Number(Number(value).toFixed(4));

const currencyContext = async (tenantId) => {
  const setting = await getOrCreateCurrencySetting(tenantId);
  return {
    displayCurrency: setting.displayCurrency || 'BDT',
    rates: setting.exchangeRates instanceof Map ? Object.fromEntries(setting.exchangeRates) : setting.exchangeRates
  };
};
const presentSupplier = (supplier, displayCurrency, rates) => {
  const data = supplier.toObject ? supplier.toObject() : supplier;
  return {
    ...data,
    products: (data.products || []).map((product) => {
      const currency = product.currency || 'USD';
      return { ...product, currency, displayUnitPrice: convertCurrency(product.unitPrice, currency, displayCurrency, rates), displayCurrency };
    })
  };
};

const resolveWarehouse = async (req, warehouseId, session) => {
  if (!warehouseId || !mongoose.isValidObjectId(warehouseId)) {
    throw new AppError('A valid warehouseId is required', 400);
  }
  const warehouse = await Warehouse.findOne(scoped(req, { _id: warehouseId, isActive: true })).session(session || null);
  if (!warehouse) throw new AppError('Storage destination not found', 404);
  return warehouse;
};

exports.getSuppliers = asyncHandler(async (req, res) => {
  const [data, money] = await Promise.all([Supplier.find(scoped(req)).sort({ createdAt: -1 }), currencyContext(req.tenantId)]);
  res.json({ success: true, count: data.length, displayCurrency: money.displayCurrency, data: data.map((supplier) => presentSupplier(supplier, money.displayCurrency, money.rates)) });
});

exports.createSupplier = asyncHandler(async (req, res) => {
  const money = await currencyContext(req.tenantId);
  const products = (req.body.products || []).map((product) => ({ ...product, currency: product.currency || money.displayCurrency }));
  const data = await Supplier.create({ ...req.body, products, tenantId: req.tenantId });
  res.status(201).json({ success: true, displayCurrency: money.displayCurrency, data: presentSupplier(data, money.displayCurrency, money.rates) });
});

exports.updateSupplier = asyncHandler(async (req, res) => {
  const updates = { ...req.body };
  delete updates.tenantId;
  delete updates._id;
  const money = await currencyContext(req.tenantId);
  if (updates.products) updates.products = updates.products.map((product) => ({ ...product, currency: product.currency || money.displayCurrency }));
  const data = await Supplier.findOneAndUpdate(scoped(req, { _id: req.params.id }), updates, { new: true, runValidators: true });
  if (!data) throw new AppError('Supplier not found', 404);
  res.json({ success: true, displayCurrency: money.displayCurrency, data: presentSupplier(data, money.displayCurrency, money.rates) });
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
  const money = await currencyContext(req.tenantId);
  const currencies = [...new Set(items.map((item) => (item.currency || req.body.currency || money.displayCurrency).toUpperCase()))];
  if (currencies.length !== 1) throw new AppError('All purchase order items must use the same currency', 400);
  const currency = currencies[0];
  if (!money.rates[currency]) throw new AppError(`Unsupported currency: ${currency}`, 400);
  const normalizedItems = items.map((item) => {
    const catalogProduct = supplier.products.find((product) => product.sku === item.sku);
    if (!catalogProduct) throw new AppError(`SKU ${item.sku} is not in the selected supplier catalog`, 400);
    const catalogCurrency = catalogProduct.currency || 'USD';
    return {
      itemName: catalogProduct.name,
      sku: catalogProduct.sku,
      orderedQuantity: item.orderedQuantity,
      receivedQuantity: 0,
      unitCost: convertCurrency(catalogProduct.unitPrice, catalogCurrency, currency, money.rates),
      unitOfMeasure: catalogProduct.unit
    };
  });
  const totalCost = round(normalizedItems.reduce((sum, item) => sum + Number(item.orderedQuantity) * Number(item.unitCost), 0));
  const normalizedTotalCost = convertCurrency(totalCost, currency, 'BDT', money.rates);
  const payload = { ...req.body };
  delete payload.warehouseId;
  delete payload.warehouseName;
  const data = await PurchaseOrder.create({ ...payload, tenantId: req.tenantId, warehouse: warehouse._id, warehouseName: warehouse.name, items: normalizedItems, totalCost, currency, normalizedTotalCost, exchangeRateSnapshot: money.rates[currency] });
  res.status(201).json({ success: true, data });
});

exports.ingestShipment = asyncHandler(async (req, res) => {
  const receiptReference = String(req.body.receiptReference || '').trim();
  if (!receiptReference) throw new AppError('receiptReference is required', 400);
  const existing = await PurchaseOrder.findOne(scoped(req, { _id: req.params.poId, 'receipts.receiptReference': receiptReference }));
  if (existing) return res.json({ success: true, duplicate: true, message: 'Shipment receipt was already processed', data: existing });
  const receivedItems = Array.isArray(req.body.receivedItems) ? req.body.receivedItems : [];
  if (!receivedItems.length) throw new AppError('receivedItems is required', 400);
  const money = await currencyContext(req.tenantId);
  let result;
  const processReceipt = async (session) => {
      const po = await PurchaseOrder.findOne(scoped(req, { _id: req.params.poId })).session(session);
      if (!po) throw new AppError('Purchase order not found', 404);
      if (po.receipts.some((receipt) => receipt.receiptReference === receiptReference)) { result = po; return; }
      if (po.status === 'CANCELLED' || po.status === 'RECEIVED') throw new AppError('Purchase order cannot receive more goods', 400);
      const warehouse = await resolveWarehouse(req, po.warehouse, session);
      const receiptItems = [];
      for (const received of receivedItems) {
        const poItem = po.items.find((item) => item.sku === received.sku);
        if (!poItem) throw new AppError(`SKU ${received.sku} is not part of this purchase order`, 400);
        const quantity = Number(received.quantity);
        if (!(quantity > 0)) throw new AppError('Received quantities must be greater than zero', 400);
        if (round(poItem.receivedQuantity + quantity) > poItem.orderedQuantity) throw new AppError(`Received quantity exceeds the remaining quantity for ${received.sku}`, 400);
        const amount = roundMoney(quantity * poItem.unitCost);
        receiptItems.push({ received, poItem, quantity, amount, normalizedAmount: convertCurrency(amount, po.currency || 'USD', 'BDT', money.rates) });
      }
      const amount = roundMoney(receiptItems.reduce((sum, item) => sum + item.amount, 0));
      const normalizedAmount = roundMoney(receiptItems.reduce((sum, item) => sum + item.normalizedAmount, 0));
      for (const item of receiptItems) {
        item.poItem.receivedQuantity = round(item.poItem.receivedQuantity + item.quantity);
        await OperationalStock.findOneAndUpdate(
          scoped(req, { warehouse: warehouse._id, sku: item.received.sku }),
          { $inc: { currentQuantity: item.quantity }, $set: { warehouseName: warehouse.name }, $setOnInsert: { itemName: item.poItem.itemName, unitOfMeasure: item.poItem.unitOfMeasure } },
          { upsert: true, new: true, runValidators: true, session }
        );
      }
      const now = new Date();
      const currency = po.currency || 'USD';
      const [expense] = await Expense.create([{
        companyId: req.tenantId, title: `PO Receipt ${po.poNumber}`, description: `Raw materials received for ${po.poNumber}`,
        category: 'Raw Materials', amount, currency, normalizedAmount, exchangeRateSnapshot: money.rates[currency], expenseDate: now,
        createdBy: String(req.user._id), createdByRole: req.user.role?.name || req.user.role || 'Staff', notes: req.body.deliverySlipNumber ? `Delivery slip: ${req.body.deliverySlipNumber}` : '',
        sourceType: 'module2-po-receipt', sourceId: String(po._id), sourceReference: receiptReference
      }], { session });
      const dueDate = new Date(now); dueDate.setUTCDate(dueDate.getUTCDate() + 30);
      const supplier = await Supplier.findOne(scoped(req, { _id: po.supplierId })).session(session);
      const existingPayable = await AccountPayable.findOne({ companyId: req.tenantId, purchaseOrderId: String(po._id) }).session(session);
      if (existingPayable) {
        existingPayable.totalAmount = roundMoney(existingPayable.totalAmount + amount);
        existingPayable.outstandingAmount = roundMoney(existingPayable.outstandingAmount + amount);
        existingPayable.normalizedTotalAmount = roundMoney(existingPayable.normalizedTotalAmount + normalizedAmount);
        existingPayable.normalizedOutstandingAmount = roundMoney(existingPayable.normalizedOutstandingAmount + normalizedAmount);
        await existingPayable.save({ session });
      } else {
        const state = calculateAgingAndStatus({ totalAmount: amount, paidAmount: 0, dueDate, referenceDate: now });
        await AccountPayable.create([{
          companyId: req.tenantId, supplierId: String(po.supplierId), supplierName: supplier?.name || 'Supplier', purchaseOrderId: String(po._id), purchaseOrderNumber: po.poNumber,
          invoiceNumber: po.poNumber, totalAmount: amount, paidAmount: 0, outstandingAmount: amount, currency,
          normalizedTotalAmount: normalizedAmount, normalizedPaidAmount: 0, normalizedOutstandingAmount: normalizedAmount, exchangeRateSnapshot: money.rates[currency],
          issueDate: now, dueDate, paymentTerms: 'Net 30', status: state.status, agingGroup: state.agingGroup, createdBy: String(req.user._id)
        }], { session });
      }
      po.deliverySlipNumber = req.body.deliverySlipNumber || po.deliverySlipNumber;
      po.verifiedWeight = Number(req.body.verifiedWeight || po.verifiedWeight || 0);
      po.receivedAt = now;
      po.status = po.items.every((item) => item.receivedQuantity >= item.orderedQuantity) ? 'RECEIVED' : 'PARTIAL';
      po.receipts.push({ receiptReference, receivedItems: receiptItems.map((item) => ({ sku: item.received.sku, quantity: item.quantity, amount: item.amount, normalizedAmount: item.normalizedAmount })), amount, normalizedAmount, receivedAt: now, expenseId: expense._id });
      result = await po.save({ session });
  };
  const topology = await mongoose.connection.db.admin().command({ hello: 1 });
  if (topology.setName) {
    const session = await mongoose.startSession();
    try { await session.withTransaction(() => processReceipt(session)); }
    finally { await session.endSession(); }
  } else {
    await processReceipt(null);
  }
  res.json({ success: true, message: 'Shipment ingested; stock, expense, and payable updated', data: result });
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
