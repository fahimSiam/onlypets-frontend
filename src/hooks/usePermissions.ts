import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';

export function useLocationPermission() {
  const [granted, setGranted] = useState(false);
  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(({ status }) => setGranted(status === 'granted'));
  }, []);
  return granted;
}

export function useNotificationPermission() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    Notifications.requestPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Notifications.getExpoPushTokenAsync().then(t => setToken(t.data));
      }
    });
  }, []);
  return token;
}

export function useCameraPermission() {
  const [granted, setGranted] = useState(false);
  useEffect(() => {
    ImagePicker.requestCameraPermissionsAsync().then(({ status }) => setGranted(status === 'granted'));
  }, []);
  return granted;
}
