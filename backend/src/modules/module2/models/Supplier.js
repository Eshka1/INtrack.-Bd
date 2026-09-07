const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, trim: true },
  unit: { type: String, default: 'kg', trim: true },
  unitPrice: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'USD', enum: ['BDT', 'USD', 'EUR', 'GBP'], uppercase: true, trim: true }
}, { _id: false });

const supplierSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  contactEmail: { type: String, default: '', trim: true, lowercase: true },
  phone: { type: String, default: '', trim: true },
  leadTimeDays: { type: Number, default: 3, min: 0 },
  reliabilityScore: { type: Number, default: 5, min: 1, max: 5 },
  products: { type: [productSchema], default: [] }
}, { timestamps: true });

supplierSchema.index({ tenantId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Module2Supplier', supplierSchema);
