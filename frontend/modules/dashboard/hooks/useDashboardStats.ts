import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getPendingApprovals } from '../api/dashboard.api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
  });
};

export const usePendingApprovals = (page = 1, limit = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'pendingApprovals', page, limit],
    queryFn: () => getPendingApprovals(page, limit),
  });
};
