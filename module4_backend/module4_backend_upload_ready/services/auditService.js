const AuditLog = require("../models/AuditLog");

class AuditService {

    async createAuditLog(data) {
        return await AuditLog.create(data);
    }


    async getAuditLogs(tenantId) {
        return await AuditLog.find({
            tenantId: tenantId
        }).sort({
            createdAt: -1
        });
    }


    async getAuditById(id, tenantId) {
        return await AuditLog.findOne({
            _id: id,
            tenantId: tenantId
        });
    }


    async compareChanges(oldValue, newValue) {

        const changes = {};

        const keys = new Set([
            ...Object.keys(oldValue || {}),
            ...Object.keys(newValue || {})
        ]);

        keys.forEach(key => {

            if (
                JSON.stringify(oldValue?.[key]) !==
                JSON.stringify(newValue?.[key])
            ) {
                changes[key] = {
                    old: oldValue?.[key] ?? null,
                    new: newValue?.[key] ?? null
                };
            }

        });

        return changes;
    }

}

module.exports = new AuditService();