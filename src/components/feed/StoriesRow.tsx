import { ScrollView, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const push = (href: any) => router.push(href);
import { storiesService } from '../../services/stories.service';
import { QueryKeys } from '../../constants/queryKeys';
import { StoryBubble, AddStoryBubble } from './StoryBubble';
import { Skeleton } from '../ui/SkeletonLoader';

export function StoriesRow() {
  const { data: stories = [], isLoading } = useQuery({
    queryKey: QueryKeys.stories,
    queryFn: storiesService.getFeedStories,
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
    >
      <AddStoryBubble onPress={() => push('/modals/create-story')} />
      {isLoading
        ? [1, 2, 3].map((k) => (
            <View key={k} style={{ alignItems: 'center', marginRight: 12 }}>
              <Skeleton style={{ width: 64, height: 64, borderRadius: 32 }} />
              <Skeleton style={{ width: 50, height: 10, marginTop: 4 }} />
            </View>
          ))
        : stories.map((story) => (
            <StoryBubble
              key={story.id}
              story={story}
              onPress={() => push({ pathname: '/modals/story-viewer', params: { storyId: story.id } })}
            />
          ))}
    </ScrollView>
  );
}
