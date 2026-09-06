const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');
const asyncHandler = require('../utils/asyncHandler');
const localAuthStore = require('../utils/localAuthStore');

const localFallbackEnabled = () =>
  process.env.NODE_ENV !== 'production' &&
  String(process.env.ALLOW_LOCAL_AUTH_FALLBACK || 'true').toLowerCase() !== 'false';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized, no token provided', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError('Not authorized, token invalid or expired', 401);
  }

  const useLocal = localFallbackEnabled() &&
    (mongoose.connection.readyState !== 1 || String(decoded.id || '').startsWith('local_user_'));

  if (useLocal) {
    const user = await localAuthStore.getUserById(decoded.id);
    if (!user) throw new AppError('User no longer exists', 401);
    if (!user.isActive) throw new AppError('Your account has been deactivated', 403);
    if (!user.tenant || !user.tenant.isActive) {
      throw new AppError('Your company account is inactive. Contact support.', 403);
    }

    req.user = user;
    req.tenantId = user.tenantId;
    req.tenant = user.tenant;
    return next();
  }

  const user = await User.findById(decoded.id)
    .select('-password')
    .populate('role')
    .populate('tenant');

  if (!user || user.deletedAt) throw new AppError('User no longer exists', 401);
  if (!user.isActive) throw new AppError('Your account has been deactivated', 403);
  if (!user.tenant || !user.tenant.isActive) {
    throw new AppError('Your company account is inactive. Contact support.', 403);
  }

  req.user = user;
  req.tenantId = user.tenantId;
  req.tenant = user.tenant;
  next();
});

const superAdminOnly = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) throw new AppError('Not authorized, no token provided', 401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.isSuperAdmin) {
    throw new AppError('Not authorized to access super admin resources', 403);
  }

  req.isSuperAdmin = true;
  next();
});

module.exports = { protect, superAdminOnly };
