"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollController = void 0;
const payroll_service_1 = require("../services/payroll.service");
const payroll_validation_1 = require("../validations/payroll.validation");
const payrollService = new payroll_service_1.PayrollService();
class PayrollController {
    static async getSalary(req, res) {
        try {
            const { employeeId } = req.params;
            const breakdown = await payrollService.getPayrollBreakdown(employeeId);
            if (!breakdown) {
                res.status(404).json({ error: 'Salary structure not found for this employee.' });
                return;
            }
            res.status(200).json({ data: breakdown });
        }
        catch (error) {
            console.error('[PayrollController] Error in getSalary:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
    static async updateSalary(req, res) {
        try {
            const { employeeId } = req.params;
            const parsedData = payroll_validation_1.salaryStructureSchema.parse({ ...req.body, employee_id: employeeId });
            const updated = await payrollService.updateSalaryStructure(employeeId, parsedData);
            res.status(200).json({ data: updated });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                res.status(400).json({ errors: error.errors });
                return;
            }
            console.error('[PayrollController] Error in updateSalary:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
    static async getPayableDays(req, res) {
        try {
            const { employeeId } = req.params;
            const { month, year } = req.query;
            if (!month || !year) {
                res.status(400).json({ error: 'Month and year are required parameters.' });
                return;
            }
            const payableDays = await payrollService.calculatePayableDays(employeeId, parseInt(month, 10), parseInt(year, 10));
            res.status(200).json({ data: { payableDays } });
        }
        catch (error) {
            console.error('[PayrollController] Error in getPayableDays:', error);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
}
exports.PayrollController = PayrollController;
