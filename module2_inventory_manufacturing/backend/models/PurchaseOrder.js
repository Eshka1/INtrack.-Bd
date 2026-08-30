const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  sku: { type: String, required: true },
  orderedQuantity: { type: Number, required: true, min: 0.001 },
  receivedQuantity: { type: Number, default: 0, min: 0 },
  unitCost: { type: Number, required: true, min: 0 },
  unitOfMeasure: { type: String, required: true, default: 'kg' },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, default: 'comp_default' },
    poNumber: { type: String, required: true, unique: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    warehouseName: { type: String, default: 'Main Warehouse' },
    items: [poItemSchema],
    totalCost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'RECEIVED', 'CANCELLED'],
      default: 'PENDING',
    },
    deliverySlipNumber: { type: String, trim: true },
    verifiedWeight: { type: Number, default: 0 },
    receivedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);