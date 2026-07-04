/**
 * dashboard.api.ts
 *
 * All HTTP calls for the Dashboard module.
 *   GET /api/dashboard/admin — Admin workforce summary stats
 */

import apiClient from "../../../lib/apiClient";

export interface AdminDashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  pendingLeaves: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const response = await apiClient.get<ApiResponse<AdminDashboardStats>>("/dashboard/admin");
  return response.data.data;
}
