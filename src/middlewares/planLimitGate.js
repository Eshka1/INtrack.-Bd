const { Company, Subscription, Manager, RawMaterial, Order } = require('../models/Schemas');

const planLimitGate = (resourceType) => {
  return async (req, res, next) => {
    // SuperAdmin operations are exempt from tier quotas
    if (req.user?.isSuperAdmin) return next();

    try {
      const company = await Company.findOne({ company_id: req.user.company_id });
      if (!company) {
        return res.status(404).json({ success: false, message: 'Company record not found.' });
      }

      const subscription = await Subscription.findOne({ subscription_id: company.subscription_id });
      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'No active subscription plan linked to this company.'
        });
      }

      // Check max users limit
      if (resourceType === 'users') {
        const userCount = await Manager.countDocuments({ company_id: req.user.company_id });
        if (userCount >= subscription.limits.maxUsers) {
          return res.status(403).json({
            success: false,
            message: `User limit reached (${subscription.limits.maxUsers}). Upgrade subscription to add more staff.`
          });
        }
      }

      // Check raw materials limit
      if (resourceType === 'raw_materials') {
        const materialCount = await RawMaterial.countDocuments({ company_id: req.user.company_id });
        if (materialCount >= subscription.limits.maxRawMaterials) {
          return res.status(403).json({
            success: false,
            message: `Raw material limit reached (${subscription.limits.maxRawMaterials}). Upgrade subscription to track more items.`
          });
        }
      }

      // Check orders limit
      if (resourceType === 'orders') {
        const orderCount = await Order.countDocuments({ company_id: req.user.company_id });
        if (orderCount >= subscription.limits.maxOrders) {
          return res.status(403).json({
            success: false,
            message: `Monthly order quota reached (${subscription.limits.maxOrders}). Upgrade subscription to process more orders.`
          });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Subscription plan enforcement failure.',
        error: error.message
      });
    }
  };
};

module.exports = planLimitGate;