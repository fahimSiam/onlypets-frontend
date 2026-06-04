import { TouchableOpacity, View, Text } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { StreakBadge } from '../ui/StreakBadge';
import type { Conversation } from '../../types/message.types';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../stores/auth.store';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const { user } = useAuthStore();
  const other = conversation.participants.find((p) => p.id !== user?.id);
  const timeAgo = conversation.lastMessageAt
    ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
    : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}
    >
      <Avatar uri={other?.avatarUrl} size={50} name={other?.displayName ?? other?.username ?? ''} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>
          {other?.displayName ?? other?.username}
        </Text>
        <Text style={{ color: '#888', fontSize: 13, marginTop: 2 }} numberOfLines={1}>
          {timeAgo}
        </Text>
      </View>
      <StreakBadge count={conversation.streak ?? 0} />
    </TouchableOpacity>
  );
}
