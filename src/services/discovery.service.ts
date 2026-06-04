import { apiClient } from './api.client';
import type { User } from '../types/user.types';

export type SwipeAction = 'like' | 'pass' | 'superlike';

export const discoveryService = {
  async getNearby(radiusKm = 50): Promise<User[]> {
    const res = await apiClient.get<{ data: User[] }>('/discovery/nearby', {
      params: { radius: radiusKm },
    });
    return res.data.data;
  },

  async swipe(
    targetId: string,
    action: SwipeAction,
  ): Promise<{ matched: boolean }> {
    const res = await apiClient.post<{ data: { matched: boolean } }>(
      '/discovery/swipe',
      { targetId, action },
    );
    return res.data.data;
  },

  async getMatches(): Promise<User[]> {
    const res = await apiClient.get<{ data: User[] }>('/discovery/matches');
    return res.data.data;
  },
};
