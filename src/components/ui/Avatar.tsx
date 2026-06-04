import { Image } from 'expo-image';
import { View, Text } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  name?: string;
  hasStory?: boolean;
  className?: string;
}

export function Avatar({ uri, size = 40, name, hasStory = false, className }: AvatarProps) {
  const initials = name ? name.slice(0, 2).toUpperCase() : '?';
  const ringColor = hasStory ? '#FF6B35' : 'transparent';

  return (
    <View
      style={{
        width: size + 4,
        height: size + 4,
        borderRadius: (size + 4) / 2,
        borderWidth: hasStory ? 2 : 0,
        borderColor: ringColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#2A2A2A',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#888', fontSize: size * 0.35, fontWeight: '600' }}>
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
}
