import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ProfileHeader } from '../../src/components/profile/ProfileHeader';
import { PostsGrid } from '../../src/components/profile/PostsGrid';
import { Avatar } from '../../src/components/ui/Avatar';
import { BadgeChip } from '../../src/components/ui/BadgeChip';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useUserProfile, useFollowUser, useUnfollowUser } from '../../src/hooks/useProfile';
import { feedService } from '../../src/services/feed.service';
import { messagesService } from '../../src/services/messages.service';
import { petsService } from '../../src/services/pets.service';
import { badgesService } from '../../src/services/badges.service';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '../../src/constants/queryKeys';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/stores/auth.store';
import type { Post } from '../../src/types/post.types';
import type { Router } from 'expo-router';

const push = (href: Parameters<Router['push']>[0] | string) =>
  router.push(href as Parameters<Router['push']>[0]);

type TabKey = 'posts' | 'pets' | 'badges';

const SPECIES_EMOJIS: Record<string, string> = {
  dog: '🐕', cat: '🐱', bird: '🦜', fish: '🐟', rabbit: '🐰', reptile: '🦎', other: '🐾',
};

export default function UserProfileModal() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const insets = useSafeAreaInsets();
  const { user: me } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('posts');

  const { data: profile, isLoading } = useUserProfile(userId ?? '');

  // User's pets
  const { data: pets = [] } = useQuery({
    queryKey: [...QueryKeys.myPets, userId],
    queryFn: petsService.getMyPets,
    enabled: false, // placeholder — no public GET /users/:id/pets endpoint yet
  });

  // User's badges — reuse trending feed as placeholder posts
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetching: postsFetching,
    isLoading: postsLoading,
  } = useInfiniteQuery({
    queryKey: [...QueryKeys.trending(), userId],
    queryFn: ({ pageParam = 1 }) => feedService.getTrending(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last: Post[], pages) =>
      last.length === 12 ? pages.length + 1 : undefined,
  });

  const posts = postsData?.pages.flat() ?? [];

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const messageMutation = useMutation({
    mutationFn: () => messagesService.getOrCreateConversation(userId!),
    onSuccess: (conv) => {
      router.back();
      push({ pathname: '/modals/messages' as any, params: { conversationId: conv.id } });
    },
  });

  if (isLoading || !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundDark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const isOwnProfile = me?.id === profile.id;
  // NOTE: User type doesn't carry isFollowing — treat as not following by default
  const isFollowing = false;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundDark }}>
      {/* Header bar */}
      <View style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, flex: 1 }}>@{profile.username}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader
          user={profile}
          postCount={posts.length}
          followerCount={0} // TODO: expose followerCount on User
          followingCount={0} // TODO: expose followingCount on User
          badges={[]}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onFollow={() => followMutation.mutate(profile.id)}
          onUnfollow={() => unfollowMutation.mutate(profile.id)}
          onMessage={() => messageMutation.mutate()}
          onEditProfile={() => router.push('/modals/edit-profile' as any)}
        />

        {/* Tab bar */}
        <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
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

        {/* Posts tab */}
        {activeTab === 'posts' && (
          <View>
            {postsLoading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : posts.length === 0 ? (
              <EmptyState emoji="📸" title="No posts yet" />
            ) : (
              <>
                <PostsGrid posts={posts} />
                {hasNextPage && (
                  <TouchableOpacity
                    onPress={() => fetchNextPage()}
                    disabled={postsFetching}
                    style={{ padding: 16, alignItems: 'center' }}
                  >
                    {postsFetching
                      ? <ActivityIndicator color={Colors.primary} />
                      : <Text style={{ color: Colors.primary, fontWeight: '600' }}>Load more</Text>
                    }
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        )}

        {/* Pets tab */}
        {activeTab === 'pets' && (
          <View style={{ padding: 16 }}>
            {pets.length === 0 ? (
              <EmptyState emoji="🐾" title="No pets listed" />
            ) : (
              pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  onPress={() => push({ pathname: '/modals/pet-profile' as any, params: { petId: pet.id } })}
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
                    </View>
                    {pet.breed && <Text style={{ color: Colors.muted, fontSize: 13 }}>{pet.breed}</Text>}
                    <Text style={{ color: Colors.primary, fontSize: 12, marginTop: 2 }}>⭐ {pet.totalPoints.toLocaleString()} pts</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Badges tab */}
        {activeTab === 'badges' && (
          <View style={{ padding: 16 }}>
            <EmptyState emoji="🏆" title="No badges to show" />
          </View>
        )}

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}
