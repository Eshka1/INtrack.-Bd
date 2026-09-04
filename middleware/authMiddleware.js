const mongoose = require("mongoose");

/**
 * Module 4 authentication compatibility middleware.
 *
 * Integration behavior:
 * 1. If the team's existing auth middleware already populated req.user
 *    and req.tenantId, this middleware keeps those values.
 * 2. In development only, it can create a safe dummy authenticated context
 *    so Module 4 can be run and demonstrated before the final group auth
 *    layer is merged.
 * 3. In production, missing authentication is rejected.
 */
function authMiddleware(req, res, next) {

    // Existing team authentication already ran successfully.
    if (req.user && req.tenantId) {
        return next();
    }

    const isProduction =
        process.env.NODE_ENV === "production";

    if (isProduction) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    // Development/testing fallback.
    // These are valid MongoDB ObjectId-shaped values.
    const defaultTenantId =
        process.env.DEV_TENANT_ID ||
        "64b000000000000000000001";

    const defaultUserId =
        process.env.DEV_USER_ID ||
        "64b000000000000000000002";

    const role =
        req.headers["x-user-role"] ||
        process.env.DEV_USER_ROLE ||
        "super_admin";

    if (!mongoose.Types.ObjectId.isValid(defaultTenantId)) {
        return res.status(500).json({
            success: false,
            message: "DEV_TENANT_ID must be a valid MongoDB ObjectId"
        });
    }

    if (!mongoose.Types.ObjectId.isValid(defaultUserId)) {
        return res.status(500).json({
            success: false,
            message: "DEV_USER_ID must be a valid MongoDB ObjectId"
        });
    }

    req.tenantId = defaultTenantId;

    req.user = {
        _id: defaultUserId,
        role
    };

    return next();
}

module.exports = authMiddleware;