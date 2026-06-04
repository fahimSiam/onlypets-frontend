import { apiClient } from './api.client';
import type { User } from '../types/user.types';

export const usersService = {
  async getMe(): Promise<User> {
    const res = await apiClient.get<{ data: User }>('/users/me');
    return res.data.data;
  },

  async updateMe(data: Partial<User>): Promise<User> {
    const res = await apiClient.patch<{ data: User }>('/users/me', data);
    return res.data.data;
  },

  async updateLocation(latitude: number, longitude: number): Promise<void> {
    await apiClient.patch('/users/me/location', { latitude, longitude });
  },

  async getUser(id: string): Promise<User> {
    const res = await apiClient.get<{ data: User }>(`/users/${id}`);
    return res.data.data;
  },

  async follow(userId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/follow`);
  },

  async unfollow(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}/follow`);
  },

  async updatePushToken(token: string): Promise<void> {
    await apiClient.patch('/users/me', { expoPushToken: token });
  },
};
