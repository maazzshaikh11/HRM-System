import { useQuery } from '@tanstack/react-query';
import { getAttendanceTrends, getDepartmentDistribution } from '../api/analytics.api';

export const useAttendanceTrends = (days: number = 7) => {
  return useQuery({
    queryKey: ['analytics', 'attendance-trends', days],
    queryFn: () => getAttendanceTrends(days),
  });
};

export const useDepartmentDistribution = () => {
  return useQuery({
    queryKey: ['analytics', 'department-distribution'],
    queryFn: getDepartmentDistribution,
  });
};
