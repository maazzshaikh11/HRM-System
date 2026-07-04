/**
 * usePayroll.ts
 *
 * TanStack Query hooks for the Payroll module.
 *
 * Usage:
 *   const { data } = useMySalary();
 *   const { data } = useMyPayslips();
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import {
  getMySalary,
  getMyPayslips,
  getAllSalaries,
  updateSalary,
  generatePayroll,
  type SalaryStructure,
  type PayslipListResponse,
  type AdminSalaryListResponse,
  type UpdateSalaryPayload,
} from "../api/payroll.api";
import { PAYROLL_QUERY_KEYS } from "./queryKeys";

/** Get authenticated employee's own salary structure */
export function useMySalary(): UseQueryResult<SalaryStructure, Error> {
  return useQuery<SalaryStructure, Error>({
    queryKey: PAYROLL_QUERY_KEYS.mySalary(),
    queryFn: getMySalary,
    staleTime: 5 * 60_000,
  });
}

/** Get authenticated employee's payslip history */
export function useMyPayslips(): UseQueryResult<PayslipListResponse, Error> {
  return useQuery<PayslipListResponse, Error>({
    queryKey: PAYROLL_QUERY_KEYS.myPayslips(),
    queryFn: getMyPayslips,
    staleTime: 5 * 60_000,
  });
}

/** Get all employee salaries (Admin/HR) */
export function useAllSalaries(enabled = true): UseQueryResult<AdminSalaryListResponse, Error> {
  return useQuery<AdminSalaryListResponse, Error>({
    queryKey: PAYROLL_QUERY_KEYS.allSalaries(),
    queryFn: getAllSalaries,
    enabled,
    staleTime: 60_000,
  });
}

/** Update an employee's salary (Admin/HR) */
export function useUpdateSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateSalaryPayload }) =>
      updateSalary(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.all });
    },
  });
}

/** Generate monthly payroll (Admin/HR) */
export function useGeneratePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) =>
      generatePayroll(month, year),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.all });
    },
  });
}
