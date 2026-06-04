import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProfileHeader } from '../../../src/components/profile/ProfileHeader';
import { PostsGrid } from '../../../src/components/profile/PostsGrid';
import { BadgeChip } from '../../../src/components/ui/BadgeChip';
import { Avatar } from '../../../src/components/ui/Avatar';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { useMyProfile, useMyPets, useMyBadges } from '../../../src/hooks/useProfile';
import { feedService } from '../../../src/services/feed.service';
import { QueryKeys } from '../../../src/constants/queryKeys';
import { Colors } from '../../../src/constants/colors';
import type { Post } from '../../../src/types/post.types';

type TabKey = 'posts' | 'pets' | 'badges';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('posts');
  const qc = useQueryClient();

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useMyProfile();
  const { data: pets = [], refetch: refetchPets } = useMyPets();
  const { data: badges = [], refetch: refetchBadges } = useMyBadges();

  // TODO: replace with GET /users/me/posts once endpoint is available
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetching: postsFetching,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useInfiniteQuery({
    queryKey: [...QueryKeys.feed(), 'mine'],
    queryFn: ({ pageParam = 1 }) => feedService.getHomeFeed(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last: Post[], pages) =>
      last.length === 12 ? pages.length + 1 : undefined,
  });

  const posts = postsData?.pages.flat() ?? [];

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchPets(), refetchBadges(), refetchPosts()]);
    setRefreshing(false);
  }, [refetchProfile, refetchPets, refetchBadges, refetchPosts]);

  if (profileLoading || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundDark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const SPECIES_EMOJIS: Record<string, string> = {
    dog: '🐕', cat: '🐱', bird: '🦜', fish: '🐟', rabbit: '🐰', reptile: '🦎', other: '🐾',
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.backgroundDark }}
      stickyHeaderIndices={[1]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
      }
    >
      {/* Top bar */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 17 }}>@{profile.username}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={() => router.push('/modals/notifications' as any)}>
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/modals/settings' as any)}>
            <Ionicons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile header */}
      <View style={{ backgroundColor: Colors.backgroundDark }}>
        <ProfileHeader
          user={profile}
          postCount={posts.length}
          followerCount={0} // TODO: add followerCount to User type / /users/me endpoint
          followingCount={0} // TODO: add followingCount to User type / /users/me endpoint
          badges={badges}
          isOwnProfile={true}
          onEditProfile={() => router.push('/modals/edit-profile' as any)}
        />

        {/* Add pet button */}
        <TouchableOpacity
          onPress={() => router.push('/modals/add-pet' as any)}
          style={{
            marginHorizontal: 16,
            marginBottom: 14,
            backgroundColor: Colors.surfaceDark,
            borderRadius: 12,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
          <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 13 }}>Add a Pet</Text>
        </TouchableOpacity>

        {/* Tab bar */}
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border }}>
          {(['posts', 'pets', 'badges'] as TabKey[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === tab ? Colors.primary : 'transparent',
              }}
            >
              <Ionicons
                name={tab === 'posts' ? 'grid-outline' : tab === 'pets' ? 'paw-outline' : 'ribbon-outline'}
                size={20}
                color={activeTab === tab ? Colors.primary : Colors.muted}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab content */}
      {activeTab === 'posts' && (
        <View>
          {postsLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : posts.length === 0 ? (
            <EmptyState
              emoji="📸"
              title="Share your first post!"
              subtitle="Tap + to create a post and show your pets to the world"
            />
          ) : (
            <>
              <PostsGrid posts={posts} />
              {hasNextPage && (
                <TouchableOpacity
                  onPress={() => fetchNextPage()}
                  disabled={postsFetching}
                  style={{ padding: 16, alignItems: 'center' }}
                >
                  {postsFetching ? (
                    <ActivityIndicator color={Colors.primary} />
                  ) : (
                    <Text style={{ color: Colors.primary, fontWeight: '600' }}>Load more</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}

      {activeTab === 'pets' && (
        <View style={{ padding: 16 }}>
          {pets.length === 0 ? (
            <EmptyState
              emoji="🐾"
              title="No pets yet"
              subtitle="Add your first pet to create their own page"
            />
          ) : (
            pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                onPress={() => router.push({ pathname: '/modals/pet-profile' as any, params: { petId: pet.id } })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.surfaceDark,
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 10,
                  gap: 12,
                }}
              >
                <Avatar uri={pet.avatarUrl} size={52} name={pet.name} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>{pet.name}</Text>
                    <Text style={{ fontSize: 16 }}>{SPECIES_EMOJIS[pet.species] ?? '🐾'}</Text>
                    {pet.hasInfluencerBadge && <Text style={{ fontSize: 14 }}>👑</Text>}
                  </View>
                  {pet.breed && <Text style={{ color: Colors.muted, fontSize: 13 }}>{pet.breed}</Text>}
                  <Text style={{ color: Colors.primary, fontSize: 12, marginTop: 2 }}>⭐ {pet.totalPoints.toLocaleString()} pts · {pet.followerCount} followers</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {activeTab === 'badges' && (
        <View style={{ padding: 16 }}>
          {badges.length === 0 ? (
            <EmptyState
              emoji="🏆"
              title="No badges yet"
              subtitle="Keep posting and engaging to earn badges"
            />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {badges.map((ub) => (
                <View key={ub.id} style={{ alignItems: 'center', gap: 4 }}>
                  <BadgeChip slug={ub.badge.slug} name={ub.badge.name} tier={ub.badge.tier} size="md" />
                  <Text style={{ color: Colors.muted, fontSize: 11 }}>{ub.badge.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={{ height: insets.bottom + 16 }} />
    </ScrollView>
  );
}
