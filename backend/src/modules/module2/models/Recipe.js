const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  sku: { type: String, required: true, trim: true },
  consumptionPerPiece: { type: Number, required: true, min: 0.0001 },
  unitOfMeasure: { type: String, required: true, trim: true }
}, { _id: false });

const schema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  productName: { type: String, required: true, trim: true },
  productSku: { type: String, required: true, trim: true },
  batchYieldQuantity: { type: Number, default: 1, min: 1 },
  ingredients: { type: [ingredientSchema], validate: [(items) => items.length > 0, 'At least one ingredient is required'] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

schema.index({ tenantId: 1, productSku: 1 }, { unique: true });
module.exports = mongoose.model('Module2Recipe', schema);
