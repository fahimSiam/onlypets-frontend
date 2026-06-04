import { apiClient } from './api.client';

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: import('../types/user.types').User;
  content: string;
  likeCount: number;
  createdAt: string;
}

export const commentsService = {
  async getComments(postId: string, page = 1): Promise<Comment[]> {
    const res = await apiClient.get<{ data: Comment[] }>(`/posts/${postId}/comments`, { params: { page } });
    return res.data.data;
  },
  async createComment(postId: string, content: string): Promise<Comment> {
    const res = await apiClient.post<{ data: Comment }>(`/posts/${postId}/comments`, { content });
    return res.data.data;
  },
  async deleteComment(id: string): Promise<void> {
    await apiClient.delete(`/comments/${id}`);
  },
};
