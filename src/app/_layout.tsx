import { FeedbackProvider } from '@/context/FeedbackContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    async function check_and_apply_update() {
      if (__DEV__) return;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // reload ngay, không cần tắt app 2 lần
        }
      } catch (e) { }
    }
    check_and_apply_update();
  }, []);

  return (
    <FeedbackProvider>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="report" />
          <Stack.Screen name="account" />
          <Stack.Screen name="terms" />
        </Stack>
        {/* @ts-ignore */}
        <StatusBar style="light" backgroundColor="transparent" />
      </NotificationProvider>
    </FeedbackProvider>
  );
}
