/**
 * useDashboard.ts
 *
 * TanStack Query hooks for Dashboard statistics.
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getAdminDashboardStats, type AdminDashboardStats } from "../api/dashboard.api";

export function useAdminDashboardStats(): UseQueryResult<AdminDashboardStats, Error> {
  return useQuery<AdminDashboardStats, Error>({
    queryKey: ["dashboard", "admin"],
    queryFn: getAdminDashboardStats,
    staleTime: 60_000, // 1 minute — stats change frequently
  });
}
