"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const notifications_repository_1 = require("../repositories/notifications.repository");
class NotificationsService {
    repository;
    constructor() {
        this.repository = new notifications_repository_1.NotificationsRepository();
    }
    async getUserNotifications(userId) {
        return this.repository.getByUserId(userId);
    }
    async markNotificationRead(notificationId) {
        return this.repository.markAsRead(notificationId);
    }
}
exports.NotificationsService = NotificationsService;
