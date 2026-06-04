import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedService } from '../services/feed.service';
import { postsService } from '../services/posts.service';
import { QueryKeys } from '../constants/queryKeys';

export function useFeed() {
  return useInfiniteQuery({
    queryKey: QueryKeys.feed(),
    queryFn: ({ pageParam = 1 }) => feedService.getHomeFeed(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => lastPage.length === 12 ? pages.length + 1 : undefined,
  });
}

export function useTrending() {
  return useInfiniteQuery({
    queryKey: QueryKeys.trending(),
    queryFn: ({ pageParam = 1 }) => feedService.getTrending(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (last, pages) => last.length === 12 ? pages.length + 1 : undefined,
  });
}

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      liked ? postsService.unlikePost(postId) : postsService.likePost(postId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
