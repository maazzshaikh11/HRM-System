/**
 * useProfile.ts
 *
 * TanStack Query hook for fetching and mutating the authenticated
 * employee's own profile.
 *
 * Usage:
 *   const { data, isLoading, isError } = useProfile();
 */

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  type EmployeeProfile,
  type UpdateProfilePayload,
} from "../api/employee.api";
import { EMPLOYEE_QUERY_KEYS } from "./queryKeys";

/** Fetches the authenticated employee's own profile */
export function useProfile(): UseQueryResult<EmployeeProfile, Error> {
  return useQuery<EmployeeProfile, Error>({
    queryKey: EMPLOYEE_QUERY_KEYS.profile(),
    queryFn: getMyProfile,
    staleTime: 5 * 60_000, // 5 minutes — profile data changes infrequently
  });
}

/** Mutation to update own profile */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.profile() });
    },
  });
}

/** Mutation to upload avatar */
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.profile() });
    },
  });
}
