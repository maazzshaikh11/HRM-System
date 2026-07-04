import { fetchApi } from '../../../lib/api';

export interface IDashboardStats {
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  pendingApprovals: number;
}

export const getDashboardStats = (): Promise<IDashboardStats> => {
  return fetchApi<IDashboardStats>('/dashboard/stats');
};

export const getPendingApprovals = (page = 1, limit = 5): Promise<any[]> => {
  return fetchApi<any[]>(`/dashboard/pending-approvals?page=${page}&limit=${limit}`);
};
