import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

const requireAuth = (req: any, res: any, next: any) => next();
const requireAdmin = (req: any, res: any, next: any) => next();

router.get('/stats', requireAuth, requireAdmin, DashboardController.getStats);
router.get('/pending-approvals', requireAuth, requireAdmin, DashboardController.getPendingApprovals);

export default router;
