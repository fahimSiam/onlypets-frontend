import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { storiesService } from '../../src/services/stories.service';
import { QueryKeys } from '../../src/constants/queryKeys';
import { Avatar } from '../../src/components/ui/Avatar';
import { Colors } from '../../src/constants/colors';
import type { Story } from '../../src/types/post.types';
import { formatDistanceToNow } from 'date-fns';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000;

export default function StoryViewerModal() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();

  // Load all feed stories so we can navigate prev/next
  const { data: stories = [], isLoading } = useQuery({
    queryKey: QueryKeys.stories,
    queryFn: storiesService.getFeedStories,
  });

  const currentIndex = stories.findIndex((s: Story) => s.id === storyId);
  const [activeIndex, setActiveIndex] = useState(Math.max(currentIndex, 0));
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewedRef = useRef<Set<string>>(new Set());

  const currentStory: Story | undefined = stories[activeIndex];

  const goNext = () => {
    if (activeIndex < stories.length - 1) {
      setActiveIndex((i) => i + 1);
    } else {
      router.back();
    }
  };

  const goPrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((i) => i - 1);
    }
  };

  // View story on mount / when changing
  useEffect(() => {
    if (!currentStory) return;
    if (!viewedRef.current.has(currentStory.id)) {
      viewedRef.current.add(currentStory.id);
      storiesService.viewStory(currentStory.id).catch(() => {});
    }
  }, [currentStory]);

  // Auto-advance for images
  useEffect(() => {
    setProgress(0);
    if (!currentStory || currentStory.type === 'video') return;

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / STORY_DURATION, 1);
      setProgress(p);
      if (p >= 1) {
        clearInterval(timerRef.current!);
        goNext();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIndex, currentStory?.type]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!currentStory) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff' }}>Story not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true });

  return (
    <View style={styles.container}>
      {/* Media */}
      {currentStory.type === 'image' ? (
        <Image
          source={{ uri: currentStory.mediaUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : (
        <Video
          source={{ uri: currentStory.mediaUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={false}
          useNativeControls={false}
          onPlaybackStatusUpdate={(status) => {
            if (!status.isLoaded) return;
            if (status.didJustFinish) goNext();
          }}
        />
      )}

      {/* Dark overlay at top */}
      <View style={styles.topOverlay} />

      {/* Progress bars */}
      <View style={styles.progressContainer}>
        {stories.map((s: Story, i: number) => (
          <View key={s.id} style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    i < activeIndex
                      ? 100
                      : i === activeIndex
                      ? progress * 100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Avatar
            uri={currentStory.user?.avatarUrl}
            size={36}
            name={currentStory.user?.username}
          />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.authorName}>
              {currentStory.user?.displayName || currentStory.user?.username}
            </Text>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tap zones */}
      <View style={styles.tapZones}>
        <TouchableOpacity style={styles.tapLeft} onPress={goPrev} activeOpacity={1} />
        <TouchableOpacity style={styles.tapRight} onPress={goNext} activeOpacity={1} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    backgroundColor: 'transparent',
    // On native, use a gradient library for this ideally
  },
  progressContainer: {
    position: 'absolute',
    top: 52,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  header: {
    position: 'absolute',
    top: 64,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timeAgo: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapZones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  tapLeft: {
    flex: 1,
  },
  tapRight: {
    flex: 1,
  },
});
