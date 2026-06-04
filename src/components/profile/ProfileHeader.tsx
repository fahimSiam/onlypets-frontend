import { View, Text, TouchableOpacity } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { BadgeChip } from '../ui/BadgeChip';
import type { User } from '../../types/user.types';
import type { UserBadge } from '../../types/user.types';

interface ProfileHeaderProps {
  user: User;
  postCount: number;
  followerCount: number;
  followingCount: number;
  badges: UserBadge[];
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onEditProfile?: () => void;
  onMessage?: () => void;
}

export function ProfileHeader({
  user, postCount, followerCount, followingCount, badges,
  isOwnProfile, isFollowing, onFollow, onUnfollow, onEditProfile, onMessage,
}: ProfileHeaderProps) {
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Avatar uri={user.avatarUrl} size={80} name={user.displayName ?? user.username} />
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginLeft: 16 }}>
          {[
            { label: 'Posts', value: postCount },
            { label: 'Followers', value: followerCount },
            { label: 'Following', value: followingCount },
          ].map(({ label, value }) => (
            <View key={label} style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 18 }}>{value.toLocaleString()}</Text>
              <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>
        {user.displayName ?? user.username}
      </Text>
      <Text style={{ color: '#888', fontSize: 13 }}>@{user.username}</Text>
      {user.bio && (
        <Text style={{ color: '#FFFFFF', fontSize: 14, marginTop: 6 }}>{user.bio}</Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
        <Text style={{ color: '#FF6B35', fontWeight: '600', fontSize: 13 }}>⭐ {user.totalPoints.toLocaleString()} pts</Text>
        {user.currentStreak > 1 && (
          <Text style={{ color: '#FF6B35', fontSize: 13 }}>🔥 {user.currentStreak} day streak</Text>
        )}
      </View>

      {badges.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {badges.slice(0, 4).map((ub) => (
            <BadgeChip key={ub.id} slug={ub.badge.slug} name={ub.badge.name} tier={ub.badge.tier} size="sm" />
          ))}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        {isOwnProfile ? (
          <Button label="Edit Profile" onPress={onEditProfile!} variant="outline" size="sm" style={{ flex: 1 }} />
        ) : (
          <>
            <Button
              label={isFollowing ? 'Following' : 'Follow'}
              onPress={isFollowing ? onUnfollow! : onFollow!}
              variant={isFollowing ? 'outline' : 'primary'}
              size="sm"
              style={{ flex: 1 }}
            />
            <Button label="Message" onPress={onMessage!} variant="outline" size="sm" style={{ flex: 1 }} />
          </>
        )}
      </View>
    </View>
  );
}
