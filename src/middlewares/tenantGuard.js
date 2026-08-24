const tenantGuard = (req, res, next) => {
  // Allow superadmins to bypass tenant data boundaries
  if (req.user?.isSuperAdmin) return next();

  if (!req.user?.company_id) {
    return res.status(403).json({
      success: false,
      message: 'Tenant context identification missing.'
    });
  }

  // Bind tenant identifier for controller queries
  req.tenantFilter = { company_id: req.user.company_id };

  // Guard against URL-based cross-tenant parameter spoofing
  if (req.params.company_id && req.params.company_id !== req.user.company_id) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized cross-tenant operation detected.'
    });
  }

  // Force incoming mutation payloads to attach the verified company_id
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    req.body.company_id = req.user.company_id;
  }

  next();
};

module.exports = tenantGuard;