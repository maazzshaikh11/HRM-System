import { verifyToken, authorizeRoles } from '../../../src/middlewares/authMiddleware';
import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();




router.get('/attendance-trends', verifyToken, authorizeRoles('Admin'), AnalyticsController.getAttendanceTrends);
router.get('/department-distribution', verifyToken, authorizeRoles('Admin'), AnalyticsController.getDepartmentDistro);

export default router;
