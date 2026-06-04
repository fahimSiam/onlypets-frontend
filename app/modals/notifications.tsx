import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { notificationsService, type Notification } from '../../src/services/notifications.service';
import { QueryKeys } from '../../src/constants/queryKeys';
import { Colors } from '../../src/constants/colors';

const NOTIFICATION_ICONS: Record<string, string> = {
  like: '❤️',
  comment: '💬',
  follow: '👤',
  friend_request: '🤝',
  match: '🐾',
  badge_earned: '🏆',
  streak_warning: '🔥',
  subscription: '💳',
};

function NotificationItem({ item, onPress }: { item: Notification; onPress: () => void }) {
  const icon = NOTIFICATION_ICONS[item.type] ?? '🔔';
  const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        backgroundColor: item.isRead ? Colors.backgroundDark : Colors.surfaceDark + 'AA',
      }}
    >
      <View style={{
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: Colors.surfaceDark,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FFFFFF', fontWeight: item.isRead ? '400' : '700', fontSize: 14, marginBottom: 2 }}>
          {item.title}
        </Text>
        <Text style={{ color: Colors.muted, fontSize: 13, lineHeight: 18 }} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={{ color: Colors.muted, fontSize: 12, marginTop: 4 }}>{timeAgo}</Text>
      </View>
      {!item.isRead && (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginTop: 4 }} />
      )}
    </TouchableOpacity>
  );
}

export default function NotificationsModal() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: QueryKeys.notifications,
    queryFn: ({ pageParam = 1 }) => notificationsService.getNotifications(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last: Notification[], pages) =>
      last.length === 20 ? pages.length + 1 : undefined,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QueryKeys.notifications });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const allNotifs = data?.pages.flat() ?? [];
      const unread = allNotifs.filter((n) => !n.isRead);
      await Promise.all(unread.map((n) => notificationsService.markRead(n.id)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QueryKeys.notifications });
    },
  });

  const notifications = data?.pages.flat() ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundDark }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 8,
        paddingHorizontal: 16,
        paddingBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: '#FFFFFF', fontWeight: '700', fontSize: 17 }}>Notifications</Text>
        {hasUnread && (
          <TouchableOpacity
            onPress={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            {markAllReadMutation.isPending ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 14 }}>Mark all read</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={() => hasNextPage && !isFetching && fetchNextPage()}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onPress={() => {
              if (!item.isRead) {
                markReadMutation.mutate(item.id);
              }
            }}
          />
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: Colors.border }} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ padding: 60, alignItems: 'center' }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <View style={{ padding: 60, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>✅</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>You're all caught up!</Text>
              <Text style={{ color: Colors.muted, fontSize: 14, marginTop: 6, textAlign: 'center' }}>
                No new notifications right now
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetching && !isLoading ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
}
