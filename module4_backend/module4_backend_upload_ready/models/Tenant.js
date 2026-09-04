const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            sparse: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active"
        },
        subscription: {
            type: String,
            enum: ["Basic", "Premium", "Enterprise"],
            default: "Basic"
        },
        lastActivityAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Tenant ||
    mongoose.model("Tenant", tenantSchema);
