import { Stack } from 'expo-router';
import { FeedbackProvider } from '@/context/FeedbackContext';

export default function RootLayout() {
  return (
    <FeedbackProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="report" />
      </Stack>
    </FeedbackProvider>
  );
}
