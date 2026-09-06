const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  runNumber: { type: String, required: true },
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module2Recipe', required: true },
  warehouseName: { type: String, default: 'Main Warehouse' },
  quantityProduced: { type: Number, required: true, min: 1 },
  deductedMaterials: [{ itemName: String, sku: String, quantityDeducted: Number, unitOfMeasure: String }],
  status: { type: String, enum: ['COMPLETED', 'FAILED'], default: 'COMPLETED' }
}, { timestamps: true });

schema.index({ tenantId: 1, runNumber: 1 }, { unique: true });
module.exports = mongoose.model('Module2ManufacturingRun', schema);
