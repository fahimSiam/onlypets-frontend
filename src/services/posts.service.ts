import { apiClient } from './api.client';
import type { Post } from '../types/post.types';

export const postsService = {
  async getPost(id: string): Promise<Post> {
    const res = await apiClient.get<{ data: Post }>(`/posts/${id}`);
    return res.data.data;
  },

  async createPost(data: {
    type: 'image' | 'video' | 'carousel';
    mediaUrls?: string[];
    cloudflareVideoId?: string;
    thumbnailUrl?: string;
    caption?: string;
    hashtags?: string[];
    petId?: string;
  }): Promise<Post> {
    const res = await apiClient.post<{ data: Post }>('/posts', data);
    return res.data.data;
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  },

  async likePost(id: string): Promise<void> {
    await apiClient.post(`/posts/${id}/like`);
  },

  async unlikePost(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}/like`);
  },

  async viewPost(id: string): Promise<void> {
    await apiClient.post(`/posts/${id}/view`);
  },
};
