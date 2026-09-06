const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  sku: { type: String, required: true, trim: true },
  orderedQuantity: { type: Number, required: true, min: 0.001 },
  receivedQuantity: { type: Number, default: 0, min: 0 },
  unitCost: { type: Number, required: true, min: 0 },
  unitOfMeasure: { type: String, default: 'kg', trim: true }
}, { _id: false });

const schema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  poNumber: { type: String, required: true, trim: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module2Supplier', required: true },
  warehouseName: { type: String, default: 'Main Warehouse', trim: true },
  items: { type: [itemSchema], validate: [(items) => items.length > 0, 'At least one item is required'] },
  totalCost: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['PENDING', 'PARTIAL', 'RECEIVED', 'CANCELLED'], default: 'PENDING' },
  deliverySlipNumber: { type: String, default: '', trim: true },
  verifiedWeight: { type: Number, default: 0, min: 0 },
  receivedAt: Date
}, { timestamps: true });

schema.index({ tenantId: 1, poNumber: 1 }, { unique: true });
module.exports = mongoose.model('Module2PurchaseOrder', schema);
