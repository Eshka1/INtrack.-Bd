const superAdminService = require("../services/superAdminService");

class SuperAdminController {

    async getAllCompanies(req, res) {
        try {
            if (!req.user || req.user.role !== "super_admin") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            const companies =
                await superAdminService.getCompanies();

            return res.status(200).json({
                success: true,
                data: companies
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    async updateSubscription(req, res) {
        try {
            const updated =
                await superAdminService.updateSubscription(
                    req.params.id,
                    req.body.plan
                );

            return res.status(200).json({
                success: true,
                data: updated
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    async getAnalytics(req, res) {
        try {
            const analytics =
                await superAdminService.getAnalytics();

            return res.status(200).json({
                success: true,
                data: analytics
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new SuperAdminController();