import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storiesService } from '../../src/services/stories.service';
import { mediaService } from '../../src/services/media.service';
import { QueryKeys } from '../../src/constants/queryKeys';
import { Colors } from '../../src/constants/colors';

type MediaAsset = {
  uri: string;
  type: 'image' | 'video';
  mimeType?: string;
};

export default function CreateStoryModal() {
  const qc = useQueryClient();
  const [media, setMedia] = useState<MediaAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.85,
      videoMaxDuration: 15,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const isVideo = asset.type === 'video';
      setMedia({
        uri: asset.uri,
        type: isVideo ? 'video' : 'image',
        mimeType: isVideo ? 'video/mp4' : (asset.mimeType ?? 'image/jpeg'),
      });
    }
  };

  const handlePost = async () => {
    if (!media) {
      Alert.alert('No media', 'Please select an image or video first.');
      return;
    }

    try {
      setUploading(true);

      if (media.type === 'image') {
        const mime = media.mimeType ?? 'image/jpeg';
        const { uploadUrl, publicUrl } = await mediaService.getImageUploadUrl(mime, 'stories');
        await mediaService.uploadImageToR2(uploadUrl, media.uri, mime);
        await storiesService.createStory({ mediaUrl: publicUrl, type: 'image' });
      } else {
        const { uploadUrl, videoId } = await mediaService.initVideoUpload();
        await mediaService.uploadVideoToStream(uploadUrl, media.uri);
        const videoUrl = `https://videodelivery.net/${videoId}/manifest/video.m3u8`;
        await storiesService.createStory({
          mediaUrl: videoUrl,
          type: 'video',
          cloudflareVideoId: videoId,
        });
      }

      await qc.invalidateQueries({ queryKey: QueryKeys.stories });
      router.back();
    } catch (err) {
      Alert.alert('Upload failed', 'Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Story</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={!media || uploading}
          style={styles.headerButton}
        >
          {uploading ? (
            <ActivityIndicator color={Colors.primary} size="small" />
          ) : (
            <Text style={[styles.postText, (!media || uploading) && styles.postTextDisabled]}>
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Preview / Picker */}
      <View style={styles.previewContainer}>
        {media ? (
          <>
            {media.type === 'image' ? (
              <Image
                source={{ uri: media.uri }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            ) : (
              <Video
                source={{ uri: media.uri }}
                style={StyleSheet.absoluteFill}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                useNativeControls={false}
                isMuted
              />
            )}
            {/* Re-pick button */}
            <TouchableOpacity style={styles.changeButton} onPress={pickMedia}>
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.pickButton} onPress={pickMedia}>
            <Ionicons name="images-outline" size={56} color={Colors.muted} />
            <Text style={styles.pickText}>Select Photo or Video</Text>
            <Text style={styles.pickSubtext}>Videos up to 15 seconds</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Upload progress hint */}
      {uploading && (
        <View style={styles.uploadingBanner}>
          <ActivityIndicator color={Colors.primary} size="small" />
          <Text style={styles.uploadingText}>Uploading your story...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelText: {
    color: Colors.muted,
    fontSize: 15,
  },
  postText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'right',
  },
  postTextDisabled: {
    opacity: 0.4,
  },
  previewContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    backgroundColor: Colors.surfaceDark,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  pickText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickSubtext: {
    color: Colors.muted,
    fontSize: 13,
  },
  changeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  uploadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: Colors.surfaceDark,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  uploadingText: {
    color: Colors.muted,
    fontSize: 14,
  },
});
