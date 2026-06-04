import { apiClient } from './api.client';
import type { Badge, UserBadge } from '../types/user.types';

export const badgesService = {
  async getAllBadges(): Promise<Badge[]> {
    const res = await apiClient.get<{ data: Badge[] }>('/badges');
    return res.data.data;
  },
  async getMyBadges(): Promise<UserBadge[]> {
    const res = await apiClient.get<{ data: UserBadge[] }>('/badges/mine');
    return res.data.data;
  },
};
