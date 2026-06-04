import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useRef, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { shortsService } from '../../../src/services/shorts.service';
import { QueryKeys } from '../../../src/constants/queryKeys';
import { Colors } from '../../../src/constants/colors';
import { Avatar } from '../../../src/components/ui/Avatar';
import type { Short } from '../../../src/types/post.types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ShortsScreen() {
  const [isMuted, setIsMuted] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);

  const { data, fetchNextPage, hasNextPage, isFetching } = useInfiniteQuery({
    queryKey: QueryKeys.shorts(),
    queryFn: ({ pageParam = 1 }) => shortsService.getFeed(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last: Short[], pages) =>
      last.length === 10 ? pages.length + 1 : undefined,
  });

  const shorts = data?.pages.flat() ?? [];

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setVisibleIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = { itemVisiblePercentThreshold: 80 };

  return (
    <View style={styles.container}>
      <FlashList
        data={shorts}
        keyExtractor={(item: Short) => item.id}
        renderItem={({ item, index }) => (
          <ShortItem
            short={item}
            isActive={index === visibleIndex}
            isMuted={isMuted}
          />
        )}
        estimatedItemSize={SCREEN_HEIGHT}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onEndReached={() => hasNextPage && !isFetching && fetchNextPage()}
        onEndReachedThreshold={0.3}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListEmptyComponent={
          isFetching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={Colors.primary} size="large" />
            </View>
          ) : null
        }
      />

      {/* Global mute button */}
      <TouchableOpacity
        style={styles.muteButton}
        onPress={() => setIsMuted((m) => !m)}
      >
        <Ionicons
          name={isMuted ? 'volume-mute' : 'volume-high'}
          size={22}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

interface ShortItemProps {
  short: Short;
  isActive: boolean;
  isMuted: boolean;
}

function ShortItem({ short, isActive, isMuted }: ShortItemProps) {
  const videoRef = useRef<Video>(null);
  const qc = useQueryClient();
  const [liked, setLiked] = useState(short.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(short.likeCount);
  const [hasCountedView, setHasCountedView] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => shortsService.likeShort(short.id),
    onMutate: () => {
      const wasLiked = liked;
      setLiked(!wasLiked);
      setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    },
    onError: () => {
      setLiked(liked);
      setLikeCount(short.likeCount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QueryKeys.shorts() });
    },
  });

  const videoUri = short.cloudflareVideoId
    ? `https://videodelivery.net/${short.cloudflareVideoId}/manifest/video.m3u8`
    : short.thumbnailUrl ?? '';

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.isPlaying && !hasCountedView) {
      setHasCountedView(true);
      shortsService.viewShort(short.id).catch(() => {});
    }
  };

  return (
    <View style={styles.shortItem}>
      <Video
        ref={videoRef}
        source={{ uri: videoUri }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay={isActive}
        isLooping
        isMuted={isMuted}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        useNativeControls={false}
      />

      {/* Gradient overlay */}
      <View style={styles.overlay} />

      {/* Bottom info */}
      <View style={styles.bottomContainer}>
        {/* Author info */}
        <View style={styles.authorRow}>
          <Avatar uri={short.user?.avatarUrl} size={36} name={short.user?.username} />
          <Text style={styles.username}>@{short.user?.username}</Text>
        </View>

        {/* Caption */}
        {short.caption && (
          <Text style={styles.caption} numberOfLines={2}>
            {short.caption}
          </Text>
        )}

        {/* Hashtags */}
        {short.hashtags?.length > 0 && (
          <View style={styles.hashtagRow}>
            {short.hashtags.slice(0, 3).map((tag) => (
              <Text key={tag} style={styles.hashtag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Right actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => likeMutation.mutate()}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={32}
            color={liked ? Colors.danger : '#fff'}
          />
          <Text style={styles.actionLabel}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={30} color="#fff" />
          <Text style={styles.actionLabel}>{short.viewCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortItem: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 80,
    gap: 6,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  caption: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  hashtag: {
    color: Colors.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  actionsContainer: {
    position: 'absolute',
    right: 12,
    bottom: 90,
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
