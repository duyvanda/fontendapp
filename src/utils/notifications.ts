import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { LOCALURL } from './api';
import { savePushToken, getPushToken, removePushToken } from '@/storage/notification';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(manv: string) {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00A79D',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      
      console.log('Expo Push Token:', token);
      
      // Save token locally
      await savePushToken(token);
      
      // Send token to backend
      const res = await fetch(`${LOCALURL}/post_data/expo_push_token_register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          manv,
          token: token,
          platform: Platform.OS,
        }]),
      });
      const data = await res.json();
      if (data.status !== 'success') {
        console.error('Lỗi lưu Token Backend: ', data.error_message || data);
      }

    } catch (e: any) {
      console.error('Error registering for push notifications:', e);
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  return token;
}

export async function unregisterPushToken(manv: string) {
  try {
    const token = await getPushToken();
    if (token) {
      await fetch(`${LOCALURL}/post_data/expo_push_token_unregister/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          token: token,
        }]),
      });
      await removePushToken();
    }
  } catch (e) {
    console.error('Error unregistering push token:', e);
  }
}
