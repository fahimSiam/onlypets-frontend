import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/users.service';
import { petsService } from '../services/pets.service';
import { badgesService } from '../services/badges.service';
import { QueryKeys } from '../constants/queryKeys';

export function useMyProfile() {
  return useQuery({
    queryKey: QueryKeys.myProfile,
    queryFn: usersService.getMe,
  });
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: QueryKeys.userProfile(userId),
    queryFn: () => usersService.getUser(userId),
    enabled: !!userId,
  });
}

export function useMyPets() {
  return useQuery({
    queryKey: QueryKeys.myPets,
    queryFn: petsService.getMyPets,
  });
}

export function useMyBadges() {
  return useQuery({
    queryKey: QueryKeys.myBadges,
    queryFn: badgesService.getMyBadges,
  });
}

export function useFollowUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersService.follow(userId),
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: QueryKeys.userProfile(userId) });
    },
  });
}

export function useUnfollowUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersService.unfollow(userId),
    onSuccess: (_, userId) => {
      qc.invalidateQueries({ queryKey: QueryKeys.userProfile(userId) });
    },
  });
}
