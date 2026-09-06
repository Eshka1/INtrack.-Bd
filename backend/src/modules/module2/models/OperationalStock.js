const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', index: true },
  warehouseName: { type: String, default: 'Main Warehouse', trim: true },
  itemName: { type: String, required: true, trim: true },
  sku: { type: String, required: true, trim: true },
  unitOfMeasure: { type: String, default: 'kg', trim: true },
  currentQuantity: { type: Number, default: 0, min: 0 },
  safetyStockThreshold: { type: Number, default: 10, min: 0 }
}, { timestamps: true });

schema.index({ tenantId: 1, warehouse: 1, sku: 1 }, { unique: true, partialFilterExpression: { warehouse: { $type: 'objectId' } } });
module.exports = mongoose.model('Module2OperationalStock', schema);
