import { View, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const push = (href: any) => router.push(href);
import { Ionicons } from '@expo/vector-icons';
import type { Post } from '../../types/post.types';

const ITEM_SIZE = Dimensions.get('window').width / 3;

interface PostsGridProps {
  posts: Post[];
}

export function PostsGrid({ posts }: PostsGridProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {posts.map((post) => (
        <TouchableOpacity
          key={post.id}
          style={{ width: ITEM_SIZE, height: ITEM_SIZE, padding: 1 }}
          onPress={() => push({ pathname: '/modals/post-detail', params: { postId: post.id } })}
        >
          <Image
            source={{ uri: post.thumbnailUrl ?? post.mediaUrls?.[0] ?? '' }}
            style={{ width: '100%', height: '100%', backgroundColor: '#1A1A1A' }}
            contentFit="cover"
          />
          {post.type === 'video' && (
            <View style={{ position: 'absolute', top: 6, right: 6 }}>
              <Ionicons name="play" size={16} color="#FFFFFF" />
            </View>
          )}
          {post.type === 'carousel' && (
            <View style={{ position: 'absolute', top: 6, right: 6 }}>
              <Ionicons name="copy-outline" size={16} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
