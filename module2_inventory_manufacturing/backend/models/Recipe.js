const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  sku: { type: String, required: true },
  consumptionPerPiece: { type: Number, required: true, min: 0.0001 }, // Supports decimals like 0.25 kg
  unitOfMeasure: { type: String, required: true },
});

const recipeSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, default: 'comp_default' },
    productName: { type: String, required: true, trim: true },
    productSku: { type: String, required: true, unique: true },
    batchYieldQuantity: { type: Number, default: 1, min: 1 },
    ingredients: [ingredientSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);