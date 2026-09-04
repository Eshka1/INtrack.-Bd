const mongoose = require("mongoose");

class SuperAdminService {

    async getCompanies() {
        const db = mongoose.connection.db;

        const tenants = await db
            .collection("tenants")
            .find({})
            .toArray();

        const subscriptions = await db
            .collection("subscriptions")
            .find({})
            .toArray();

        const subscriptionMap = new Map();

        subscriptions.forEach((subscription) => {
            subscriptionMap.set(
                String(subscription.tenantId),
                subscription
            );
        });

        return tenants.map((tenant) => {
            const subscription = subscriptionMap.get(
                String(tenant._id)
            );

            return {
                ...tenant,
                subscription:
                    subscription?.plan ||
                    tenant.subscription ||
                    "Basic",
                subscriptionDetails: subscription || null
            };
        });
    }

    async updateSubscription(id, plan) {
        const allowedPlans = [
            "Basic",
            "Premium",
            "Enterprise"
        ];

        if (!allowedPlans.includes(plan)) {
            throw new Error("Invalid subscription plan");
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid tenant ID");
        }

        const db = mongoose.connection.db;
        const tenantId = new mongoose.Types.ObjectId(id);
        const now = new Date();

        const tenant = await db
            .collection("tenants")
            .findOne({ _id: tenantId });

        if (!tenant) {
            throw new Error("Tenant not found");
        }

        await db
            .collection("subscriptions")
            .updateOne(
                { tenantId },
                {
                    $set: {
                        plan,
                        status: "active",
                        lastUpdatedAt: now,
                        updatedAt: now
                    },
                    $setOnInsert: {
                        tenantId,
                        startDate: now,
                        endDate: null,
                        monthlyPrice: 0,
                        yearlyPrice: 0,
                        overriddenBy: null,
                        overrideReason: null,
                        createdAt: now
                    }
                },
                { upsert: true }
            );

        await db
            .collection("tenants")
            .updateOne(
                { _id: tenantId },
                {
                    $set: {
                        subscription: plan,
                        updatedAt: now
                    }
                }
            );

        return await db
            .collection("subscriptions")
            .findOne({ tenantId });
    }

    async getAnalytics() {
        const db = mongoose.connection.db;

        const totalCompanies = await db
            .collection("tenants")
            .countDocuments();

        const premiumCompanies = await db
            .collection("subscriptions")
            .countDocuments({
                plan: "Premium",
                status: "active"
            });

        const enterpriseCompanies = await db
            .collection("subscriptions")
            .countDocuments({
                plan: "Enterprise",
                status: "active"
            });

        return {
            totalCompanies,
            activeUsers: 0,
            premiumCompanies,
            enterpriseCompanies
        };
    }
}

module.exports = new SuperAdminService();
