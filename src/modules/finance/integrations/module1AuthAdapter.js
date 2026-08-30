function module1AuthMiddleware(req, res, next) {
  if (req.auth && req.auth.companyId && req.auth.userId) {
    return next();
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const isDevBypassEnabled = process.env.DEV_AUTH_BYPASS === 'true';

  if (isProduction || !isDevBypassEnabled) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Authorization token is missing or invalid.'
    });
  }

  const userId = req.headers['x-user-id'] || process.env.DEV_TEST_USER_ID || 'usr_dev_finance_01';
  const companyId = req.headers['x-company-id'] || process.env.DEV_TEST_COMPANY_ID || 'cmp_dev_intrack_01';
  const role = req.headers['x-role'] || process.env.DEV_TEST_ROLE || 'Finance Manager';

  let permissions = [
    'finance.read',
    'finance.create',
    'finance.update',
    'finance.delete'
  ];

  if (role === 'Viewer') {
    permissions = ['finance.read'];
  } else if (req.headers['x-permissions']) {
    try {
      permissions = JSON.parse(req.headers['x-permissions']);
    } catch {
      permissions = req.headers['x-permissions'].split(',').map(p => p.trim());
    }
  }

  req.auth = {
    userId,
    companyId,
    role,
    permissions
  };

  next();
}

module.exports = {
  module1AuthMiddleware
};
