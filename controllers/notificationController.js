const notificationService = require("../services/notificationService");

class NotificationController {

    async getNotifications(req, res) {
        try {
            const notifications =
                await notificationService.getNotifications(req.tenantId);

            return res.status(200).json({
                success: true,
                data: notifications
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }


    async markNotificationRead(req, res) {
        try {
            const notification =
                await notificationService.markAsRead(req.params.id);

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message: "Notification not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: notification
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = new NotificationController();