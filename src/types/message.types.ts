import type { User } from './user.types';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string | null;
  mediaUrl: string | null;
  type: 'text' | 'image' | 'video' | 'gif';
  readAt: string | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessageAt: string | null;
  streak?: number;
  createdAt: string;
}
