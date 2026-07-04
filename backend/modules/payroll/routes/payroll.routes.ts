import { verifyToken, authorizeRoles } from '../../../src/middlewares/authMiddleware';
import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller';

const router = Router();





router.get('/:employeeId', verifyToken, PayrollController.getSalary);
router.put('/:employeeId', verifyToken, authorizeRoles('Admin'), PayrollController.updateSalary);
router.get('/:employeeId/payable-days', verifyToken, authorizeRoles('Admin'), PayrollController.getPayableDays);

export default router;
