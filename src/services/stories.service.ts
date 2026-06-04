import { apiClient } from './api.client';
import type { Story } from '../types/post.types';

export const storiesService = {
  async getFeedStories(): Promise<Story[]> {
    const res = await apiClient.get<{ data: Story[] }>('/stories/feed');
    return res.data.data;
  },
  async createStory(data: { mediaUrl: string; type: 'image' | 'video'; cloudflareVideoId?: string }): Promise<Story> {
    const res = await apiClient.post<{ data: Story }>('/stories', data);
    return res.data.data;
  },
  async viewStory(id: string): Promise<void> {
    await apiClient.post(`/stories/${id}/view`);
  },
};
