"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const notifications_service_1 = require("../services/notifications.service");
const notificationsService = new notifications_service_1.NotificationsService();
class NotificationsController {
    static async getMyNotifications(req, res) {
        try {
            // Assuming user ID is available on req.user after auth middleware
            const userId = req.user?.id || req.query.userId;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const notifications = await notificationsService.getUserNotifications(userId);
            res.status(200).json({ data: notifications });
        }
        catch (error) {
            console.error('[NotificationsController] Error in getMyNotifications:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
    static async markRead(req, res) {
        try {
            const { id } = req.params;
            await notificationsService.markNotificationRead(id);
            res.status(200).json({ success: true });
        }
        catch (error) {
            console.error('[NotificationsController] Error in markRead:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
}
exports.NotificationsController = NotificationsController;
