/**
 * useUpdateLeave.ts
 *
 * TanStack Query mutation hook for PATCH /api/leave/:id.
 * Allows HR/Admin to approve or reject a leave request.
 *
 * Usage:
 *   const { mutate, isPending, isError, error, data } = useUpdateLeave();
 *   mutate({
 *     id: "some-uuid",
 *     data: { status: "APPROVED", comments: "All set, cover coverage arranged." }
 *   });
 *
 * On success:
 *   - Invalidates the entire leave cache so list views update.
 *   - Replaces the stale detail cache entry with the fresh record returned by the server.
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  updateLeaveStatus,
  type UpdateLeaveStatusPayload,
  type LeaveDetailDTO,
} from "../api/leave.api";
import { LEAVE_QUERY_KEYS } from "./queryKeys";

// ---------------------------------------------------------------------------
// Hook types
// ---------------------------------------------------------------------------

export interface UpdateLeaveVariables {
  id: string;
  data: UpdateLeaveStatusPayload;
}

export interface UseUpdateLeaveOptions {
  /** Called after a successful leave update with the returned record. */
  onSuccess?: (record: LeaveDetailDTO) => void;
  /** Called when the mutation throws an error. */
  onError?: (error: Error) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Mutation hook that updates the status of a leave request (HR/Admin only).
 *
 * After a successful update, ALL leave queries are invalidated
 * so the UI immediately reflects the updated record.
 */
export function useUpdateLeave(
  options: UseUpdateLeaveOptions = {}
): UseMutationResult<LeaveDetailDTO, Error, UpdateLeaveVariables> {
  const queryClient = useQueryClient();

  return useMutation<LeaveDetailDTO, Error, UpdateLeaveVariables>({
    mutationFn: ({ id, data }: UpdateLeaveVariables) => updateLeaveStatus(id, data),

    onSuccess: (data) => {
      // Invalidate the root key — covers list AND detail queries
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.all });

      // Replace the stale detail cache entry immediately so the UI
      // shows updated status and comments without a network round-trip
      queryClient.setQueryData(LEAVE_QUERY_KEYS.detail(data.id), data);

      options.onSuccess?.(data);
    },

    onError: (error) => {
      options.onError?.(error);
    },
  });
}
