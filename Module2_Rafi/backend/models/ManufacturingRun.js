const mongoose = require('mongoose');

const manufacturingRunSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, default: 'comp_default' },
    runNumber: { type: String, required: true, unique: true },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
    warehouseName: { type: String, default: 'Main Warehouse' },
    quantityProduced: { type: Number, required: true, min: 1 },
    deductedMaterials: [
      {
        itemName: { type: String },
        sku: { type: String },
        quantityDeducted: { type: Number },
        unitOfMeasure: { type: String },
      },
    ],
    status: { type: String, enum: ['COMPLETED', 'FAILED'], default: 'COMPLETED' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ManufacturingRun', manufacturingRunSchema);