/**
 * useLeave.ts
 *
 * TanStack Query hook for fetching leave list with filters and pagination.
 *
 * Usage:
 *   const { data, isLoading, isError, error } = useLeave({ status: "PENDING" });
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  getLeaveList,
  type LeaveFilters,
  type LeaveListResponse,
} from "../api/leave.api";
import { LEAVE_QUERY_KEYS } from "./queryKeys";

/**
 * Fetches a paginated, filtered list of leave requests.
 *
 * @param filters - Optional filters (employeeId, date range, status, type, page, limit).
 * @param enabled - Set to false to disable the query (default: true).
 */
export function useLeave(
  filters: LeaveFilters = {},
  enabled = true
): UseQueryResult<LeaveListResponse, Error> {
  return useQuery<LeaveListResponse, Error>({
    queryKey: LEAVE_QUERY_KEYS.list(filters),
    queryFn: () => getLeaveList(filters),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });
}
