import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markNotificationRead } from '../api/notifications.api';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    refetchInterval: 60000, // Poll every minute
  });
};

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
