import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller';

const router = Router();

// Mock middlewares to prevent compilation errors assuming actual exist somewhere else
const requireAuth = (req: any, res: any, next: any) => next();
const requireAdmin = (req: any, res: any, next: any) => next();

router.get('/:employeeId', requireAuth, PayrollController.getSalary);
router.put('/:employeeId', requireAuth, requireAdmin, PayrollController.updateSalary);
router.get('/:employeeId/payable-days', requireAuth, requireAdmin, PayrollController.getPayableDays);

export default router;
