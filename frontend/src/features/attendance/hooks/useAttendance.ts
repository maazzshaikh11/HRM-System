/**
 * useAttendance.ts
 *
 * TanStack Query hook for fetching attendance list with filters and pagination.
 *
 * Usage:
 *   const { data, isLoading, isError, error } = useAttendance({ month: 7, year: 2026 });
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  getAttendanceList,
  type AttendanceFilters,
  type AttendanceListResponse,
} from "../api/attendance.api";
import { ATTENDANCE_QUERY_KEYS } from "./queryKeys";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetches a paginated, filtered list of attendance records.
 *
 * @param filters - Optional filters (employeeId, date range, status, month, year, sort, page, limit).
 * @param enabled - Set to false to disable the query (default: true).
 *
 * Query is automatically disabled if all filters are undefined.
 * Cache is keyed by the full filters object so each unique filter set
 * gets its own cached result.
 */
export function useAttendance(
  filters: AttendanceFilters = {},
  enabled = true
): UseQueryResult<AttendanceListResponse, Error> {
  return useQuery<AttendanceListResponse, Error>({
    queryKey: ATTENDANCE_QUERY_KEYS.list(filters),
    queryFn: () => getAttendanceList(filters),
    enabled,
    // Keep previous data while fetching next page for smooth pagination UX
    placeholderData: (previousData) => previousData,
    // Attendance data is time-sensitive; don't serve stale data
    staleTime: 30_000, // 30 seconds
  });
}
