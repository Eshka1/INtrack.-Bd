const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
            unique: true,
            index: true
        },
        plan: {
            type: String,
            enum: ["Basic", "Premium", "Enterprise"],
            default: "Basic",
            required: true
        },
        status: {
            type: String,
            enum: ["active", "expired", "cancelled", "suspended"],
            default: "active"
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date,
            default: null
        },
        monthlyPrice: {
            type: Number,
            default: 0,
            min: 0
        },
        yearlyPrice: {
            type: Number,
            default: 0,
            min: 0
        },
        overriddenBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        overrideReason: {
            type: String,
            default: null,
            trim: true
        },
        lastUpdatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Subscription ||
    mongoose.model("Subscription", subscriptionSchema);
