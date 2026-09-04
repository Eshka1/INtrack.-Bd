const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        action: {
            type: String,
            required: true,
            trim: true
        },
        entity: {
            type: String,
            default: null,
            trim: true
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        ipAddress: {
            type: String,
            default: null
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        versionKey: false
    }
);

activityLogSchema.index({ tenantId: 1, createdAt: -1 });

module.exports =
    mongoose.models.ActivityLog ||
    mongoose.model("ActivityLog", activityLogSchema);
