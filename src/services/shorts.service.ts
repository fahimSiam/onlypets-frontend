import { apiClient } from './api.client';
import type { Short } from '../types/post.types';

export const shortsService = {
  async getFeed(page = 1): Promise<Short[]> {
    const res = await apiClient.get<{ data: Short[] }>('/shorts/feed', { params: { page } });
    return res.data.data;
  },
  async createShort(data: Partial<Short>): Promise<Short> {
    const res = await apiClient.post<{ data: Short }>('/shorts', data);
    return res.data.data;
  },
  async likeShort(id: string): Promise<void> {
    await apiClient.post(`/shorts/${id}/like`);
  },
  async viewShort(id: string): Promise<void> {
    await apiClient.post(`/shorts/${id}/view`);
  },
};
