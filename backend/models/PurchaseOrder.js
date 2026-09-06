const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    trim: true,
    default: function () {
      return this.name || 'Purchased Item';
    }
  },
  name: { type: String, trim: true }, // UI fallback
  sku: {
    type: String,
    trim: true,
    default: function () {
      return `PO-SKU-${Math.floor(100 + Math.random() * 900)}`;
    }
  },
  orderedQuantity: {
    type: Number,
    min: 0.001,
    default: function () {
      return this.quantity || 1;
    }
  },
  quantity: { type: Number }, // UI fallback
  receivedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  unitCost: {
    type: Number,
    min: 0,
    default: function () {
      return this.cost || this.price || 0;
    }
  },
  cost: { type: Number }, // UI fallback
  price: { type: Number }, // UI fallback
  unitOfMeasure: {
    type: String,
    default: function () {
      return this.unit || 'kg';
    }
  },
  unit: { type: String } // UI fallback
});

// Synchronize UI-aliased item fields
poItemSchema.pre('validate', function (next) {
  if (!this.itemName && this.name) this.itemName = this.name;
  if (!this.name && this.itemName) this.name = this.itemName;
  if (!this.orderedQuantity && this.quantity) this.orderedQuantity = this.quantity;
  if (!this.quantity && this.orderedQuantity) this.quantity = this.orderedQuantity;
  if (this.unitCost === undefined && this.price !== undefined) this.unitCost = this.price;
  if (this.unitCost === undefined && this.cost !== undefined) this.unitCost = this.cost;
  if (!this.unitOfMeasure && this.unit) this.unitOfMeasure = this.unit;
  next();
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    companyId: {
      type: String,
      default: 'comp_default'
    },
    poNumber: {
      type: String,
      trim: true
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    warehouseName: {
      type: String,
      default: 'Main Warehouse'
    },
    items: [poItemSchema],
    totalCost: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'RECEIVED', 'CANCELLED'],
      default: 'PENDING'
    },
    deliverySlipNumber: {
      type: String,
      trim: true
    },
    verifiedWeight: {
      type: Number,
      default: 0
    },
    receivedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

// Auto-generate poNumber if omitted and recalculate totalCost
purchaseOrderSchema.pre('validate', function (next) {
  if (!this.poNumber) {
    this.poNumber = `PO-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  }
  if (Array.isArray(this.items) && this.items.length > 0) {
    this.totalCost = this.items.reduce((sum, item) => {
      const q = Number(item.orderedQuantity || item.quantity || 0);
      const c = Number(item.unitCost || item.price || item.cost || 0);
      return sum + q * c;
    }, 0);
  }
  next();
});

// Multi-tenant sparse compound index
purchaseOrderSchema.index({ companyId: 1, poNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);