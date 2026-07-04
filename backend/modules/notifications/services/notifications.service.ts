import { NotificationsRepository } from '../repositories/notifications.repository';
import { INotification } from '../types/notifications.types';

export class NotificationsService {
  private repository: NotificationsRepository;

  constructor() {
    this.repository = new NotificationsRepository();
  }

  async getUserNotifications(userId: string): Promise<INotification[]> {
    return this.repository.getByUserId(userId);
  }

  async markNotificationRead(notificationId: string): Promise<boolean> {
    return this.repository.markAsRead(notificationId);
  }
}
