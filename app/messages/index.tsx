import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { messagesService } from '../../src/services/messages.service';
import { QueryKeys } from '../../src/constants/queryKeys';
import { Colors } from '../../src/constants/colors';
import { Avatar } from '../../src/components/ui/Avatar';
import { StreakBadge } from '../../src/components/ui/StreakBadge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { useAuthStore } from '../../src/stores/auth.store';
import type { Conversation } from '../../src/types/message.types';
import type { User } from '../../src/types/user.types';
import { formatDistanceToNow } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuthStore();

  const { data: conversations = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: QueryKeys.conversations,
    queryFn: messagesService.getConversations,
  });

  const getOtherParticipant = (conv: Conversation): User | undefined => {
    return conv.participants.find((p: User) => p.id !== currentUser?.id) ?? conv.participants[0];
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const other = getOtherParticipant(item);
    const timeAgo = item.lastMessageAt
      ? formatDistanceToNow(new Date(item.lastMessageAt), { addSuffix: true })
      : '';

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => router.push(`/messages/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <Avatar uri={other?.avatarUrl} size={48} name={other?.username} />
        <View style={styles.conversationInfo}>
          <View style={styles.conversationTop}>
            <Text style={styles.conversationName} numberOfLines={1}>
              {other?.displayName || other?.username || 'Unknown'}
            </Text>
            {item.streak && item.streak >= 2 ? (
              <StreakBadge count={item.streak} />
            ) : null}
          </View>
          {timeAgo ? (
            <Text style={styles.conversationTime}>{timeAgo}</Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ title: 'Messages', headerShown: true }} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item: Conversation) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              emoji="💬"
              title="No messages yet"
              subtitle="Start a conversation with someone"
            />
          }
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
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
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  conversationInfo: {
    flex: 1,
    gap: 4,
  },
  conversationTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conversationName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    flex: 1,
  },
  conversationTime: {
    color: Colors.muted,
    fontSize: 12,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 76,
  },
});
