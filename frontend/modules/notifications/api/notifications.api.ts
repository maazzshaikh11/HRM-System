import { fetchApi } from '../../../lib/api';

export interface INotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const getNotifications = (): Promise<INotification[]> => {
  return fetchApi<INotification[]>('/notifications');
};

export const markNotificationRead = (id: string): Promise<{ success: boolean }> => {
  return fetchApi<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' });
};
