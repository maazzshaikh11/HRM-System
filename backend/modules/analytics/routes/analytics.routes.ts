import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();

const requireAuth = (req: any, res: any, next: any) => next();
const requireAdmin = (req: any, res: any, next: any) => next();

router.get('/attendance-trends', requireAuth, requireAdmin, AnalyticsController.getAttendanceTrends);
router.get('/department-distribution', requireAuth, requireAdmin, AnalyticsController.getDepartmentDistro);

export default router;
