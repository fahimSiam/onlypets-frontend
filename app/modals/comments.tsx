import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { commentsService, Comment } from '../../src/services/comments.service';
import { Avatar } from '../../src/components/ui/Avatar';
import { Colors } from '../../src/constants/colors';
import { formatDistanceToNow } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CommentsModal() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const qc = useQueryClient();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['comments', postId],
      queryFn: ({ pageParam = 1 }) =>
        commentsService.getComments(postId!, pageParam as number),
      initialPageParam: 1,
      getNextPageParam: (last: Comment[], pages) =>
        last.length === 20 ? pages.length + 1 : undefined,
      enabled: !!postId,
    });

  const comments = data?.pages.flat() ?? [];

  const sendMutation = useMutation({
    mutationFn: (content: string) => commentsService.createComment(postId!, content),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
    return (
      <View style={styles.commentRow}>
        <Avatar uri={item.user?.avatarUrl} size={32} name={item.user?.username} />
        <View style={styles.commentContent}>
          <View style={styles.commentBubble}>
            <Text style={styles.commentUsername}>{item.user?.username}</Text>
            <Text style={styles.commentText}>{item.content}</Text>
          </View>
          <View style={styles.commentMeta}>
            <Text style={styles.commentTime}>{timeAgo}</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 12 }}>
              <Ionicons name="heart-outline" size={13} color={Colors.muted} />
              {item.likeCount > 0 && (
                <Text style={styles.commentTime}>{item.likeCount}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <Text style={styles.headerTitle}>Comments</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Comments list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item: Comment) => item.id}
          renderItem={renderComment}
          onEndReached={() => hasNextPage && !isFetchingNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={40} color={Colors.muted} />
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to comment!</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={Colors.primary} style={{ padding: 12 }} />
            ) : null
          }
        />
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder="Add a comment..."
          placeholderTextColor={Colors.muted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          style={[
            styles.sendButton,
            (!text.trim() || sendMutation.isPending) && styles.sendButtonDisabled,
          ]}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  header: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: Colors.surfaceDark,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentUsername: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2,
  },
  commentText: {
    color: '#E0E0E0',
    fontSize: 14,
    lineHeight: 20,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 4,
  },
  commentTime: {
    color: Colors.muted,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptySubtext: {
    color: Colors.muted,
    fontSize: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundDark,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
