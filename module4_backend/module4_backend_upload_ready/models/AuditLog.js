const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            index: true,
            immutable: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            immutable: true
        },
        entity: {
            type: String,
            required: true,
            trim: true,
            immutable: true
        },
        action: {
            type: String,
            required: true,
            trim: true,
            immutable: true
        },
        oldValue: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
            immutable: true
        },
        newValue: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
            immutable: true
        },
        ipAddress: {
            type: String,
            default: null,
            immutable: true
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        versionKey: false
    }
);

function rejectMutation() {
    throw new Error(
        "Audit logs are append-only. Update/delete operations are not allowed."
    );
}

[
    "updateOne",
    "updateMany",
    "findOneAndUpdate",
    "deleteOne",
    "deleteMany",
    "findOneAndDelete"
].forEach((hook) => {
    auditLogSchema.pre(hook, rejectMutation);
});

auditLogSchema.index({ tenantId: 1, createdAt: -1 });

module.exports =
    mongoose.models.AuditLog ||
    mongoose.model("AuditLog", auditLogSchema);
