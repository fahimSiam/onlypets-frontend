import {
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView,
  StyleSheet, StatusBar, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { mediaService } from '../../src/services/media.service';
import { postsService } from '../../src/services/posts.service';
import { QueryKeys } from '../../src/constants/queryKeys';

export default function CreatePostModal() {
  const qc = useQueryClient();
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const publish = async () => {
    if (!imageUri) { Alert.alert('No photo', 'Please select a photo first.'); return; }
    try {
      setUploading(true);
      const { uploadUrl, publicUrl } = await mediaService.getImageUploadUrl('image/jpeg', 'posts');
      await mediaService.uploadImageToR2(uploadUrl, imageUri, 'image/jpeg');
      await postsService.createPost({
        type: 'image',
        mediaUrls: [publicUrl],
        caption,
        hashtags: caption.match(/#\w+/g)?.map(t => t.slice(1)) ?? [],
      });
      qc.invalidateQueries({ queryKey: QueryKeys.feed() });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to publish. Check your connection.');
    } finally {
      setUploading(false);
    }
  };

  const charCount = caption.length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity
          onPress={publish}
          disabled={uploading || !imageUri}
          style={[styles.shareBtn, (!imageUri || uploading) && styles.shareBtnDisabled]}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.shareBtnText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Image picker */}
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker} activeOpacity={0.8}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              contentFit="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <View style={styles.imagePlaceholderIcon}>
                <Ionicons name="image-outline" size={40} color="#444" />
              </View>
              <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
              <Text style={styles.imagePlaceholderSub}>Square format works best</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption */}
        <View style={styles.captionArea}>
          <TextInput
            style={styles.captionInput}
            placeholder="Write a caption… #hashtags welcome"
            placeholderTextColor="#444"
            multiline
            value={caption}
            onChangeText={setCaption}
            maxLength={2200}
          />
          <Text style={styles.charCount}>{charCount}/2200</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14,
    borderBottomWidth: 0.5, borderBottomColor: '#1E1E1E',
  },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  shareBtn: {
    backgroundColor: '#6BC24A', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 8,
  },
  shareBtnDisabled: { opacity: 0.4 },
  shareBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  scroll: { flex: 1 },
  imagePicker: {
    margin: 16, borderRadius: 20, overflow: 'hidden',
    aspectRatio: 1, backgroundColor: '#141414',
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#2A2A2A', borderStyle: 'dashed', borderRadius: 20,
  },
  imagePlaceholderIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center',
  },
  imagePlaceholderText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  imagePlaceholderSub: { color: '#555', fontSize: 13 },
  captionArea: { paddingHorizontal: 16, paddingBottom: 16 },
  captionInput: {
    color: '#FFFFFF', fontSize: 15, lineHeight: 22,
    minHeight: 100, textAlignVertical: 'top',
  },
  charCount: { color: '#444', fontSize: 12, textAlign: 'right', marginTop: 8 },
});
