import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../src/stores/auth.store';
import { usersService } from '../src/services/users.service';
import { authService } from '../src/services/auth.service';
import { STRIPE_PUBLISHABLE_KEY } from '../src/constants/config';
import '../global.css';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    async function initAuth() {
      try {
        const { accessToken } = await authService.getStoredTokens();
        if (accessToken) {
          const user = await usersService.getMe();
          setUser(user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        SplashScreen.hideAsync();
      }
    }
    initAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="tabs" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="messages" />
            <Stack.Screen
              name="modals"
              options={{ presentation: 'modal' }}
            />
          </Stack>
        </StripeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
