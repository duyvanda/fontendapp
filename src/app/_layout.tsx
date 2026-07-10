import { Stack } from 'expo-router';
import { FeedbackProvider } from '@/context/FeedbackContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
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
