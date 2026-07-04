import { z } from 'zod';

export const salaryStructureSchema = z.object({
  employee_id: z.string().uuid("Invalid employee ID"),
  wage: z.number().positive("Wage must be a positive number"),
  basic_pct: z.number().min(0).max(100).optional(),
  hra_pct: z.number().min(0).max(100).optional(),
  standard_allowance: z.number().min(0).optional(),
  performance_bonus_pct: z.number().min(0).max(100).optional(),
  lta_pct: z.number().min(0).max(100).optional(),
  pf_employee_pct: z.number().min(0).max(100).optional(),
  pf_employer_pct: z.number().min(0).max(100).optional(),
  professional_tax: z.number().min(0).optional(),
});
