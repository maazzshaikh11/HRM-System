/**
 * useLeaveById.ts
 *
 * TanStack Query hook for fetching a single leave request by UUID.
 * Matches: GET /api/leave/:id
 *
 * Usage:
 *   const { data, isLoading, isError, error } = useLeaveById("some-uuid");
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  getLeaveById,
  type LeaveDetailDTO,
} from "../api/leave.api";
import { LEAVE_QUERY_KEYS } from "./queryKeys";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetches a single leave request by its UUID.
 *
 * The query is disabled when `id` is falsy (empty string / undefined)
 * to avoid sending invalid requests during render cycles where the
 * id may not yet be available.
 *
 * @param id - The UUID of the leave request.
 * @param enabled - Set to false to manually disable the query (default: true).
 */
export function useLeaveById(
  id: string | undefined,
  enabled = true
): UseQueryResult<LeaveDetailDTO, Error> {
  return useQuery<LeaveDetailDTO, Error>({
    queryKey: LEAVE_QUERY_KEYS.detail(id ?? ""),
    queryFn: () => getLeaveById(id!),
    // Disable the query if id is not yet available
    enabled: Boolean(id) && enabled,
    staleTime: 30_000, // 30 seconds
  });
}
