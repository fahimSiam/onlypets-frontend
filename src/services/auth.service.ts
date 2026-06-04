import * as SecureStore from 'expo-secure-store';
import { apiClient } from './api.client';
import type { User } from '../types/user.types';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  async register(data: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
  }): Promise<AuthResponse> {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/register', data);
    await saveTokens(res.data.data);
    return res.data.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<{ data: AuthResponse }>('/auth/login', {
      email,
      password,
    });
    await saveTokens(res.data.data);
    return res.data.data;
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  },

  async getStoredTokens() {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    return { accessToken, refreshToken };
  },
};

async function saveTokens(data: AuthResponse): Promise<void> {
  await SecureStore.setItemAsync('accessToken', data.accessToken);
  await SecureStore.setItemAsync('refreshToken', data.refreshToken);
}
