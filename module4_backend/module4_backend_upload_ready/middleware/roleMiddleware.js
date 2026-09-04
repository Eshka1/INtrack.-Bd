/**
 * Role-based access middleware.
 *
 * Usage:
 * router.get(
 *   "/admin/companies",
 *   authMiddleware,
 *   roleMiddleware("super_admin"),
 *   controller.getAllCompanies
 * );
 */
function roleMiddleware(...allowedRoles) {

    return function checkRole(req, res, next) {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const userRole =
            typeof req.user.role === "string"
                ? req.user.role
                : req.user.role?.name ||
                  req.user.role?.roleName ||
                  req.user.role?.role_name;

        if (!userRole) {
            return res.status(403).json({
                success: false,
                message: "User role is missing"
            });
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource"
            });
        }

        return next();
    };
}

module.exports = roleMiddleware;