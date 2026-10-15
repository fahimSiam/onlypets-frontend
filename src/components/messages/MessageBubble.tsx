import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import type { Message } from '../../types/message.types';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = format(new Date(message.createdAt), 'HH:mm');

  return (
    <View style={{
      alignItems: isOwn ? 'flex-end' : 'flex-start',
      marginBottom: 8,
      paddingHorizontal: 16,
    }}>
      {message.type === 'image' && message.mediaUrl ? (
        <View>
          <Image
            source={{ uri: message.mediaUrl }}
            style={{ width: 200, height: 200, borderRadius: 12 }}
            contentFit="cover"
          />
          <Text style={{ color: '#888', fontSize: 11, marginTop: 4, textAlign: isOwn ? 'right' : 'left' }}>{time}</Text>
        </View>
      ) : (
        <View style={{
          backgroundColor: isOwn ? '#6BC24A' : '#1A1A1A',
          borderRadius: 18,
          borderBottomRightRadius: isOwn ? 4 : 18,
          borderBottomLeftRadius: isOwn ? 18 : 4,
          paddingHorizontal: 14,
          paddingVertical: 10,
          maxWidth: '75%',
        }}>
          <Text style={{ color: '#FFFFFF', fontSize: 15 }}>{message.content}</Text>
          <Text style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : '#888', fontSize: 10, marginTop: 4, textAlign: 'right' }}>{time}</Text>
        </View>
      )}
    </View>
  );
}
