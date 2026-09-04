const Notification = require("../models/Notification");

class NotificationService {

    async createNotification(data) {

        return await Notification.create(data);

    }


    async getNotifications(tenantId) {

        return await Notification.find({
            tenantId: tenantId
        }).sort({
            createdAt: -1
        });

    }


    async markAsRead(id) {

        return await Notification.findByIdAndUpdate(
            id,
            {
                read: true
            },
            {
                new: true
            }
        );

    }


    async createZeroActivityNotification(tenantId) {

        return await Notification.create({

            tenantId,

            type: "ZERO_ACTIVITY",

            message:
            "No activity detected in the last 24 hours"

        });

    }

}

module.exports = new NotificationService();