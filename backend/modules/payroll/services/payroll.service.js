"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollService = void 0;
const payroll_repository_1 = require("../repositories/payroll.repository");
const payroll_mapper_1 = require("../mappers/payroll.mapper");
const payroll_constants_1 = require("../constants/payroll.constants");
class PayrollService {
    repository;
    constructor() {
        this.repository = new payroll_repository_1.PayrollRepository();
    }
    async getSalaryStructure(employeeId) {
        const structure = await this.repository.findByEmployeeId(employeeId);
        if (!structure)
            return null;
        return payroll_mapper_1.PayrollMapper.toDTO(structure);
    }
    async getPayrollBreakdown(employeeId) {
        const structure = await this.getSalaryStructure(employeeId);
        if (!structure)
            return null;
        return payroll_mapper_1.PayrollMapper.toBreakdown(structure);
    }
    async updateSalaryStructure(employeeId, data) {
        // Merge defaults for missing values
        const mergedData = {
            basic_pct: data.basic_pct ?? payroll_constants_1.PAYROLL_CONSTANTS.BASIC_PERCENTAGE * 100,
            hra_pct: data.hra_pct ?? payroll_constants_1.PAYROLL_CONSTANTS.HRA_PERCENTAGE * 100,
            standard_allowance: data.standard_allowance ?? payroll_constants_1.PAYROLL_CONSTANTS.DEFAULT_STANDARD_ALLOWANCE,
            performance_bonus_pct: data.performance_bonus_pct ?? 0,
            lta_pct: data.lta_pct ?? 0,
            pf_employee_pct: data.pf_employee_pct ?? payroll_constants_1.PAYROLL_CONSTANTS.PF_EMPLOYEE_PERCENTAGE * 100,
            pf_employer_pct: data.pf_employer_pct ?? payroll_constants_1.PAYROLL_CONSTANTS.PF_EMPLOYER_PERCENTAGE * 100,
            professional_tax: data.professional_tax ?? payroll_constants_1.PAYROLL_CONSTANTS.DEFAULT_PROFESSIONAL_TAX,
            wage: data.wage,
        };
        const saved = await this.repository.upsert(employeeId, mergedData);
        return payroll_mapper_1.PayrollMapper.toDTO(saved);
    }
    async calculatePayableDays(employeeId, month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        let workingDays = 0;
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() !== 0 && d.getDay() !== 6)
                workingDays++;
        }
        const presentDays = await this.repository.getAttendanceDays(employeeId, startDate, endDate);
        const unpaidLeaves = await this.repository.getUnpaidLeaveDays(employeeId, startDate, endDate);
        const absentDays = workingDays - presentDays;
        return Math.max(0, workingDays - unpaidLeaves - (absentDays > 0 ? absentDays : 0));
    }
}
exports.PayrollService = PayrollService;
