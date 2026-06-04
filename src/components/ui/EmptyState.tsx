import { View, Text } from 'react-native';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ emoji = '🐾', title, subtitle }: EmptyStateProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>{emoji}</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>{title}</Text>
      {subtitle && (
        <Text style={{ color: '#888', fontSize: 14, textAlign: 'center', marginTop: 8 }}>{subtitle}</Text>
      )}
    </View>
  );
}
