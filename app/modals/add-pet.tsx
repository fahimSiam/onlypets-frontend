import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../src/components/ui/Avatar';
import { Button } from '../../src/components/ui/Button';
import { petsService } from '../../src/services/pets.service';
import { mediaService } from '../../src/services/media.service';
import { QueryKeys } from '../../src/constants/queryKeys';
import { Colors } from '../../src/constants/colors';
import type { Pet } from '../../src/types/user.types';

type Species = Pet['species'];

const SPECIES_OPTIONS: { value: Species; emoji: string; label: string }[] = [
  { value: 'dog', emoji: '🐕', label: 'Dog' },
  { value: 'cat', emoji: '🐱', label: 'Cat' },
  { value: 'bird', emoji: '🦜', label: 'Bird' },
  { value: 'fish', emoji: '🐟', label: 'Fish' },
  { value: 'rabbit', emoji: '🐰', label: 'Rabbit' },
  { value: 'reptile', emoji: '🦎', label: 'Reptile' },
  { value: 'other', emoji: '🐾', label: 'Other' },
];

export default function AddPetModal() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: Partial<Pet>) => petsService.createPet(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QueryKeys.myPets });
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Could not create pet. Please try again.');
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
      const { uploadUrl, publicUrl } = await mediaService.getImageUploadUrl(contentType, 'pets');
      await mediaService.uploadImageToR2(uploadUrl, asset.uri, contentType);
      setUploadedAvatarUrl(publicUrl);
    } catch {
      Alert.alert('Upload failed', 'Could not upload photo. Try again.');
      setAvatarUri(null);
    } finally {
      setAvatarUploading(false);
    }
  }, []);

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your pet\'s name.');
      return;
    }
    const ageNum = age.trim() ? parseInt(age, 10) : undefined;
    createMutation.mutate({
      name: name.trim(),
      species,
      breed: breed.trim() || undefined,
      age: Number.isFinite(ageNum) ? ageNum : undefined,
      bio: bio.trim() || undefined,
      avatarUrl: uploadedAvatarUrl ?? undefined,
    } as Partial<Pet>);
  };

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
        <Text style={{ flex: 1, color: '#FFFFFF', fontWeight: '700', fontSize: 17, textAlign: 'center' }}>Add a Pet</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Avatar picker */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <TouchableOpacity onPress={pickAvatar} disabled={avatarUploading}>
            <View style={{ position: 'relative' }}>
              {avatarUri ? (
                <Avatar uri={avatarUri} size={90} name={name || 'Pet'} />
              ) : (
                <View style={{
                  width: 94,
                  height: 94,
                  borderRadius: 47,
                  backgroundColor: Colors.surfaceDark,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: Colors.border,
                  borderStyle: 'dashed',
                }}>
                  <Ionicons name="paw-outline" size={32} color={Colors.muted} />
                </View>
              )}
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
            </View>
          </TouchableOpacity>
          <Text style={{ color: Colors.muted, fontSize: 12, marginTop: 6 }}>
            {avatarUploading ? 'Uploading...' : 'Add a photo (optional)'}
          </Text>
        </View>

        {/* Name */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: Colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Name *
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your pet's name"
            placeholderTextColor={Colors.muted}
            style={{
              backgroundColor: Colors.surfaceDark,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: '#FFFFFF',
              fontSize: 15,
            }}
            maxLength={40}
            returnKeyType="next"
          />
        </View>

        {/* Species */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: Colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Species
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {SPECIES_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setSpecies(opt.value)}
                style={{
                  backgroundColor: species === opt.value ? Colors.primary + '22' : Colors.surfaceDark,
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: 1.5,
                  borderColor: species === opt.value ? Colors.primary : Colors.border,
                  alignItems: 'center',
                  gap: 4,
                  minWidth: 70,
                }}
              >
                <Text style={{ fontSize: 22 }}>{opt.emoji}</Text>
                <Text style={{ color: species === opt.value ? Colors.primary : Colors.muted, fontSize: 12, fontWeight: '600' }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Breed */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: Colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Breed (optional)
          </Text>
          <TextInput
            value={breed}
            onChangeText={setBreed}
            placeholder="e.g. Golden Retriever"
            placeholderTextColor={Colors.muted}
            style={{
              backgroundColor: Colors.surfaceDark,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: '#FFFFFF',
              fontSize: 15,
            }}
            maxLength={60}
            returnKeyType="next"
          />
        </View>

        {/* Age */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: Colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Age in years (optional)
          </Text>
          <TextInput
            value={age}
            onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
            placeholder="e.g. 3"
            placeholderTextColor={Colors.muted}
            keyboardType="number-pad"
            style={{
              backgroundColor: Colors.surfaceDark,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: '#FFFFFF',
              fontSize: 15,
            }}
            maxLength={3}
            returnKeyType="next"
          />
        </View>

        {/* Bio */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ color: Colors.muted, fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Bio (optional)
          </Text>
          <TextInput
            value={bio}
            onChangeText={(t) => t.length <= 200 && setBio(t)}
            placeholder="Tell everyone about your pet..."
            placeholderTextColor={Colors.muted}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: Colors.surfaceDark,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: '#FFFFFF',
              fontSize: 15,
              height: 90,
              textAlignVertical: 'top',
            }}
          />
          <Text style={{ color: Colors.muted, fontSize: 11, marginTop: 4, textAlign: 'right' }}>{bio.length}/200</Text>
        </View>

        <Button
          label="Create Pet Page"
          onPress={handleCreate}
          variant="primary"
          loading={createMutation.isPending}
          disabled={avatarUploading || !name.trim()}
        />
      </ScrollView>
    </View>
  );
}
