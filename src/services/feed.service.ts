import { apiClient } from './api.client';
import type { Post } from '../types/post.types';

export const feedService = {
  async getHomeFeed(page = 1): Promise<Post[]> {
    const res = await apiClient.get<{ data: Post[] }>('/feed', {
      params: { page },
    });
    return res.data.data;
  },

  async getTrending(page = 1): Promise<Post[]> {
    const res = await apiClient.get<{ data: Post[] }>('/feed/trending', {
      params: { page },
    });
    return res.data.data;
  },
};
