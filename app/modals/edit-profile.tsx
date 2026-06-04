import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { useMyProfile } from '../../src/hooks/useProfile';
import { usersService } from '../../src/services/users.service';
import { mediaService } from '../../src/services/media.service';
import { QueryKeys } from '../../src/constants/queryKeys';
import { Colors } from '../../src/constants/colors';

const MAX_BIO = 300;

export default function EditProfileModal() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { data: profile } = useMyProfile();

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatarUrl ?? null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: (data: { displayName?: string | null; bio?: string | null; avatarUrl?: string | null }) =>
      usersService.updateMe(data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: QueryKeys.myProfile });
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    },
  });

  const pickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setAvatarUri(asset.uri);
    setAvatarUploading(true);
    try {
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
      const { uploadUrl, publicUrl } = await mediaService.getImageUploadUrl(contentType, 'avatars');
      await mediaService.uploadImageToR2(uploadUrl, asset.uri, contentType);
      setPendingAvatarUrl(publicUrl);
    } catch {
      Alert.alert('Upload failed', 'Could not upload avatar. Try again.');
      setAvatarUri(profile?.avatarUrl ?? null);
    } finally {
      setAvatarUploading(false);
    }
  }, [profile?.avatarUrl]);

  const handleSave = () => {
    updateMutation.mutate({
      displayName: displayName.trim() || null,
      bio: bio.trim() || null,
      avatarUrl: pendingAvatarUrl ?? profile?.avatarUrl ?? null,
    });
  };

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.backgroundDark, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

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
          <Text style={{ color: Colors.muted, fontSize: 15 }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, color: '#FFFFFF', fontWeight: '700', fontSize: 17, textAlign: 'center' }}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={updateMutation.isPending || avatarUploading}
          style={{ paddingLeft: 12 }}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 15 }}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <TouchableOpacity onPress={pickAvatar} disabled={avatarUploading} style={{ position: 'relative' }}>
            <Avatar uri={avatarUri} size={90} name={profile.displayName ?? profile.username} />
            <View style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              backgroundColor: Colors.primary,
              borderRadius: 14,
              width: 28,
              height: 28,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: Colors.backgroundDark,
            }}>
              {avatarUploading
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Ionicons name="camera" size={14} color="#FFFFFF" />
              }
            </View>
          </TouchableOpacity>
          <Text style={{ color: Colors.primary, fontSize: 13, marginTop: 8, fontWeight: '600' }}>
            {avatarUploading ? 'Uploading...' : 'Change photo'}
          </Text>
        </View>

        {/* Username (read-only) */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: Colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Username
          </Text>
          <View style={{ backgroundColor: Colors.surfaceDark, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: Colors.muted, fontSize: 15 }}>@</Text>
            <Text style={{ color: Colors.muted, fontSize: 15 }}>{profile.username}</Text>
            <View style={{ flex: 1 }} />
            <Ionicons name="lock-closed-outline" size={14} color={Colors.muted} />
          </View>
          <Text style={{ color: Colors.muted, fontSize: 11, marginTop: 4 }}>Username cannot be changed</Text>
        </View>

        {/* Display name */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: Colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Display Name
          </Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your display name"
            placeholderTextColor={Colors.muted}
            style={{
              backgroundColor: Colors.surfaceDark,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: '#FFFFFF',
              fontSize: 15,
            }}
            maxLength={50}
            returnKeyType="done"
          />
        </View>

        {/* Bio */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: Colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Bio
            </Text>
            <Text style={{ color: bio.length > MAX_BIO * 0.9 ? Colors.danger : Colors.muted, fontSize: 12 }}>
              {bio.length}/{MAX_BIO}
            </Text>
          </View>
          <TextInput
            value={bio}
            onChangeText={(t) => t.length <= MAX_BIO && setBio(t)}
            placeholder="Tell the world about you and your pets..."
            placeholderTextColor={Colors.muted}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: Colors.surfaceDark,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: '#FFFFFF',
              fontSize: 15,
              height: 100,
              textAlignVertical: 'top',
            }}
          />
        </View>

        <Button
          label="Save Changes"
          onPress={handleSave}
          variant="primary"
          loading={updateMutation.isPending}
          disabled={avatarUploading}
        />
      </ScrollView>
    </View>
  );
}
