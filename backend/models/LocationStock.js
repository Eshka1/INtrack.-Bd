const mongoose = require('mongoose');

/**
 * LocationStock Schema (Unified for Modules 1, 2, & 3)
 * Supports tenant-scoped warehouse tracking with references to Warehouse/AssetCategory,
 * while maintaining optional fallback fields for Module 2 direct inventory tracking.
 */
const locationStockSchema = new mongoose.Schema({
  // Multi-tenant & relational fields (Modules 1 & 3)
  tenantId: {
    type: String,
    index: true,
    default: function () {
      return this.companyId || 'comp_default';
    }
  },
  companyId: {
    type: String,
    default: 'comp_default'
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  assetCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssetCategory'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Stock values (Supports both 'quantity' and 'currentQuantity')
  quantity: {
    type: Number,
    default: 0,
    min: [0, 'Stock quantity cannot be negative']
  },
  currentQuantity: {
    type: Number,
    default: 0,
    min: 0
  },

  // Module 2 standalone / human-readable fields
  warehouseName: {
    type: String,
    default: 'Main Warehouse'
  },
  itemName: {
    type: String,
    trim: true
  },
  sku: {
    type: String
  },
  unitOfMeasure: {
    type: String,
    default: 'kg'
  },
  safetyStockThreshold: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

// Sync quantity and currentQuantity prior to validation/saving
locationStockSchema.pre('validate', function (next) {
  if (this.isModified('currentQuantity') && !this.isModified('quantity')) {
    this.quantity = this.currentQuantity;
  } else if (this.isModified('quantity') && !this.isModified('currentQuantity')) {
    this.currentQuantity = this.quantity;
  }
  if (!this.tenantId && this.companyId) {
    this.tenantId = this.companyId;
  }
  next();
});

// Sparse compound indexes (prevents null collisions when using either schema format)
locationStockSchema.index(
  { tenantId: 1, warehouse: 1, assetCategory: 1 },
  { unique: true, sparse: true }
);
locationStockSchema.index({ tenantId: 1, assetCategory: 1 }, { sparse: true });
locationStockSchema.index({ tenantId: 1, sku: 1 }, { sparse: true });

module.exports = mongoose.model('LocationStock', locationStockSchema);