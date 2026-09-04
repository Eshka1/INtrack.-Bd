const superAdminService = require("../services/superAdminService");

class SuperAdminController {

    // ===============================
    // Get All Registered Companies
    // ===============================
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

            console.error("GET COMPANIES ERROR:");
            console.error(error.stack);

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    // ===============================
    // Update Tenant Subscription
    // ===============================
    async updateSubscription(req, res) {
        try {

            const tenantId = req.params.id;
            const plan = req.body.plan;

            // Basic validation
            if (!tenantId) {
                return res.status(400).json({
                    success: false,
                    message: "Tenant ID is required"
                });
            }

            if (!plan) {
                return res.status(400).json({
                    success: false,
                    message: "Subscription plan is required"
                });
            }

            const allowedPlans = [
                "Basic",
                "Premium",
                "Enterprise"
            ];

            if (!allowedPlans.includes(plan)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid subscription plan"
                });
            }

            const updated =
                await superAdminService.updateSubscription(
                    tenantId,
                    plan
                );

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: "Subscription not found for this tenant"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Subscription updated successfully",
                data: updated
            });

        } catch (error) {

            console.error(
                "UPDATE SUBSCRIPTION ERROR:"
            );

            console.error(error.stack);

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    // ===============================
    // Get Cross-Tenant Analytics
    // ===============================
    async getAnalytics(req, res) {
        try {

            const analytics =
                await superAdminService.getAnalytics();

            return res.status(200).json({
                success: true,
                data: analytics
            });

        } catch (error) {

            console.error("GET ANALYTICS ERROR:");
            console.error(error.stack);

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = new SuperAdminController();