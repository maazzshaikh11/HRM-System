import { Request, Response } from 'express';
import { NotificationsService } from '../services/notifications.service';

const notificationsService = new NotificationsService();

export class NotificationsController {
  static async getMyNotifications(req: Request, res: Response): Promise<void> {
    try {
      // Assuming user ID is available on req.user after auth middleware
      const userId = (req as any).user?.id || req.query.userId; 
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const notifications = await notificationsService.getUserNotifications(userId as string);
      res.status(200).json({ data: notifications });
    } catch (error: any) {
      console.error('[NotificationsController] Error in getMyNotifications:', error);
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }

  static async markRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await notificationsService.markNotificationRead(id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('[NotificationsController] Error in markRead:', error);
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }
}
