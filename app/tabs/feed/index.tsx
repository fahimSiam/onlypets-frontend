import { View, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useInfiniteQuery } from '@tanstack/react-query';
import { feedService } from '../../../src/services/feed.service';
import { QueryKeys } from '../../../src/constants/queryKeys';
import { Colors } from '../../../src/constants/colors';
import { PostCard } from '../../../src/components/feed/PostCard';
import { StoriesRow } from '../../../src/components/feed/StoriesRow';
import { PostSkeleton } from '../../../src/components/ui/SkeletonLoader';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { useAuthStore } from '../../../src/stores/auth.store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Post } from '../../../src/types/post.types';

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading, refetch } =
    useInfiniteQuery({
      queryKey: QueryKeys.feed(),
      queryFn: ({ pageParam = 1 }) =>
        feedService.getHomeFeed(pageParam as number),
      initialPageParam: 1,
      getNextPageParam: (lastPage: Post[], pages) =>
        lastPage.length === 12 ? pages.length + 1 : undefined,
    });

  const posts = data?.pages.flat() ?? [];

  const renderItem = ({ item }: { item: Post }) => (
    <PostCard post={item} currentUserId={user?.id} />
  );

  const ListHeaderComponent = () => <StoriesRow />;

  const ListEmptyComponent = () => {
    if (isLoading) {
      return (
        <View>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </View>
      );
    }
    return (
      <EmptyState
        title="Your feed is empty"
        subtitle="Follow others to see their posts here"
      />
    );
  };

  const ListFooterComponent = () => {
    if (!isFetching || isLoading) return null;
    return (
      <View style={{ paddingVertical: 16 }}>
        <PostSkeleton />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundDark }}>
      <FlashList
        data={posts}
        keyExtractor={(item: Post) => item.id}
        renderItem={renderItem}
        estimatedItemSize={400}
        onEndReached={() => hasNextPage && !isFetching && fetchNextPage()}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !!data}
            onRefresh={refetch}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
