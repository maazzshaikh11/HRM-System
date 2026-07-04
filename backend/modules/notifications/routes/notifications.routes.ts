import { verifyToken, authorizeRoles } from '../../../src/middlewares/authMiddleware';
import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';

const router = Router();



router.get('/', verifyToken, NotificationsController.getMyNotifications);
router.patch('/:id/read', verifyToken, NotificationsController.markRead);

export default router;
