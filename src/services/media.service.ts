import axios from 'axios';
import { apiClient } from './api.client';

export const mediaService = {
  async getImageUploadUrl(
    contentType: string,
    folder: 'posts' | 'stories' | 'avatars' | 'pets',
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    const res = await apiClient.post('/media/upload/image', {
      contentType,
      folder,
    });
    return res.data.data;
  },

  async uploadImageToR2(
    uploadUrl: string,
    uri: string,
    contentType: string,
  ): Promise<void> {
    const response = await fetch(uri);
    const blob = await response.blob();
    await axios.put(uploadUrl, blob, {
      headers: { 'Content-Type': contentType },
    });
  },

  async initVideoUpload(): Promise<{ uploadUrl: string; videoId: string }> {
    const res = await apiClient.post('/media/upload/video/init');
    return res.data.data;
  },

  async uploadVideoToStream(uploadUrl: string, uri: string): Promise<void> {
    const formData = new FormData();
    formData.append('file', { uri, type: 'video/mp4', name: 'video.mp4' } as any);
    await axios.post(uploadUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
