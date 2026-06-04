import type { User, Pet } from './user.types';

export interface Post {
  id: string;
  userId: string | null;
  petId: string | null;
  user: User | null;
  pet: Pet | null;
  authorType: 'user' | 'pet';
  type: 'image' | 'video' | 'carousel';
  mediaUrls: string[];
  cloudflareVideoId: string | null;
  thumbnailUrl: string | null;
  caption: string | null;
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  mediaUrl: string;
  type: 'image' | 'video';
  viewCount: number;
  expiresAt: string;
  createdAt: string;
}

export interface Short {
  id: string;
  userId: string;
  user: User;
  cloudflareVideoId: string;
  thumbnailUrl: string;
  caption: string | null;
  hashtags: string[];
  duration: number;
  likeCount: number;
  viewCount: number;
  isLiked?: boolean;
  createdAt: string;
}
