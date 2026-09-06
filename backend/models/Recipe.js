const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  rawMaterialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LocationStock'
  },
  itemName: {
    type: String,
    trim: true,
    default: function () {
      return this.name || 'Raw Material';
    }
  },
  name: { type: String, trim: true }, // UI fallback
  sku: {
    type: String,
    trim: true,
    default: function () {
      return `ING-${Math.floor(100 + Math.random() * 900)}`;
    }
  },
  consumptionPerPiece: {
    type: Number,
    min: 0.0001,
    default: function () {
      return this.quantityRequired || 1;
    }
  },
  quantityRequired: { type: Number }, // UI fallback
  unitOfMeasure: {
    type: String,
    default: function () {
      return this.unit || 'kg';
    }
  },
  unit: { type: String } // UI fallback
});

// Sync aliased ingredient fields
ingredientSchema.pre('validate', function (next) {
  if (!this.itemName && this.name) this.itemName = this.name;
  if (!this.name && this.itemName) this.name = this.itemName;
  if (!this.consumptionPerPiece && this.quantityRequired) this.consumptionPerPiece = this.quantityRequired;
  if (!this.quantityRequired && this.consumptionPerPiece) this.quantityRequired = this.consumptionPerPiece;
  if (!this.unitOfMeasure && this.unit) this.unitOfMeasure = this.unit;
  if (!this.unit && this.unitOfMeasure) this.unit = this.unitOfMeasure;
  next();
});

const recipeSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      default: 'comp_default'
    },
    productName: {
      type: String,
      trim: true,
      default: function () {
        return this.name;
      }
    },
    name: { type: String, trim: true }, // UI fallback
    productSku: {
      type: String,
      trim: true
    },
    batchYieldQuantity: {
      type: Number,
      default: 1,
      min: 1
    },
    outputQuantity: {
      type: Number,
      default: 1
    },
    outputUnit: {
      type: String,
      default: 'pcs'
    },
    ingredients: [ingredientSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Sync root-level name and productName
recipeSchema.pre('validate', function (next) {
  if (!this.productName && this.name) this.productName = this.name;
  if (!this.name && this.productName) this.name = this.productName;
  if (!this.productSku && this.productName) {
    this.productSku = `SKU-${this.productName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}-${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

// Sparse index to allow optional or company-scoped SKUs without collision
recipeSchema.index({ companyId: 1, productSku: 1 }, { sparse: true });

module.exports = mongoose.model('Recipe', recipeSchema);