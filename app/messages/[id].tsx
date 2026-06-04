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
import { Stack, useLocalSearchParams, router } from 'expo-router';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { messagesService } from '../../src/services/messages.service';
import { QueryKeys } from '../../src/constants/queryKeys';
import { Colors } from '../../src/constants/colors';
import { Avatar } from '../../src/components/ui/Avatar';
import { StreakBadge } from '../../src/components/ui/StreakBadge';
import { useAuthStore } from '../../src/stores/auth.store';
import { useSocket, useJoinConversation } from '../../src/hooks/useSocket';
import type { Message, Conversation } from '../../src/types/message.types';
import type { User } from '../../src/types/user.types';
import { formatDistanceToNow } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

export default function ChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuthStore();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  // Load conversation info
  const { data: conversations = [] } = useQuery({
    queryKey: QueryKeys.conversations,
    queryFn: messagesService.getConversations,
  });

  const conversation: Conversation | undefined = conversations.find(
    (c: Conversation) => c.id === conversationId,
  );
  const otherUser: User | undefined = conversation?.participants.find(
    (p: User) => p.id !== currentUser?.id,
  );

  // Join socket room
  useJoinConversation(conversationId ?? null);

  // Load messages (paginated, inverted)
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: QueryKeys.messages(conversationId!),
      queryFn: ({ pageParam = 1 }) =>
        messagesService.getMessages(conversationId!, pageParam as number),
      initialPageParam: 1,
      getNextPageParam: (last: Message[], pages) =>
        last.length === 20 ? pages.length + 1 : undefined,
      enabled: !!conversationId,
    });

  const messages = (data?.pages.flat() ?? []).slice().reverse();

  // Listen for real-time messages
  const handleNewMessage = useCallback(
    (msg: Message) => {
      if (msg.conversationId !== conversationId) return;
      qc.setQueryData(
        QueryKeys.messages(conversationId!),
        (old: { pages: Message[][]; pageParams: unknown[] } | undefined) => {
          if (!old) return old;
          const updatedPages = [...old.pages];
          updatedPages[0] = [msg, ...updatedPages[0]];
          return { ...old, pages: updatedPages };
        },
      );
    },
    [conversationId, qc],
  );

  useSocket('new_message', handleNewMessage, [conversationId]);

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      messagesService.sendMessage(conversationId!, content),
    onSuccess: (newMsg: Message) => {
      handleNewMessage(newMsg);
    },
  });

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    setText('');
    sendMutation.mutate(trimmed);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === currentUser?.id;
    const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
      addSuffix: true,
    });

    return (
      <View
        style={[
          styles.messageRow,
          isOwn ? styles.messageRowOwn : styles.messageRowOther,
        ]}
      >
        {!isOwn && (
          <Avatar uri={item.sender?.avatarUrl} size={28} name={item.sender?.username} />
        )}
        <View style={styles.messageBubbleWrapper}>
          <View
            style={[
              styles.bubble,
              isOwn ? styles.bubbleOwn : styles.bubbleOther,
            ]}
          >
            <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>
              {item.content}
            </Text>
          </View>
          <Text style={[styles.messageTime, isOwn && styles.messageTimeOwn]}>
            {timeAgo}
          </Text>
        </View>
      </View>
    );
  };

  const headerTitle = otherUser?.displayName || otherUser?.username || 'Chat';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Avatar uri={otherUser?.avatarUrl} size={32} name={otherUser?.username} />
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.headerName}>{headerTitle}</Text>
              </View>
              {conversation?.streak && conversation.streak >= 2 ? (
                <View style={{ marginLeft: 6 }}>
                  <StreakBadge count={conversation.streak} />
                </View>
              ) : null}
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
              <Ionicons name="chevron-back" size={24} color={Colors.textDark} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: Colors.backgroundDark },
          headerTintColor: Colors.textDark,
        }}
      />

      {/* Messages list */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item: Message) => item.id}
          renderItem={renderMessage}
          inverted
          onEndReached={() =>
            hasNextPage && !isFetchingNextPage && fetchNextPage()
          }
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator color={Colors.primary} style={{ padding: 12 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Say hi!</Text>
            </View>
          }
        />
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.textInput}
          placeholder="Message..."
          placeholderTextColor={Colors.muted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
          returnKeyType="send"
          blurOnSubmit={false}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubbleWrapper: {
    maxWidth: '72%',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bubbleOwn: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.surfaceDark,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextOwn: {
    color: '#fff',
  },
  messageTime: {
    color: Colors.muted,
    fontSize: 11,
    marginTop: 3,
    marginLeft: 4,
  },
  messageTimeOwn: {
    textAlign: 'right',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: Colors.muted,
    fontSize: 16,
  },
  emptySubtext: {
    color: Colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundDark,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 120,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});
