/**
 * payroll.api.ts
 *
 * All HTTP calls for the Payroll module.
 * Mirrors the backend API contract:
 *   GET    /api/payroll/my-salary       — Get own salary structure
 *   GET    /api/payroll/my-payslips     — Get own payslip history
 *   GET    /api/payroll/salaries        — List all (Admin/HR)
 *   PUT    /api/payroll/salary/:userId  — Update salary (Admin/HR)
 *   POST   /api/payroll/generate        — Generate payroll (Admin/HR)
 */

import apiClient from "../../../lib/apiClient";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SalaryStructure {
  id: string;
  employeeId: string;
  basic: number;
  hra: number;
  lta: number;
  pf: number;
  otherAllowance: number;
  deductions: number;
  netSalary: number;
  grossSalary: number;
  updatedAt: string;
}

export interface Payslip {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  basic: number;
  hra: number;
  lta: number;
  pf: number;
  otherAllowance: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  status: "PAID" | "PENDING" | "PROCESSING";
  paidAt: string | null;
  createdAt: string;
}

export interface PayslipListResponse {
  payslips: Payslip[];
  total: number;
}

export interface AdminSalaryListItem {
  userId: string;
  employeeId: string;
  name: string;
  department?: string | null;
  basic: number;
  netSalary: number;
  updatedAt: string;
}

export interface AdminSalaryListResponse {
  salaries: AdminSalaryListItem[];
  total: number;
}

export interface UpdateSalaryPayload {
  basic?: number;
  hra?: number;
  lta?: number;
  pf?: number;
  otherAllowance?: number;
  deductions?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** GET /api/payroll/my-salary — Own salary structure */
export async function getMySalary(): Promise<SalaryStructure> {
  const response = await apiClient.get<ApiResponse<SalaryStructure>>("/payroll/my-salary");
  return response.data.data;
}

/** GET /api/payroll/my-payslips — Own payslip history */
export async function getMyPayslips(): Promise<PayslipListResponse> {
  const response = await apiClient.get<ApiResponse<PayslipListResponse>>("/payroll/my-payslips");
  return response.data.data;
}

/** GET /api/payroll/salaries — All salaries (Admin/HR) */
export async function getAllSalaries(): Promise<AdminSalaryListResponse> {
  const response = await apiClient.get<ApiResponse<AdminSalaryListResponse>>("/payroll/salaries");
  return response.data.data;
}

/** PUT /api/payroll/salary/:userId — Update employee salary (Admin/HR) */
export async function updateSalary(
  userId: string,
  payload: UpdateSalaryPayload
): Promise<SalaryStructure> {
  const response = await apiClient.put<ApiResponse<SalaryStructure>>(
    `/payroll/salary/${userId}`,
    payload
  );
  return response.data.data;
}

/** POST /api/payroll/generate — Generate monthly payroll (Admin/HR) */
export async function generatePayroll(month: number, year: number): Promise<{ generated: number }> {
  const response = await apiClient.post<ApiResponse<{ generated: number }>>(
    "/payroll/generate",
    { month, year }
  );
  return response.data.data;
}
