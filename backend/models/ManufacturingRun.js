const mongoose = require('mongoose');

const manufacturingRunSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      default: 'comp_default'
    },
    runNumber: {
      type: String,
      trim: true
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    recipeName: {
      type: String,
      trim: true
    },
    warehouseName: {
      type: String,
      default: 'Main Warehouse'
    },
    quantityProduced: {
      type: Number,
      required: true,
      min: 0.0001
    },
    deductedMaterials: [
      {
        rawMaterialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LocationStock'
        },
        itemName: { type: String },
        sku: { type: String },
        quantityDeducted: { type: Number },
        unitOfMeasure: { type: String, default: 'kg' }
      }
    ],
    status: {
      type: String,
      enum: ['COMPLETED', 'IN_PROGRESS', 'FAILED'],
      default: 'COMPLETED'
    }
  },
  { timestamps: true }
);

// Automatically generate a unique runNumber if not provided
manufacturingRunSchema.pre('validate', function (next) {
  if (!this.runNumber) {
    this.runNumber = `RUN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

// Sparse index to avoid collisions on empty values
manufacturingRunSchema.index({ companyId: 1, runNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('ManufacturingRun', manufacturingRunSchema);