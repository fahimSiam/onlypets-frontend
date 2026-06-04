export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
  error: null | {
    statusCode: number;
    message: string | string[];
    timestamp: string;
  };
}

export type SubscriptionStatus =
  | 'trial'
  | 'active'
  | 'canceled'
  | 'expired'
  | 'influencer';
