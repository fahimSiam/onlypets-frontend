import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/colors';

export default function MessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.backgroundDark },
        headerTintColor: Colors.textDark,
        headerTitleStyle: { fontWeight: '700' },
        headerBackTitle: '',
        contentStyle: { backgroundColor: Colors.backgroundDark },
      }}
    />
  );
}
