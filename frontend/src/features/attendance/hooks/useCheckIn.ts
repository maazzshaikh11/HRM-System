/**
 * useCheckIn.ts
 *
 * TanStack Query mutation hook for POST /api/attendance/check-in.
 *
 * Usage:
 *   const { mutate, isPending, isError, error, data } = useCheckIn();
 *   mutate({ location: { latitude: 23.0, longitude: 72.5 } });
 *
 * On success:
 *   - Invalidates the entire attendance cache so all list and detail
 *     queries refetch fresh data.
 *   - Returns the newly created AttendanceDetailDTO.
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  checkIn,
  type CheckInPayload,
  type AttendanceDetailDTO,
} from "../api/attendance.api";
import { ATTENDANCE_QUERY_KEYS } from "./queryKeys";

// ---------------------------------------------------------------------------
// Hook options (optional callbacks for the call-site)
// ---------------------------------------------------------------------------

export interface UseCheckInOptions {
  /** Called after a successful check-in with the returned record. */
  onSuccess?: (record: AttendanceDetailDTO) => void;
  /** Called when the mutation throws an error. */
  onError?: (error: Error) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Mutation hook that records the authenticated employee's check-in.
 *
 * After a successful mutation, ALL attendance queries are invalidated
 * so the UI immediately reflects the new record.
 */
export function useCheckIn(
  options: UseCheckInOptions = {}
): UseMutationResult<AttendanceDetailDTO, Error, CheckInPayload> {
  const queryClient = useQueryClient();

  return useMutation<AttendanceDetailDTO, Error, CheckInPayload>({
    mutationFn: (payload: CheckInPayload = {}) => checkIn(payload),

    onSuccess: (data) => {
      // Invalidate the root key — covers list AND detail queries
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_QUERY_KEYS.all });

      // Seed the detail cache immediately so a subsequent getById
      // call can be served from cache without a network round-trip
      queryClient.setQueryData(ATTENDANCE_QUERY_KEYS.detail(data.id), data);

      options.onSuccess?.(data);
    },

    onError: (error) => {
      options.onError?.(error);
    },
  });
}
