export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
export const MEDIA_BASE_URL = process.env.EXPO_PUBLIC_MEDIA_BASE_URL ?? '';
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
export const TRIAL_MONTHS = 6;

// Google OAuth client IDs (from Google Cloud Console). Create one OAuth client
// per platform; the "web" client is used by Expo Go / the auth proxy.
export const GOOGLE_AUTH = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
};
