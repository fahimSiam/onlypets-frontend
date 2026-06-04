import { apiClient } from './api.client';
import type { Conversation, Message } from '../types/message.types';

export const messagesService = {
  async getConversations(): Promise<Conversation[]> {
    const res = await apiClient.get<{ data: Conversation[] }>('/conversations');
    return res.data.data;
  },
  async getOrCreateConversation(userId: string): Promise<Conversation> {
    const res = await apiClient.post<{ data: Conversation }>(`/conversations/with/${userId}`);
    return res.data.data;
  },
  async getMessages(conversationId: string, page = 1): Promise<Message[]> {
    const res = await apiClient.get<{ data: Message[] }>(`/conversations/${conversationId}/messages`, { params: { page } });
    return res.data.data;
  },
  async sendMessage(conversationId: string, content: string, type = 'text'): Promise<Message> {
    const res = await apiClient.post<{ data: Message }>(`/conversations/${conversationId}/messages`, { content, type });
    return res.data.data;
  },
};
