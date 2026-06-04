import { useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../../src/components/ui/Avatar';
import { PostCard } from '../../src/components/feed/PostCard';
import { postsService } from '../../src/services/posts.service';
import { commentsService, type Comment } from '../../src/services/comments.service';
import { QueryKeys } from '../../src/constants/queryKeys';
import { Colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/stores/auth.store';

export default function PostDetailModal() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: QueryKeys.post(postId ?? ''),
    queryFn: () => postsService.getPost(postId!),
    enabled: !!postId,
  });

  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetching: commentsFetching,
    isLoading: commentsLoading,
  } = useInfiniteQuery({
    queryKey: [...QueryKeys.notifications, 'comments', postId],
    queryFn: ({ pageParam = 1 }) => commentsService.getComments(postId!, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last: Comment[], pages) =>
      last.length === 20 ? pages.length + 1 : undefined,
    enabled: !!postId,
  });

  const comments = commentsData?.pages.flat() ?? [];

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentsService.createComment(postId!, content),
    onSuccess: () => {
      setCommentText('');
      qc.invalidateQueries({ queryKey: [...QueryKeys.notifications, 'comments', postId] });
      qc.invalidateQueries({ queryKey: QueryKeys.post(postId!) });
    },
  });

  const handleSend = () => {
    const trimmed = commentText.trim();
    if (!trimmed || addCommentMutation.isPending) return;
    addCommentMutation.mutate(trimmed);
  };

  if (postLoading || !post) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundDark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.backgroundDark }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.bottom}
    >
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginLeft: 12 }}>Post</Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={() => hasNextPage && !commentsFetching && fetchNextPage()}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListHeaderComponent={
          <View>
            {/* Full post card */}
            <PostCard post={post} currentUserId={user?.id} />

            {/* Comments header */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
                Comments {post.commentCount > 0 ? `(${post.commentCount})` : ''}
              </Text>
            </View>

            {commentsLoading && (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !commentsLoading ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>💬</Text>
              <Text style={{ color: Colors.muted, fontSize: 14 }}>No comments yet. Be the first!</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          commentsFetching && !commentsLoading ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : null
        }
        renderItem={({ item }: { item: Comment }) => (
          <CommentRow comment={item} />
        )}
      />

      {/* Comment input */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        paddingBottom: insets.bottom + 10,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        gap: 10,
        backgroundColor: Colors.backgroundDark,
      }}>
        <Avatar uri={user?.avatarUrl} size={34} name={user?.displayName ?? user?.username} />
        <TextInput
          ref={inputRef}
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Add a comment..."
          placeholderTextColor={Colors.muted}
          style={{
            flex: 1,
            backgroundColor: Colors.surfaceDark,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 10,
            color: '#FFFFFF',
            fontSize: 14,
            maxHeight: 80,
          }}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!commentText.trim() || addCommentMutation.isPending}
          style={{ opacity: commentText.trim() ? 1 : 0.4 }}
        >
          {addCommentMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="send" size={22} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function CommentRow({ comment }: { comment: Comment }) {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, gap: 10 }}>
      <Avatar uri={comment.user?.avatarUrl} size={34} name={comment.user?.displayName ?? comment.user?.username} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
            {comment.user?.displayName ?? comment.user?.username}
          </Text>
          <Text style={{ color: Colors.muted, fontSize: 11 }}>{timeAgo}</Text>
        </View>
        <Text style={{ color: '#DDDDDD', fontSize: 14, lineHeight: 20 }}>{comment.content}</Text>
      </View>
    </View>
  );
}
