const auditService = require("../services/auditService");

class AuditController {

    async createAuditLog(req, res) {
        try {
            if (!req.user || !req.tenantId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized access"
                });
            }

            const { entity, action, oldValue, newValue } = req.body;

            if (!entity || !action) {
                return res.status(400).json({
                    success: false,
                    message: "Entity and action are required"
                });
            }

            const audit = await auditService.createAuditLog({
                tenantId: req.tenantId,
                userId: req.user._id,
                entity,
                action,
                oldValue: oldValue || null,
                newValue: newValue || null
            });

            return res.status(201).json({
                success: true,
                message: "Audit log created successfully",
                data: audit
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    async getAuditLogs(req, res) {
        try {
            if (!req.tenantId) {
                return res.status(401).json({
                    success: false,
                    message: "Tenant information missing"
                });
            }

            const logs = await auditService.getAuditLogs(req.tenantId);

            return res.status(200).json({
                success: true,
                count: logs.length,
                data: logs
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    async getAuditById(req, res) {
        try {
            const audit = await auditService.getAuditById(
                req.params.id,
                req.tenantId
            );

            if (!audit) {
                return res.status(404).json({
                    success: false,
                    message: "Audit record not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: audit
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new AuditController();