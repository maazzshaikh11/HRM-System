/**
 * queryKeys.ts
 *
 * Centralised TanStack Query key factory for the Payroll feature.
 */

export const PAYROLL_QUERY_KEYS = {
  all: ["payroll"] as const,
  mySalary: () => ["payroll", "my-salary"] as const,
  myPayslips: () => ["payroll", "my-payslips"] as const,
  allSalaries: () => ["payroll", "salaries"] as const,
} as const;
