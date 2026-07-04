/**
 * useCheckOut.ts
 *
 * TanStack Query mutation hook for POST /api/attendance/check-out.
 *
 * Usage:
 *   const { mutate, isPending, isError, error, data } = useCheckOut();
 *   mutate({ location: { latitude: 23.0, longitude: 72.5 } });
 *
 * On success:
 *   - Invalidates the entire attendance cache so all list and detail
 *     queries refetch fresh data (working hours, status, etc. are updated).
 *   - Replaces the stale detail cache entry with the fresh record returned
 *     by the server.
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  checkOut,
  type CheckOutPayload,
  type AttendanceDetailDTO,
} from "../api/attendance.api";
import { ATTENDANCE_QUERY_KEYS } from "./queryKeys";

// ---------------------------------------------------------------------------
// Hook options (optional callbacks for the call-site)
// ---------------------------------------------------------------------------

export interface UseCheckOutOptions {
  /** Called after a successful check-out with the updated record. */
  onSuccess?: (record: AttendanceDetailDTO) => void;
  /** Called when the mutation throws an error. */
  onError?: (error: Error) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Mutation hook that records the authenticated employee's check-out.
 *
 * The server calculates and returns:
 *   - workingHours  (total time between check-in and check-out)
 *   - overtimeHours (hours worked beyond STANDARD_WORKING_HOURS)
 *   - lateMinutes   (minutes after the shift start grace period)
 *   - finalStatus   (PRESENT / LATE / HALF_DAY / ABSENT)
 *
 * After a successful mutation, ALL attendance queries are invalidated
 * so the UI immediately reflects the updated record.
 */
export function useCheckOut(
  options: UseCheckOutOptions = {}
): UseMutationResult<AttendanceDetailDTO, Error, CheckOutPayload> {
  const queryClient = useQueryClient();

  return useMutation<AttendanceDetailDTO, Error, CheckOutPayload>({
    mutationFn: (payload: CheckOutPayload = {}) => checkOut(payload),

    onSuccess: (data) => {
      // Invalidate the root key — covers list AND detail queries
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all });

      // Replace the stale detail cache entry immediately so the UI
      // shows updated working hours / status without a network round-trip
      queryClient.setQueryData(ATTENDANCE_QUERY_KEYS.detail(data.id), data);

      options.onSuccess?.(data);
    },

    onError: (error) => {
      options.onError?.(error);
    },
  });
}
