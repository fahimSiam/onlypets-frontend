import { TouchableOpacity, Text, View } from 'react-native';
import { Avatar } from '../ui/Avatar';
import type { Story } from '../../types/post.types';

interface StoryBubbleProps {
  story: Story;
  onPress: () => void;
  isOwn?: boolean;
}

export function StoryBubble({ story, onPress, isOwn = false }: StoryBubbleProps) {
  const name = isOwn ? 'Your Story' : (story.user?.displayName || story.user?.username || '');
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', marginRight: 12 }}>
      <Avatar
        uri={story.user?.avatarUrl}
        size={56}
        name={name}
        hasStory
      />
      <Text style={{ color: '#FFFFFF', fontSize: 11, marginTop: 4, maxWidth: 64, textAlign: 'center' }} numberOfLines={1}>
        {isOwn ? 'Your Story' : story.user?.username}
      </Text>
    </TouchableOpacity>
  );
}

export function AddStoryBubble({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', marginRight: 12 }}>
      <View style={{
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5, borderColor: '#2A2A2A', borderStyle: 'dashed',
      }}>
        <Text style={{ color: '#FF6B35', fontSize: 28, lineHeight: 32 }}>+</Text>
      </View>
      <Text style={{ color: '#888', fontSize: 11, marginTop: 4 }}>Add Story</Text>
    </TouchableOpacity>
  );
}
