import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../src/components/ui/Avatar';
import { PostsGrid } from '../../src/components/profile/PostsGrid';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Button } from '../../src/components/ui/Button';
import { petsService } from '../../src/services/pets.service';
import { usersService } from '../../src/services/users.service';
import { feedService } from '../../src/services/feed.service';
import { QueryKeys } from '../../src/constants/queryKeys';
import { Colors } from '../../src/constants/colors';
import type { Post } from '../../src/types/post.types';
import type { Router } from 'expo-router';

const push = (href: Parameters<Router['push']>[0] | string) =>
  router.push(href as Parameters<Router['push']>[0]);

const SPECIES_EMOJIS: Record<string, string> = {
  dog: '🐕', cat: '🐱', bird: '🦜', fish: '🐟', rabbit: '🐰', reptile: '🦎', other: '🐾',
};

const SPECIES_LABELS: Record<string, string> = {
  dog: 'Dog', cat: 'Cat', bird: 'Bird', fish: 'Fish', rabbit: 'Rabbit', reptile: 'Reptile', other: 'Other',
};

export default function PetProfileModal() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const insets = useSafeAreaInsets();

  const { data: pet, isLoading: petLoading } = useQuery({
    queryKey: QueryKeys.pet(petId ?? ''),
    queryFn: () => petsService.getPet(petId!),
    enabled: !!petId,
  });

  const { data: owner, isLoading: ownerLoading } = useQuery({
    queryKey: QueryKeys.userProfile(pet?.ownerId ?? ''),
    queryFn: () => usersService.getUser(pet!.ownerId),
    enabled: !!pet?.ownerId,
  });

  // Placeholder: real impl would use GET /pets/:id/posts
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetching: postsFetching,
    isLoading: postsLoading,
  } = useInfiniteQuery({
    queryKey: [...QueryKeys.trending(), petId, 'pet'],
    queryFn: ({ pageParam = 1 }) => feedService.getTrending(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last: Post[], pages) =>
      last.length === 12 ? pages.length + 1 : undefined,
  });

  const posts = postsData?.pages.flat() ?? [];

  if (petLoading || !pet) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundDark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundDark }}>
      {/* Nav bar */}
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
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, flex: 1 }}>{pet.name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pet header */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <Avatar uri={pet.avatarUrl} size={80} name={pet.name} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 20 }}>{pet.name}</Text>
                {pet.hasInfluencerBadge && (
                  <View style={{
                    backgroundColor: '#FF6B3522',
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderWidth: 1,
                    borderColor: '#FF6B3544',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 3,
                  }}>
                    <Text style={{ fontSize: 12 }}>👑</Text>
                    <Text style={{ color: Colors.primary, fontSize: 11, fontWeight: '700' }}>Influencer</Text>
                  </View>
                )}
              </View>
              {/* Species chip */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <Text style={{ fontSize: 16 }}>{SPECIES_EMOJIS[pet.species] ?? '🐾'}</Text>
                <Text style={{ color: Colors.muted, fontSize: 14 }}>
                  {SPECIES_LABELS[pet.species] ?? 'Pet'}
                  {pet.breed ? ` · ${pet.breed}` : ''}
                  {pet.age != null ? ` · ${pet.age}y` : ''}
                </Text>
              </View>
              <Text style={{ color: Colors.primary, fontSize: 13, fontWeight: '600' }}>
                ⭐ {pet.totalPoints.toLocaleString()} pts · {pet.followerCount} followers
              </Text>
            </View>
          </View>

          {pet.bio && (
            <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 20, marginBottom: 14 }}>{pet.bio}</Text>
          )}

          {/* Follow button (placeholder) */}
          <Button
            label="Follow"
            onPress={() => {}}
            variant="primary"
            size="sm"
            style={{ alignSelf: 'flex-start', paddingHorizontal: 28 }}
          />
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: Colors.border, marginBottom: 4 }} />

        {/* Posts grid */}
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

        {/* Owner card */}
        {owner && (
          <View style={{ margin: 16, marginTop: 20 }}>
            <Text style={{ color: Colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Owner</Text>
            <TouchableOpacity
              onPress={() => push({ pathname: '/modals/user-profile' as any, params: { userId: owner.id } })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.surfaceDark,
                borderRadius: 14,
                padding: 14,
                gap: 12,
              }}
            >
              <Avatar uri={owner.avatarUrl} size={44} name={owner.displayName ?? owner.username} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>{owner.displayName ?? owner.username}</Text>
                <Text style={{ color: Colors.muted, fontSize: 13 }}>@{owner.username}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}
