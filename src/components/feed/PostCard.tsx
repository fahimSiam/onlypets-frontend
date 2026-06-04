import { View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { postsService } from '../../services/posts.service';
import type { Post } from '../../types/post.types';
import { formatDistanceToNow } from 'date-fns';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const push = (href: any) => router.push(href);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
  currentUserId?: string;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
  const qc = useQueryClient();
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const likeMutation = useMutation({
    mutationFn: () => liked ? postsService.unlikePost(post.id) : postsService.likePost(post.id),
    onMutate: () => {
      setLiked(!liked);
      setLikeCount(c => liked ? c - 1 : c + 1);
    },
    onError: () => {
      setLiked(liked);
      setLikeCount(likeCount);
    },
  });

  const authorName = post.authorType === 'pet'
    ? post.pet?.name
    : (post.user?.displayName || post.user?.username);
  const authorAvatar = post.authorType === 'pet' ? post.pet?.avatarUrl : post.user?.avatarUrl;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <View style={{ backgroundColor: '#0A0A0A', marginBottom: 2 }}>
      {/* Header */}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 }}
        onPress={() => {
          if (post.authorType === 'pet' && post.petId) {
            push({ pathname: '/modals/pet-profile', params: { petId: post.petId } });
          } else if (post.userId) {
            push({ pathname: '/modals/user-profile', params: { userId: post.userId } });
          }
        }}
      >
        <Avatar uri={authorAvatar} size={38} name={authorName ?? ''} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>{authorName}</Text>
          <Text style={{ color: '#888', fontSize: 12 }}>{timeAgo}</Text>
        </View>
        {post.userId === currentUserId && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Delete Post', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => postsService.deletePost(post.id).then(() => qc.invalidateQueries({ queryKey: ['feed'] })) },
              ]);
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Media */}
      {post.mediaUrls?.[0] && (
        <Image
          source={{ uri: post.mediaUrls[0] }}
          style={{ width: SCREEN_WIDTH, aspectRatio: 1 }}
          contentFit="cover"
        />
      )}

      {/* Actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10, gap: 16 }}>
        <TouchableOpacity onPress={() => likeMutation.mutate()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={26} color={liked ? '#FF4444' : '#FFFFFF'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          onPress={() => push({ pathname: '/modals/comments', params: { postId: post.id } })}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      {/* Stats */}
      <View style={{ paddingHorizontal: 14, paddingTop: 6, paddingBottom: 2 }}>
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>{likeCount.toLocaleString()} likes</Text>
      </View>

      {/* Caption */}
      {post.caption && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 8 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 13 }} numberOfLines={2}>
            <Text style={{ fontWeight: '700' }}>{authorName} </Text>
            {post.caption}
          </Text>
        </View>
      )}

      {/* Comments link */}
      {post.commentCount > 0 && (
        <TouchableOpacity
          style={{ paddingHorizontal: 14, paddingBottom: 10 }}
          onPress={() => push({ pathname: '/modals/comments', params: { postId: post.id } })}
        >
          <Text style={{ color: '#888', fontSize: 13 }}>View all {post.commentCount} comments</Text>
        </TouchableOpacity>
      )}

      {/* Hashtags */}
      {post.hashtags?.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, paddingBottom: 10, gap: 4 }}>
          {post.hashtags.slice(0, 5).map((tag) => (
            <Text key={tag} style={{ color: '#2EC4B6', fontSize: 13 }}>#{tag}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
