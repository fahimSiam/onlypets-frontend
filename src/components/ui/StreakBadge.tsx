import { View, Text } from 'react-native';

export function StreakBadge({ count }: { count: number }) {
  if (count < 2) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 16 }}>🔥</Text>
      <Text style={{ color: '#6BC24A', fontWeight: '700', fontSize: 14 }}>{count}</Text>
    </View>
  );
}
