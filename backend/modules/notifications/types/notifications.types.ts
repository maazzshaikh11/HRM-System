export interface INotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: Date;
}
