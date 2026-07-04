import { ISalaryStructure, IPayrollBreakdown } from '../types/payroll.types';

export class PayrollMapper {
  static toBreakdown(structure: ISalaryStructure): IPayrollBreakdown {
    const basic = structure.wage * (structure.basic_pct / 100);
    const hra = basic * (structure.hra_pct / 100);
    const standardAllowance = structure.standard_allowance;
    const performanceBonus = basic * (structure.performance_bonus_pct / 100);
    const lta = basic * (structure.lta_pct / 100);
    
    const pfEmployee = basic * (structure.pf_employee_pct / 100);
    const pfEmployer = basic * (structure.pf_employer_pct / 100);
    const professionalTax = structure.professional_tax;

    const sumOfComponents = basic + hra + standardAllowance + performanceBonus + lta;
    const fixedAllowance = Math.max(0, structure.wage - sumOfComponents);

    return {
      wage: structure.wage,
      basic,
      hra,
      standardAllowance,
      performanceBonus,
      lta,
      fixedAllowance,
      pfEmployee,
      pfEmployer,
      professionalTax,
      totalComputed: sumOfComponents + fixedAllowance,
    };
  }

  static toDTO(structure: any): ISalaryStructure {
    return {
      id: structure.id,
      employee_id: structure.employee_id,
      wage: structure.wage,
      basic_pct: structure.basic_pct,
      hra_pct: structure.hra_pct,
      standard_allowance: structure.standard_allowance,
      performance_bonus_pct: structure.performance_bonus_pct,
      lta_pct: structure.lta_pct,
      pf_employee_pct: structure.pf_employee_pct,
      pf_employer_pct: structure.pf_employer_pct,
      professional_tax: structure.professional_tax,
    };
  }
}
