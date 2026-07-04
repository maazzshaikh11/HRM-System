import { PayrollRepository } from '../repositories/payroll.repository';
import { PayrollMapper } from '../mappers/payroll.mapper';
import { ISalaryStructure, IPayrollBreakdown } from '../types/payroll.types';
import { PAYROLL_CONSTANTS } from '../constants/payroll.constants';

export class PayrollService {
  private repository: PayrollRepository;

  constructor() {
    this.repository = new PayrollRepository();
  }

  async getSalaryStructure(employeeId: string): Promise<ISalaryStructure | null> {
    const structure = await this.repository.findByEmployeeId(employeeId);
    if (!structure) return null;
    return PayrollMapper.toDTO(structure);
  }

  async getPayrollBreakdown(employeeId: string): Promise<IPayrollBreakdown | null> {
    const structure = await this.getSalaryStructure(employeeId);
    if (!structure) return null;
    return PayrollMapper.toBreakdown(structure);
  }

  async updateSalaryStructure(employeeId: string, data: Partial<ISalaryStructure>): Promise<ISalaryStructure> {
    // Merge defaults for missing values
    const mergedData = {
      basic_pct: data.basic_pct ?? PAYROLL_CONSTANTS.BASIC_PERCENTAGE * 100,
      hra_pct: data.hra_pct ?? PAYROLL_CONSTANTS.HRA_PERCENTAGE * 100,
      standard_allowance: data.standard_allowance ?? PAYROLL_CONSTANTS.DEFAULT_STANDARD_ALLOWANCE,
      performance_bonus_pct: data.performance_bonus_pct ?? 0,
      lta_pct: data.lta_pct ?? 0,
      pf_employee_pct: data.pf_employee_pct ?? PAYROLL_CONSTANTS.PF_EMPLOYEE_PERCENTAGE * 100,
      pf_employer_pct: data.pf_employer_pct ?? PAYROLL_CONSTANTS.PF_EMPLOYER_PERCENTAGE * 100,
      professional_tax: data.professional_tax ?? PAYROLL_CONSTANTS.DEFAULT_PROFESSIONAL_TAX,
      wage: data.wage,
    };

    const saved = await this.repository.upsert(employeeId, mergedData);
    return PayrollMapper.toDTO(saved);
  }

  async calculatePayableDays(employeeId: string, month: number, year: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    let workingDays = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) workingDays++;
    }

    const presentDays = await this.repository.getAttendanceDays(employeeId, startDate, endDate);
    const unpaidLeaves = await this.repository.getUnpaidLeaveDays(employeeId, startDate, endDate);

    const absentDays = workingDays - presentDays;
    return Math.max(0, workingDays - unpaidLeaves - (absentDays > 0 ? absentDays : 0));
  }
}
