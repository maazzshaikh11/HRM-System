import { NotificationsService } from '../services/notifications.service';

describe('NotificationsService', () => {
  let notificationsService: NotificationsService;

  beforeEach(() => {
    notificationsService = new NotificationsService();
    (notificationsService as any).repository = {
      getByUserId: jest.fn().mockResolvedValue([
        { id: '1', title: 'Leave Approved', read: false }
      ]),
      markAsRead: jest.fn().mockResolvedValue(true)
    };
  });

  it('should get user notifications', async () => {
    const notifs = await notificationsService.getUserNotifications('emp-123');
    expect(notifs.length).toBe(1);
    expect(notifs[0].title).toBe('Leave Approved');
  });

  it('should mark notification as read', async () => {
    const success = await notificationsService.markNotificationRead('1');
    expect(success).toBe(true);
  });
});
