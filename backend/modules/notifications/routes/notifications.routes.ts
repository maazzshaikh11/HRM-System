import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';

const router = Router();

const requireAuth = (req: any, res: any, next: any) => next();

router.get('/', requireAuth, NotificationsController.getMyNotifications);
router.patch('/:id/read', requireAuth, NotificationsController.markRead);

export default router;
