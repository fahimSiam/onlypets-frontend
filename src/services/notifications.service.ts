import { apiClient } from './api.client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export const notificationsService = {
  async getNotifications(page = 1): Promise<Notification[]> {
    const res = await apiClient.get<{ data: Notification[] }>('/notifications', { params: { page } });
    return res.data.data;
  },
  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },
};
