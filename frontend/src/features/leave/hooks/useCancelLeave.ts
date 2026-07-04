/**
 * useCancelLeave.ts
 *
 * TanStack Query mutation hook for POST /api/leave/:id/cancel.
 * Allows employees to cancel their own pending leave requests.
 */

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { cancelLeave, type LeaveDetailDTO } from "../api/leave.api";
import { LEAVE_QUERY_KEYS } from "./queryKeys";

export interface UseCancelLeaveOptions {
  onSuccess?: (record: LeaveDetailDTO) => void;
  onError?: (error: Error) => void;
}

export function useCancelLeave(
  options: UseCancelLeaveOptions = {}
): UseMutationResult<LeaveDetailDTO, Error, string> {
  const queryClient = useQueryClient();

  return useMutation<LeaveDetailDTO, Error, string>({
    mutationFn: (id: string) => cancelLeave(id),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_QUERY_KEYS.all });
      queryClient.setQueryData(LEAVE_QUERY_KEYS.detail(data.id), data);
      options.onSuccess?.(data);
    },

    onError: (error) => {
      options.onError?.(error);
    },
  });
}
