const mongoose = require('mongoose');

const SupplierProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  unit: { type: String, default: 'kg' },
  unitPrice: { type: Number, required: true, min: 0 }
});

const SupplierSchema = new mongoose.Schema(
  {
    companyId: { type: String, default: 'comp_default' },
    name: { type: String, required: true, trim: true },
    contactEmail: { type: String },
    email: { type: String }, // Fallback for general team queries
    phone: { type: String },
    leadTimeDays: { type: Number, default: 3 },
    reliabilityScore: { type: Number, default: 5.0, min: 1.0, max: 5.0 },
    products: [SupplierProductSchema]
  },
  { timestamps: true }
);

// Keep email and contactEmail synced if one is provided
SupplierSchema.pre('validate', function (next) {
  if (this.contactEmail && !this.email) {
    this.email = this.contactEmail;
  } else if (this.email && !this.contactEmail) {
    this.contactEmail = this.email;
  }
  next();
});

module.exports = mongoose.model('Supplier', SupplierSchema);