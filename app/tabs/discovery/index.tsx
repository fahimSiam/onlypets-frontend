import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Avatar } from '../../../src/components/ui/Avatar';
import { feedService } from '../../../src/services/feed.service';
import { discoveryService } from '../../../src/services/discovery.service';
import { QueryKeys } from '../../../src/constants/queryKeys';
import { Colors } from '../../../src/constants/colors';
import type { Post } from '../../../src/types/post.types';
import type { User } from '../../../src/types/user.types';
import type { Router } from 'expo-router';

const push = (href: Parameters<Router['push']>[0] | string) =>
  router.push(href as Parameters<Router['push']>[0]);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_ITEM_SIZE = Math.floor(SCREEN_WIDTH / 3) - 1;

type SpeciesFilter = 'all' | 'dog' | 'cat' | 'bird' | 'fish' | 'rabbit';

const SPECIES_FILTERS: { value: SpeciesFilter; emoji: string; label: string }[] = [
  { value: 'all', emoji: '✨', label: 'All' },
  { value: 'dog', emoji: '🐕', label: 'Dogs' },
  { value: 'cat', emoji: '🐱', label: 'Cats' },
  { value: 'bird', emoji: '🐦', label: 'Birds' },
  { value: 'fish', emoji: '🐟', label: 'Fish' },
  { value: 'rabbit', emoji: '🐰', label: 'Rabbits' },
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function DiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('all');
  const debouncedSearch = useDebounce(search, 400);

  // Trending grid (shown when not searching)
  const {
    data: trendingData,
    fetchNextPage: fetchNextTrending,
    hasNextPage: hasNextTrending,
    isFetching: trendingFetching,
    isLoading: trendingLoading,
  } = useInfiniteQuery({
    queryKey: QueryKeys.trending(),
    queryFn: ({ pageParam = 1 }) => feedService.getTrending(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last: Post[], pages) =>
      last.length === 12 ? pages.length + 1 : undefined,
  });

  // Search results (users via /discovery/nearby as placeholder until /discovery/search exists)
  const { data: searchUsers = [], isFetching: searchFetching } = useQuery({
    queryKey: [...QueryKeys.nearby, debouncedSearch],
    queryFn: () => discoveryService.getNearby(),
    enabled: debouncedSearch.length >= 2,
  });

  const trendingPosts = trendingData?.pages.flat() ?? [];
  const isSearching = debouncedSearch.length >= 2;

  // Filter users by search term client-side
  const filteredUsers: User[] = isSearching
    ? searchUsers.filter((u) =>
        u.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (u.displayName ?? '').toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundDark }}>
      {/* Search bar */}
      <View style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: 10,
        backgroundColor: Colors.backgroundDark,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.surfaceDark,
          borderRadius: 14,
          paddingHorizontal: 12,
          gap: 8,
        }}>
          <Ionicons name="search" size={18} color={Colors.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search pets, users, #hashtags"
            placeholderTextColor={Colors.muted}
            style={{ flex: 1, color: '#FFFFFF', fontSize: 15, paddingVertical: 12 }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Species filter chips */}
      {!isSearching && (
        <FlatList
          horizontal
          data={SPECIES_FILTERS}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSpeciesFilter(item.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: speciesFilter === item.value ? Colors.primary : Colors.surfaceDark,
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 7,
              }}
            >
              <Text style={{ fontSize: 14 }}>{item.emoji}</Text>
              <Text style={{
                color: speciesFilter === item.value ? '#FFFFFF' : Colors.muted,
                fontSize: 13,
                fontWeight: '600',
              }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Content */}
      {isSearching ? (
        /* Search results */
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          ListHeaderComponent={
            <Text style={{ color: Colors.muted, fontSize: 13, fontWeight: '600', paddingHorizontal: 16, paddingVertical: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Users
            </Text>
          }
          ListEmptyComponent={
            searchFetching ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>No results found</Text>
                <Text style={{ color: Colors.muted, fontSize: 14, marginTop: 4 }}>Try a different search term</Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => push({ pathname: '/modals/user-profile' as any, params: { userId: item.id } })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 10,
                gap: 12,
              }}
            >
              <Avatar uri={item.avatarUrl} size={46} name={item.displayName ?? item.username} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                  {item.displayName ?? item.username}
                </Text>
                <Text style={{ color: Colors.muted, fontSize: 13 }}>@{item.username}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 74 }} />
          )}
        />
      ) : (
        /* Trending grid */
        <FlatList
          data={trendingPosts}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          onEndReached={() => hasNextTrending && !trendingFetching && fetchNextTrending()}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, paddingHorizontal: 16, paddingVertical: 10 }}>
              Trending
            </Text>
          }
          ListEmptyComponent={
            trendingLoading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : null
          }
          ListFooterComponent={
            trendingFetching && !trendingLoading ? (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE, margin: 0.5, backgroundColor: Colors.surfaceDark }}
              onPress={() => push({ pathname: '/modals/post-detail' as any, params: { postId: item.id } })}
            >
              {item.thumbnailUrl || item.mediaUrls?.[0] ? (
                <Image
                  source={{ uri: item.thumbnailUrl ?? item.mediaUrls[0] }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="image-outline" size={24} color={Colors.muted} />
                </View>
              )}
              {item.type === 'video' && (
                <View style={{ position: 'absolute', top: 5, right: 5 }}>
                  <Ionicons name="play" size={14} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
