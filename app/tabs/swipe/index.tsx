import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { discoveryService } from '../../../src/services/discovery.service';
import { usersService } from '../../../src/services/users.service';
import { QueryKeys } from '../../../src/constants/queryKeys';
import { Colors } from '../../../src/constants/colors';
import { Avatar } from '../../../src/components/ui/Avatar';
import type { User } from '../../../src/types/user.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface MatchModal {
  visible: boolean;
  matchedUser: User | null;
}

export default function SwipeScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [stackIndex, setStackIndex] = useState(0);
  const [matchModal, setMatchModal] = useState<MatchModal>({ visible: false, matchedUser: null });

  // Pan animation for top card
  const pan = useRef(new Animated.ValueXY()).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const passOpacity = useRef(new Animated.Value(0)).current;
  const cardRotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-8deg', '0deg', '8deg'],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      await usersService.updateLocation(loc.coords.latitude, loc.coords.longitude);
      queryClient.invalidateQueries({ queryKey: QueryKeys.nearby });
    })();
  }, []);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: QueryKeys.nearby,
    queryFn: () => discoveryService.getNearby(),
  });

  const swipeMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'like' | 'pass' }) =>
      discoveryService.swipe(id, action),
    onSuccess: (result, variables) => {
      if (result.matched) {
        const matchedUser = profiles.find((p) => p.id === variables.id) ?? null;
        setMatchModal({ visible: true, matchedUser });
      }
      setStackIndex((i) => i + 1);
      pan.setValue({ x: 0, y: 0 });
      likeOpacity.setValue(0);
      passOpacity.setValue(0);
    },
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        // Update overlay opacity
        if (gestureState.dx > 0) {
          likeOpacity.setValue(Math.min(gestureState.dx / SWIPE_THRESHOLD, 1));
          passOpacity.setValue(0);
        } else {
          passOpacity.setValue(Math.min(-gestureState.dx / SWIPE_THRESHOLD, 1));
          likeOpacity.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          swipeOut('right');
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          swipeOut('left');
        } else {
          // Snap back
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
          Animated.timing(likeOpacity, { toValue: 0, duration: 200, useNativeDriver: false }).start();
          Animated.timing(passOpacity, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  function swipeOut(direction: 'left' | 'right') {
    const toX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(pan, {
      toValue: { x: toX, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      const topProfile = profiles[stackIndex];
      if (topProfile) {
        swipeMutation.mutate({ id: topProfile.id, action: direction === 'right' ? 'like' : 'pass' });
      }
    });
  }

  function handleLike() {
    Animated.sequence([
      Animated.timing(likeOpacity, { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start(() => swipeOut('right'));
  }

  function handlePass() {
    Animated.sequence([
      Animated.timing(passOpacity, { toValue: 1, duration: 150, useNativeDriver: false }),
    ]).start(() => swipeOut('left'));
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const remaining = profiles.slice(stackIndex);

  if (remaining.length === 0) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🐾</Text>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
          No more profiles nearby
        </Text>
        <Text style={{ color: Colors.muted, textAlign: 'center', marginTop: 8, fontSize: 14 }}>
          Come back later or expand your search radius
        </Text>
      </View>
    );
  }

  const topProfile = remaining[0];
  const nextProfile = remaining[1];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundDark, paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 22 }}>Nearby 🐾</Text>
        <Text style={{ color: Colors.muted, fontSize: 14 }}>{remaining.length} left</Text>
      </View>

      {/* Card stack */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
        {/* Next card (background) */}
        {nextProfile && (
          <View style={[styles.card, { position: 'absolute', top: 12, transform: [{ scale: 0.96 }], zIndex: 1 }]}>
            <CardContent user={nextProfile} />
          </View>
        )}

        {/* Top card (interactive) */}
        <Animated.View
          style={[
            styles.card,
            {
              zIndex: 2,
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { rotate: cardRotate },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Like overlay */}
          <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]}>
            <Text style={{ color: Colors.success, fontSize: 32, fontWeight: '900', borderWidth: 4, borderColor: Colors.success, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}>
              LIKE
            </Text>
          </Animated.View>

          {/* Pass overlay */}
          <Animated.View style={[styles.overlay, styles.passOverlay, { opacity: passOpacity }]}>
            <Text style={{ color: Colors.danger, fontSize: 32, fontWeight: '900', borderWidth: 4, borderColor: Colors.danger, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}>
              PASS
            </Text>
          </Animated.View>

          <CardContent user={topProfile} />
        </Animated.View>
      </View>

      {/* Action buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 32, paddingVertical: 24, paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity
          onPress={handlePass}
          disabled={swipeMutation.isPending}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: Colors.surfaceDark,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: Colors.danger + '44',
            shadowColor: Colors.danger,
            shadowOpacity: 0.2,
            shadowRadius: 8,
          }}
        >
          <Text style={{ fontSize: 28 }}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLike}
          disabled={swipeMutation.isPending}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: Colors.primary,
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text style={{ fontSize: 28 }}>♥</Text>
        </TouchableOpacity>
      </View>

      {/* Match modal */}
      <Modal visible={matchModal.visible} transparent animationType="fade">
        <View style={styles.matchOverlay}>
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🐾</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>
              It's a Match!
            </Text>
            <Text style={{ color: Colors.muted, fontSize: 15, textAlign: 'center', marginBottom: 28 }}>
              You and {matchModal.matchedUser?.displayName ?? matchModal.matchedUser?.username ?? 'someone'} liked each other!
            </Text>
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 28 }}>
              <Avatar uri={null} size={70} name="You" />
              <Text style={{ color: Colors.primary, fontSize: 32, alignSelf: 'center' }}>♥</Text>
              <Avatar uri={matchModal.matchedUser?.avatarUrl} size={70} name={matchModal.matchedUser?.displayName ?? matchModal.matchedUser?.username} />
            </View>
            <TouchableOpacity
              onPress={() => setMatchModal({ visible: false, matchedUser: null })}
              style={{
                backgroundColor: Colors.primary,
                borderRadius: 14,
                paddingHorizontal: 36,
                paddingVertical: 14,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CardContent({ user }: { user: User }) {
  return (
    <View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'flex-end' }}>
      <Avatar uri={user.avatarUrl} size={100} name={user.displayName ?? user.username} />
      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 24, marginTop: 14 }}>
        {user.displayName ?? user.username}
      </Text>
      <Text style={{ color: Colors.muted, fontSize: 15, marginTop: 4 }}>@{user.username}</Text>
      {user.bio ? (
        <Text style={{ color: '#DDDDDD', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 }} numberOfLines={3}>
          {user.bio}
        </Text>
      ) : null}
      <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600', marginTop: 8 }}>
        ⭐ {user.totalPoints.toLocaleString()} pts
        {user.currentStreak > 1 ? ` · 🔥 ${user.currentStreak} day streak` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  likeOverlay: {
    backgroundColor: Colors.success + '22',
  },
  passOverlay: {
    backgroundColor: Colors.danger + '22',
  },
  matchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
