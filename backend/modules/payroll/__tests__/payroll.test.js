"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const payroll_service_1 = require("../services/payroll.service");
describe('PayrollService', () => {
    let payrollService;
    beforeEach(() => {
        payrollService = new payroll_service_1.PayrollService();
        // Mock repository functions for isolated testing
        payrollService.repository = {
            findByEmployeeId: jest.fn().mockResolvedValue({
                id: '1',
                employee_id: 'emp-123',
                wage: 10000,
                basic_pct: 50,
                hra_pct: 50,
                standard_allowance: 4167,
                performance_bonus_pct: 10,
                lta_pct: 5,
                pf_employee_pct: 12,
                pf_employer_pct: 12,
                professional_tax: 200,
            }),
            upsert: jest.fn().mockImplementation((id, data) => Promise.resolve({ employee_id: id, ...data })),
            getAttendanceDays: jest.fn().mockResolvedValue(20),
            getUnpaidLeaveDays: jest.fn().mockResolvedValue(2),
        };
    });
    it('should calculate payroll breakdown correctly', async () => {
        const breakdown = await payrollService.getPayrollBreakdown('emp-123');
        expect(breakdown).not.toBeNull();
        expect(breakdown?.basic).toBe(5000);
        expect(breakdown?.hra).toBe(2500);
        expect(breakdown?.pfEmployee).toBe(600);
    });
    it('should calculate payable days correctly', async () => {
        const days = await payrollService.calculatePayableDays('emp-123', 10, 2025);
        expect(days).toBeDefined();
        expect(typeof days).toBe('number');
    });
});
