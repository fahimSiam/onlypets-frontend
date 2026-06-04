import { apiClient } from './api.client';
import type { SubscriptionStatus } from '../types/api.types';

export const paymentsService = {
  async createSubscription(): Promise<{
    clientSecret: string;
    subscriptionId: string;
  }> {
    const res = await apiClient.post('/payments/subscribe');
    return res.data.data;
  },

  async cancelSubscription(): Promise<void> {
    await apiClient.delete('/payments/cancel');
  },

  async getStatus(): Promise<{
    status: SubscriptionStatus;
    trialExpired: boolean;
    expiresAt: string | null;
  }> {
    const res = await apiClient.get('/payments/status');
    return res.data.data;
  },
};
