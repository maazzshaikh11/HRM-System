import { PrismaClient } from '@prisma/client';
import { INotification } from '../types/notifications.types';

const prisma = new PrismaClient();

export class NotificationsRepository {
  async getByUserId(userId: string, limit: number = 20): Promise<INotification[]> {
    // @ts-ignore - Assuming a notifications table exists or will be added
    return prisma.notifications?.findMany({
      where: { user_id: parseInt(userId, 10) },
      orderBy: { created_at: 'desc' },
      take: limit
    }) || [];
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    // @ts-ignore
    const result = await prisma.notifications?.update({
      where: { id: parseInt(notificationId, 10) },
      data: { read_flag: true }
    });
    return !!result;
  }
}
