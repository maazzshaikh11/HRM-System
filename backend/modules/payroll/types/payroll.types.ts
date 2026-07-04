export interface ISalaryStructure {
  id?: string;
  employee_id: string;
  wage: number;
  basic_pct: number;
  hra_pct: number;
  standard_allowance: number;
  performance_bonus_pct: number;
  lta_pct: number;
  pf_employee_pct: number;
  pf_employer_pct: number;
  professional_tax: number;
}

export interface IPayrollBreakdown {
  wage: number;
  basic: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  lta: number;
  fixedAllowance: number;
  pfEmployee: number;
  pfEmployer: number;
  professionalTax: number;
  totalComputed: number;
}
