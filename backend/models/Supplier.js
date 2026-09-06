import mongoose from 'mongoose';

const SupplierProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  unit: { type: String, default: 'kg' },
  unitPrice: { type: Number, required: true, min: 0 }
});

const SupplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactEmail: { type: String, required: true },
    phone: { type: String },
    leadTimeDays: { type: Number, default: 3 },
    reliabilityScore: { type: Number, default: 5.0, min: 1.0, max: 5.0 },
    products: [SupplierProductSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Supplier', SupplierSchema);