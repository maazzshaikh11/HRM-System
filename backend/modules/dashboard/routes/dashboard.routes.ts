import { verifyToken, authorizeRoles } from '../../../src/middlewares/authMiddleware';
import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();




router.get('/stats', verifyToken, authorizeRoles('Admin'), DashboardController.getStats);
router.get('/pending-approvals', verifyToken, authorizeRoles('Admin'), DashboardController.getPendingApprovals);

export default router;
