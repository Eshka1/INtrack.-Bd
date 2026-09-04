const mongoose = require('mongoose');

const locationStockSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, default: 'comp_default' },
    warehouseName: { type: String, required: true, default: 'Main Warehouse' },
    itemName: { type: String, required: true, trim: true },
    sku: { type: String, required: true },
    unitOfMeasure: { type: String, default: 'kg' },
    currentQuantity: { type: Number, default: 0, min: 0 },
    safetyStockThreshold: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LocationStock', locationStockSchema);