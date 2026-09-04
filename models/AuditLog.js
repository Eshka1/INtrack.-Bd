const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({

    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    entity: {
        type: String,
        required: true
    },

    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },

    action: {
        type: String,
        required: true,
        enum: [
            "CREATE",
            "UPDATE",
            "DELETE",
            "EXPORT",
            "LOGIN"
        ]
    },

    oldValue: {
        type: Object,
        default: null
    },

    newValue: {
        type: Object,
        default: null
    },

    ipAddress: {
        type: String,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});


module.exports = mongoose.model(
    "AuditLog",
    AuditLogSchema
);