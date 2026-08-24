const { Role } = require('../models/Schemas');

const rbacGuard = (requiredModule, requiredAction) => {
  return async (req, res, next) => {
    // SuperAdmins and Corporate Owners bypass granular role checks
    if (req.user?.isSuperAdmin || req.user?.role === 'OWNER' || req.user?.user_type === 'OWNER') {
      return next();
    }

    try {
      const userRole = await Role.findOne({
        role_id: req.user.role_id,
        company_id: req.user.company_id
      });

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: No role permissions configured for this user.'
        });
      }

      const modulePermission = userRole.permissions.find(p => p.module === requiredModule);
      if (!modulePermission || !modulePermission.actions.includes(requiredAction)) {
        return res.status(403).json({
          success: false,
          message: `Permission denied: Missing '${requiredAction}' permission on module '${requiredModule}'.`
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'RBAC verification error.',
        error: error.message
      });
    }
  };
};

module.exports = rbacGuard;