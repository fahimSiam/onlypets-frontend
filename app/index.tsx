import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/auth.store';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#6BC24A" size="large" />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/tabs/feed' : '/auth/login'} />;
}
