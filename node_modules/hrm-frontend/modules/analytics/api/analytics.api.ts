import { fetchApi } from '../../../lib/api';

export const getAttendanceTrends = (days: number = 7): Promise<any[]> => {
  return fetchApi<any[]>(`/analytics/attendance-trends?days=${days}`);
};

export const getDepartmentDistribution = (): Promise<any[]> => {
  return fetchApi<any[]>('/analytics/department-distribution');
};
