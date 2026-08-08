/**
 * Màn hình Khởi tạo & Định tuyến tự động (Splash Router / Gatekeeper)
 *
 * Flow:
 * 1. Chờ FeedbackContext hydrate user + cached reports (initialized = true).
 * 2. Đọc pending notification đã được RootLayout capture trước OTA.
 * 3. Nếu có pending notification -> deep-link report.
 * 4. Nếu không có pending -> /(tabs).
 * 5. Nếu không có session -> /login.
 * 6. Sau khi notification đã được consume -> clear storage + native response.
 */
import { NATIVE_REPORTS_MAP } from '@/components/native_reports';
import { useFeedback } from '@/context/FeedbackContext';
import {
  get_pending_notification,
  remove_pending_notification,
} from '@/storage/notification';
import { colors } from '@/styles/global';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import {
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';

export default function Index() {
  const router = useRouter();

  const {
    user_info,
    reports,
    initialized,
  } = useFeedback();

  const fade_anim = useRef(new Animated.Value(1)).current;
  const has_navigated = useRef(false);

  /**
   * Xóa notification đã được xử lý.
   *
   * - AsyncStorage: không cho deep-link lại ở cold boot sau.
   * - Native response: không cho Expo trả lại notification cũ.
   */
  const clear_consumed_notification = useCallback(() => {
    try {
      Notifications.clearLastNotificationResponse();
    } catch (error) {
      console.log(
        '[Index] Clear native notification response error:',
        error,
      );
    }

    void remove_pending_notification().catch((error) => {
      console.log(
        '[Index] Clear pending notification error:',
        error,
      );
    });
  }, []);

  /**
   * Điều hướng đúng một lần kèm hiệu ứng fade-out.
   */
  const navigate_with_fade = useCallback((
    target_route: string,
    clear_notification = false,
  ) => {
    if (has_navigated.current) {
      return;
    }

    has_navigated.current = true;

    Animated.timing(fade_anim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.replace(target_route as any);

      if (clear_notification) {
        clear_consumed_notification();
      }
    });
  }, [
    fade_anim,
    router,
    clear_consumed_notification,
  ]);

  /**
   * Timeout fallback:
   * tránh trường hợp startup bị treo vĩnh viễn.
   */
  useEffect(() => {
    const timeout_id = setTimeout(() => {
      if (!has_navigated.current) {
        navigate_with_fade('/login');
      }
    }, 5000);

    return () => {
      clearTimeout(timeout_id);
    };
  }, [navigate_with_fade]);

  /**
   * Chỉ quyết định route SAU KHI FeedbackContext hydrate xong.
   */
  useEffect(() => {
    if (!initialized || has_navigated.current) {
      return;
    }

    let is_mounted = true;

    (async () => {
      try {
        // Không có session -> login.
        if (!user_info) {
          navigate_with_fade('/login', true);
          return;
        }

        const pending_notification =
          await get_pending_notification();

        if (
          !is_mounted ||
          has_navigated.current
        ) {
          return;
        }

        // =====================================================
        // CÓ NOTIFICATION DEEP-LINK
        // =====================================================
        if (pending_notification?.report_stt) {
          const report_stt =
            String(pending_notification.report_stt);

          const report = reports?.find(
            (item) =>
              String(item.stt) === report_stt,
          );

          let target_route: string;

          if (report) {
            if (
              Number(report.type) === 4 ||
              report_stt in NATIVE_REPORTS_MAP
            ) {
              target_route =
                `/report/native/${report_stt}`;
            } else if (
              report.link_report?.startsWith('/realtime')
            ) {
              target_route =
                `/realtime/${report_stt}`;
            } else {
              target_route =
                `/report/${report_stt}`;
            }
          } else if (
            report_stt in NATIVE_REPORTS_MAP
          ) {
            target_route =
              `/report/native/${report_stt}`;
          } else {
            target_route =
              `/report/${report_stt}`;
          }

          console.log(
            '[Index] Consume pending notification:',
            pending_notification.notification_id,
            '->',
            target_route,
          );

          navigate_with_fade(
            target_route,
            true,
          );

          return;
        }

        // =====================================================
        // MỞ APP BÌNH THƯỜNG
        // =====================================================
        navigate_with_fade('/(tabs)');
      } catch (error) {
        console.log(
          '[Index] Startup routing error:',
          error,
        );

        if (
          is_mounted &&
          !has_navigated.current
        ) {
          navigate_with_fade(
            user_info ? '/(tabs)' : '/login',
          );
        }
      }
    })();

    return () => {
      is_mounted = false;
    };
  }, [
    initialized,
    user_info,
    reports,
    navigate_with_fade,
  ]);

  return (
    <Animated.View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        opacity: fade_anim,
      }}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <ActivityIndicator
        size="large"
        color={colors.primary}
      />
    </Animated.View>
  );
}
