import type { SubscriptionStatus } from './api.types';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isVerified: boolean;
  subscriptionStatus: SubscriptionStatus;
  trialStartedAt: string | null;
  totalPoints: number;
  currentStreak: number;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'fish' | 'rabbit' | 'reptile' | 'other';
  breed: string | null;
  age: number | null;
  bio: string | null;
  avatarUrl: string | null;
  totalPoints: number;
  followerCount: number;
  hasInfluencerBadge: boolean;
  createdAt: string;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconUrl: string | null;
  tier: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badge: Badge;
  earnedAt: string;
}
