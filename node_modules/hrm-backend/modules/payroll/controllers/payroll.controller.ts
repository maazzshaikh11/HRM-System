import { Request, Response } from 'express';
import { PayrollService } from '../services/payroll.service';
import { salaryStructureSchema } from '../validations/payroll.validation';

const payrollService = new PayrollService();

export class PayrollController {
  static async getSalary(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const breakdown = await payrollService.getPayrollBreakdown(employeeId);
      if (!breakdown) {
        res.status(404).json({ error: 'Salary structure not found for this employee.' });
        return;
      }
      res.status(200).json({ data: breakdown });
    } catch (error: any) {
      console.error('[PayrollController] Error in getSalary:', error);
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }

  static async updateSalary(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const parsedData = salaryStructureSchema.parse({ ...req.body, employee_id: employeeId });
      
      const updated = await payrollService.updateSalaryStructure(employeeId, parsedData);
      res.status(200).json({ data: updated });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ errors: error.errors });
        return;
      }
      console.error('[PayrollController] Error in updateSalary:', error);
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }

  static async getPayableDays(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;
      
      if (!month || !year) {
        res.status(400).json({ error: 'Month and year are required parameters.' });
        return;
      }

      const payableDays = await payrollService.calculatePayableDays(
        employeeId, 
        parseInt(month as string, 10), 
        parseInt(year as string, 10)
      );

      res.status(200).json({ data: { payableDays } });
    } catch (error: any) {
      console.error('[PayrollController] Error in getPayableDays:', error);
      res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }
}
