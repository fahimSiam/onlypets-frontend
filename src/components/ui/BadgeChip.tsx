import { View, Text } from 'react-native';

const BADGE_COLORS: Record<string, string> = {
  newcomer: '#888888',
  rookie: '#2EC4B6',
  regular: '#4A90E2',
  pro: '#9B59B6',
  influencer: '#6BC24A',
};

const BADGE_ICONS: Record<string, string> = {
  newcomer: '🐾',
  rookie: '⭐',
  regular: '🌟',
  dogstar: '🐕',
  catwhisperer: '🐱',
  fishfluencer: '🐟',
  birdwatcher: '🦜',
  pro: '💫',
  influencer: '👑',
};

interface BadgeChipProps {
  slug: string;
  name: string;
  tier: string;
  size?: 'sm' | 'md';
}

export function BadgeChip({ slug, name, tier, size = 'md' }: BadgeChipProps) {
  const color = BADGE_COLORS[tier] ?? '#888';
  const icon = BADGE_ICONS[slug] ?? '🏆';
  const fontSize = size === 'sm' ? 11 : 13;

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: color + '22',
      borderRadius: 20,
      paddingHorizontal: size === 'sm' ? 8 : 12,
      paddingVertical: size === 'sm' ? 4 : 6,
      borderWidth: 1,
      borderColor: color + '44',
      gap: 4,
    }}>
      <Text style={{ fontSize: fontSize + 2 }}>{icon}</Text>
      <Text style={{ color, fontSize, fontWeight: '600' }}>{name}</Text>
    </View>
  );
}
