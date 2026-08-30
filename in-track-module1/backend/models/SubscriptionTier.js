const mongoose = require('mongoose');

// NOTE: Minimal stub so Tenant model (which references SubscriptionTier)
// works during registration. Full Subscription Tier Gatekeeping logic
// (storage limits, feature flags, billing sync) is built out in Module 1 -
// Part 5. maxMaterialTypes (Part 3) and maxWarehouses (Part 4) are already
// enforced by their respective controllers -- this is the one field each
// of those parts specifically needed, not the full gatekeeping system.
const SubscriptionTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Free', 'Starter', 'Professional', 'Enterprise'],
    default: 'Free'
  },
  maxUsers: {
    type: Number,
    default: 3
  },
  maxMaterialTypes: {
    type: Number,
    default: 50
  },
  maxWarehouses: {
    type: Number,
    default: 1
  },
  monthlyPrice: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('SubscriptionTier', SubscriptionTierSchema);
