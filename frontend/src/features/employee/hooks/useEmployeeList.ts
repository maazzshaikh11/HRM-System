/**
 * useEmployeeList.ts
 *
 * TanStack Query hook for fetching the employee directory (Admin/HR only).
 *
 * Usage:
 *   const { data, isLoading } = useEmployeeList({ search: "John", page: 1 });
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  getEmployeeList,
  type EmployeeFilters,
  type EmployeeListResponse,
} from "../api/employee.api";
import { EMPLOYEE_QUERY_KEYS } from "./queryKeys";

export function useEmployeeList(
  filters: EmployeeFilters = {},
  enabled = true
): UseQueryResult<EmployeeListResponse, Error> {
  return useQuery<EmployeeListResponse, Error>({
    queryKey: EMPLOYEE_QUERY_KEYS.list(filters),
    queryFn: () => getEmployeeList(filters),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 60_000, // 1 minute
  });
}
