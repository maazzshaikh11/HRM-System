/**
 * useApplyLeave.ts
 *
 * TanStack Query mutation hook for POST /api/leave.
 *
 * Usage:
 *   const { mutate, isPending, isError, error, data } = useApplyLeave();
 *   mutate({
 *     type: "SICK",
 *     startDate: "2026-07-06",
 *     endDate: "2026-07-08",
 *     reason: "Medical checkup"
 *   });
 *
 * On success:
 *   - Invalidates the entire leave cache so all list and detail
 *     queries refetch fresh data.
 *   - Seeds the detail cache immediately with the returned LeaveDetailDTO.
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  applyLeave,
  type ApplyLeavePayload,
  type LeaveDetailDTO,
} from "../api/leave.api";
import { LEAVE_QUERY_KEYS } from "./queryKeys";

// ---------------------------------------------------------------------------
// Hook options (optional callbacks for the call-site)
// ---------------------------------------------------------------------------

export interface UseApplyLeaveOptions {
  /** Called after a successful leave application with the returned record. */
  onSuccess?: (record: LeaveDetailDTO) => void;
  /** Called when the mutation throws an error. */
  onError?: (error: Error) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Mutation hook that submits a new leave request.
 *
 * After a successful mutation, ALL leave queries are invalidated
 * so the UI immediately reflects the new record.
 */
export function useApplyLeave(
  options: UseApplyLeaveOptions = {}
): UseMutationResult<LeaveDetailDTO, Error, ApplyLeavePayload> {
  const queryClient = useQueryClient();

  return useMutation<LeaveDetailDTO, Error, ApplyLeavePayload>({
    mutationFn: (payload: ApplyLeavePayload) => applyLeave(payload),

    onSuccess: (data) => {
      // Invalidate the root key — covers list AND detail queries
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.all });

      // Seed the detail cache immediately so a subsequent getById
      // call can be served from cache without a network round-trip
      queryClient.setQueryData(LEAVE_QUERY_KEYS.detail(data.id), data);

      options.onSuccess?.(data);
    },

    onError: (error) => {
      options.onError?.(error);
    },
  });
}
