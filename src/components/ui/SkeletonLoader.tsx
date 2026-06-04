import { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';

export function Skeleton({ style }: { style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ backgroundColor: '#2A2A2A', borderRadius: 8 }, style, { opacity }]}
    />
  );
}

export function PostSkeleton() {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 }}>
        <Skeleton style={{ width: 40, height: 40, borderRadius: 20 }} />
        <View style={{ gap: 6 }}>
          <Skeleton style={{ width: 120, height: 12 }} />
          <Skeleton style={{ width: 80, height: 10 }} />
        </View>
      </View>
      <Skeleton style={{ width: '100%', aspectRatio: 1 }} />
      <View style={{ padding: 12, gap: 8 }}>
        <Skeleton style={{ width: 80, height: 12 }} />
        <Skeleton style={{ width: '90%', height: 12 }} />
        <Skeleton style={{ width: '70%', height: 12 }} />
      </View>
    </View>
  );
}
