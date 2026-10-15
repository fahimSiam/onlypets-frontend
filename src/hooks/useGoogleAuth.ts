import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { GOOGLE_AUTH } from '../constants/config';
import type { User } from '../types/user.types';

// Required so the auth popup can close and return to the app.
WebBrowser.maybeCompleteAuthSession();

interface UseGoogleAuthResult {
  /** Opens the native Google sign-in sheet. */
  signIn: () => Promise<void>;
  /** True while the request is configuring or the exchange is in flight. */
  loading: boolean;
  /** Human-readable error from the last attempt, if any. */
  error: string | null;
}

/**
 * Native Google sign-in for the mobile app.
 *
 * Flow: expo-auth-session returns a Google `id_token` on-device → we POST it to
 * the backend (`/auth/google/mobile`) which verifies it and returns our JWTs.
 */
export function useGoogleAuth(
  onSuccess?: (user: User) => void,
): UseGoogleAuthResult {
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: GOOGLE_AUTH.webClientId || undefined,
    iosClientId: GOOGLE_AUTH.iosClientId || undefined,
    androidClientId: GOOGLE_AUTH.androidClientId || undefined,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const idToken = response.params?.id_token;
      if (!idToken) {
        setError('Google did not return an ID token.');
        setLoading(false);
        return;
      }
      authService
        .loginWithGoogle(idToken)
        .then((result) => {
          setUser(result.user);
          onSuccess?.(result.user);
        })
        .catch(() => setError('Google sign-in failed. Please try again.'))
        .finally(() => setLoading(false));
    } else if (response.type === 'error') {
      setError('Google sign-in was cancelled or failed.');
      setLoading(false);
    } else {
      // dismissed / cancelled
      setLoading(false);
    }
  }, [response]);

  const signIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await promptAsync();
    } catch {
      setError('Could not open Google sign-in.');
      setLoading(false);
    }
  };

  return { signIn, loading: loading || !request, error };
}
