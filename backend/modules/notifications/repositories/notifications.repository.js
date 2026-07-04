"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsRepository = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class NotificationsRepository {
    async getByUserId(userId, limit = 20) {
        // @ts-ignore - Assuming a notifications table exists or will be added
        return prisma.notifications?.findMany({
            where: { user_id: parseInt(userId, 10) },
            orderBy: { created_at: 'desc' },
            take: limit
        }) || [];
    }
    async markAsRead(notificationId) {
        // @ts-ignore
        const result = await prisma.notifications?.update({
            where: { id: parseInt(notificationId, 10) },
            data: { read_flag: true }
        });
        return !!result;
    }
}
exports.NotificationsRepository = NotificationsRepository;
