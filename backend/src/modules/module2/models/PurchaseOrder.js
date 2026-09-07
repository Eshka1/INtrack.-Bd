const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  sku: { type: String, required: true, trim: true },
  orderedQuantity: { type: Number, required: true, min: 0.001 },
  receivedQuantity: { type: Number, default: 0, min: 0 },
  unitCost: { type: Number, required: true, min: 0 },
  unitOfMeasure: { type: String, default: 'kg', trim: true }
}, { _id: false });

const receiptSchema = new mongoose.Schema({
  receiptReference: { type: String, required: true, trim: true },
  receivedItems: [{ sku: String, quantity: Number, amount: Number, normalizedAmount: Number }],
  amount: { type: Number, required: true, min: 0 },
  normalizedAmount: { type: Number, required: true, min: 0 },
  receivedAt: { type: Date, default: Date.now },
  expenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }
}, { _id: false });

const schema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  poNumber: { type: String, required: true, trim: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module2Supplier', required: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', index: true },
  warehouseName: { type: String, default: 'Main Warehouse', trim: true },
  items: { type: [itemSchema], validate: [(items) => items.length > 0, 'At least one item is required'] },
  totalCost: { type: Number, default: 0, min: 0 },
  currency: { type: String, required: true, default: 'USD', enum: ['BDT', 'USD', 'EUR', 'GBP'], uppercase: true },
  normalizedTotalCost: { type: Number, default: 0, min: 0 },
  exchangeRateSnapshot: { type: Number, default: 1, min: 0 },
  receipts: { type: [receiptSchema], default: [] },
  status: { type: String, enum: ['PENDING', 'PARTIAL', 'RECEIVED', 'CANCELLED'], default: 'PENDING' },
  deliverySlipNumber: { type: String, default: '', trim: true },
  verifiedWeight: { type: Number, default: 0, min: 0 },
  receivedAt: Date
}, { timestamps: true });

schema.index({ tenantId: 1, poNumber: 1 }, { unique: true });
schema.index({ tenantId: 1, 'receipts.receiptReference': 1 });
module.exports = mongoose.model('Module2PurchaseOrder', schema);
