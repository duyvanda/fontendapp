import { FeedbackProvider } from '@/context/FeedbackContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, StyleSheet, Text, View } from 'react-native';

// Configure foreground notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [is_checking_update, set_is_checking_update] = useState(!__DEV__);
  const [update_status, set_update_status] = useState('Đang kiểm tra cập nhật...');

  useEffect(() => {
    async function check_and_apply_update(is_startup = false) {
      if (__DEV__) {
        if (is_startup) set_is_checking_update(false);
        return;
      }

      let is_cancelled = false;
      try {
        // Safe timeout 10 seconds for startup check
        const timeout_promise = new Promise<void>((resolve) => {
          setTimeout(() => {
            is_cancelled = true; // Flag: ngăn reloadAsync sau khi timeout
            resolve();
          }, 10000);
        });

        const check_promise = (async () => {
          if (is_startup) set_update_status('Đang kiểm tra cập nhật...');
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            if (is_startup) set_update_status('Đang tải bản cập nhật mới...');
            await Updates.fetchUpdateAsync();
            if (is_cancelled) return false; // Timeout đã thắng, không reload
            if (is_startup) set_update_status('Đang áp dụng cập nhật...');
            await Updates.reloadAsync();
            return true;
          }
          return false;
        })();

        await Promise.race([check_promise, timeout_promise]);
      } catch (e) {
        console.log('OTA Check error:', e);
      } finally {
        if (is_startup) set_is_checking_update(false);
      }
    }

    // Fast check on app startup
    check_and_apply_update(true);

    // TODO [OTA Background Resume]: Hiện tại khi app resume từ background,
    // nếu có OTA mới sẽ reloadAsync() mà KHÔNG hiện splash loading → app restart đột ngột.
    // Cần fix theo Cách A:
    //   1. Check ngầm → nếu CÓ update → set_is_checking_update(true) để hiện splash overlay
    //   2. Hiện text "Đang tải bản cập nhật mới..." → fetchUpdateAsync()
    //   3. Hiện text "Đang áp dụng..." → reloadAsync()
    //   4. Nếu KHÔNG có update → user dùng bình thường, không thấy gì
    // Silent background check on app resume from background
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        check_and_apply_update(false);
      }
    });

    return () => sub.remove();
  }, []);

  if (is_checking_update) {
    return (
      <View style={styles.splash_container}>
        <View style={styles.splash_content}>
          <Text style={styles.logo_title}>BI PORTAL</Text>
          <Text style={styles.logo_subtitle}>Multi-Tenant Business Intelligence Portal</Text>
          <ActivityIndicator size="large" color="#ffffff" style={styles.spinner} />
          <Text style={styles.status_text}>{update_status}</Text>
        </View>
        {/* @ts-ignore */}
        <StatusBar style="light" backgroundColor="transparent" />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  splash_container: {
    flex: 1,
    backgroundColor: '#00A79D',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  splash_content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo_title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 6,
  },
  logo_subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 40,
  },
  spinner: {
    marginBottom: 16,
  },
  status_text: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    opacity: 0.9,
  },
});
