const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
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
        type: {
            type: String,
            enum: ["ZERO_ACTIVITY", "SYSTEM"],
            default: "ZERO_ACTIVITY",
            required: true
        },
        title: {
            type: String,
            default: "Zero Activity Detected",
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

notificationSchema.index({ tenantId: 1, createdAt: -1 });

module.exports =
    mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);
