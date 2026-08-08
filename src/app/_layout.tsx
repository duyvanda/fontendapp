import VersionUpdateModal from '@/components/VersionUpdateModal';
import { AppVersionInfo, CURRENT_NATIVE_VERSION, check_version_status } from '@/constants/version';
import { FeedbackProvider } from '@/context/FeedbackContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { save_pending_notification } from '@/storage/notification';
import { LOCALURL, apiFetch } from '@/utils/api';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Platform, StyleSheet, Text, View } from 'react-native';

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
  const [version_info, set_version_info] = useState<AppVersionInfo | null>(null);
  const [show_version_modal, set_show_version_modal] = useState(false);

  useEffect(() => {
    /**
     * Capture notification đã dùng để mở app từ Killed State.
     *
     * Quan trọng:
     * Phải lưu xuống AsyncStorage TRƯỚC OTA.
     * Nếu Updates.reloadAsync() restart JS runtime thì deep-link
     * vẫn còn trong storage để xử lý ở lần boot tiếp theo.
     */
    async function capture_initial_notification(): Promise<boolean> {
      try {
        const response = Notifications.getLastNotificationResponse();

        if (!response) {
          return false;
        }

        if (
          response.actionIdentifier !==
          Notifications.DEFAULT_ACTION_IDENTIFIER
        ) {
          return false;
        }

        const data = response.notification.request.content.data;
        const report_stt = data?.report_stt;

        if (
          report_stt === undefined ||
          report_stt === null ||
          String(report_stt).trim() === ''
        ) {
          return false;
        }

        await save_pending_notification({
          notification_id: response.notification.request.identifier,
          report_stt: String(report_stt),
          captured_at: Date.now(),
        });

        console.log(
          '[RootLayout] Captured initial notification:',
          String(report_stt),
        );

        return true;
      } catch (error) {
        console.log(
          '[RootLayout] Initial notification capture error:',
          error,
        );

        return false;
      }
    }

    async function check_native_version_api(): Promise<boolean> {
      try {
        const timeout_promise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
        const api_promise = apiFetch<any>(`${LOCALURL}/get_data/expo_check_app_version/?platform=${Platform.OS}`);

        const res = await Promise.race([api_promise, timeout_promise]);
        if (res && res.status === 'ok' && res.rows_data && res.rows_data.length > 0) {
          const info: AppVersionInfo = res.rows_data[0];
          set_version_info(info);

          const { is_force, has_update } = check_version_status(CURRENT_NATIVE_VERSION, info);

          if (has_update) {
            set_show_version_modal(true);
            // Trả về true nếu là Bắt buộc Cập nhật -> Dừng luồng OTA check ở Splash
            return is_force;
          }
        }
      } catch (e) {
        console.log('Version Check API error / timeout:', e);
      }
      return false;
    }

    let is_running = false;
    async function check_and_apply_update(is_startup = false) {
      if (__DEV__) {
        if (is_startup) set_is_checking_update(false);
        return;
      }

      // Mutex: không cho chạy nhiều luồng Version/OTA cùng lúc
      if (is_running) return;
      is_running = true;

      // Nếu timeout nhưng OTA Promise vẫn đang chạy,
      // giữ mutex cho đến khi Promise cũ thực sự kết thúc.
      let release_lock_in_background = false;

      try {
        // =========================================================
        // 1. KIỂM TRA NATIVE VERSION TRƯỚC
        // =========================================================
        if (is_startup) {
          set_update_status('Đang kiểm tra phiên bản...');
        }

        const has_native_update = await check_native_version_api();

        // Nếu Native Store đang yêu cầu Force Update:
        // dừng hoàn toàn luồng OTA.
        if (has_native_update) {
          return;
        }

        // =========================================================
        // 2. KIỂM TRA OTA UPDATE
        // =========================================================
        let is_cancelled = false;
        let timeout_id: ReturnType<typeof setTimeout> | null = null;

        const check_promise = (async (): Promise<boolean> => {
          try {
            if (is_startup) {
              set_update_status('Đang kiểm tra bản cập nhật OTA...');
            }

            const update = await Updates.checkForUpdateAsync();

            // Nếu timeout xảy ra trong lúc đang check:
            // không bắt đầu download OTA nữa.
            if (is_cancelled) {
              return false;
            }

            if (!update.isAvailable) {
              return false;
            }

            if (is_startup) {
              set_update_status('Đang tải bản cập nhật mới...');
            }

            await Updates.fetchUpdateAsync();

            // fetchUpdateAsync không có cơ chế cancel ở đây.
            // Nếu timeout xảy ra trong lúc download thì:
            // cho download hoàn tất nhưng tuyệt đối không reload app.
            if (is_cancelled) {
              return false;
            }

            if (is_startup) {
              set_update_status('Đang áp dụng cập nhật...');
            }

            await Updates.reloadAsync();

            return true;
          } catch (e) {
            console.log('OTA Check error:', e);
            return false;
          }
        })();

        // =========================================================
        // 3. TIMEOUT 10 GIÂY
        // =========================================================
        const timeout_promise = new Promise<'timeout'>((resolve) => {
          timeout_id = setTimeout(() => {
            is_cancelled = true;
            resolve('timeout');
          }, 10000);
        });

        const race_result = await Promise.race([
          check_promise.then(() => 'completed' as const),
          timeout_promise,
        ]);

        // Nếu OTA hoàn tất trước 10 giây thì huỷ timer,
        // không để timer sống thừa.
        if (timeout_id !== null) {
          clearTimeout(timeout_id);
          timeout_id = null;
        }

        // =========================================================
        // 4. NẾU TIMEOUT THẮNG
        // =========================================================
        if (race_result === 'timeout') {
          /*
           * Promise.race chỉ giúp Splash ngừng chờ sau 10 giây.
           *
           * check_promise cũ vẫn có thể đang chạy vì expo-updates
           * không được cancel bởi Promise.race.
           *
           * Vì vậy KHÔNG unlock is_running ngay.
           * Chờ Promise OTA cũ kết thúc rồi mới unlock.
           */
          release_lock_in_background = true;

          void check_promise.finally(() => {
            is_running = false;
          });
        }
      } finally {
        // Splash luôn được nhả kể cả API hoặc OTA lỗi / timeout.
        if (is_startup) {
          set_is_checking_update(false);
        }

        // Bình thường thì unlock ngay.
        // Nếu OTA timeout thì Promise cũ tự unlock khi nó kết thúc.
        if (!release_lock_in_background) {
          is_running = false;
        }
      }
    }

    // =========================================================
    // COLD BOOT
    // Capture notification TRƯỚC khi OTA được phép chạy.
    // =========================================================
    async function bootstrap_app() {
      await capture_initial_notification();
      await check_and_apply_update(true);
    }

    void bootstrap_app();

    // Background -> Foreground giữ nguyên flow hiện tại.
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
        <VersionUpdateModal
          visible={show_version_modal}
          version_info={version_info}
          onClose={() => set_show_version_modal(false)}
        />
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
