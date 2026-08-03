/**
 * Màn hình Khởi tạo & Định tuyến tự động (Splash Router / Gatekeeper)
 * - Tác dụng:
 *   1. Chạy đầu tiên khi mở ứng dụng.
 *   2. Đọc bộ nhớ tạm để kiểm tra trạng thái đăng nhập của người dùng.
 *   3. Đọc song song (Promise.all) thông báo mở app từ Killed State nếu có.
 *   4. Nếu bấm noti -> chuyển thẳng tới /report/[id] hoặc /report/native/[id].
 *   5. Nếu đăng nhập bình thường -> chuyển vào trang chủ /(tabs).
 *   6. Nếu chưa đăng nhập -> chuyển ra màn hình đăng nhập /login.
 *   7. Cơ chế Timeout fallback tự đưa về /login sau 5 giây nếu gặp lỗi treo.
 */
import { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Animated, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { get_reports_list, get_user_info } from '@/storage/auth';
import { useFeedback } from '@/context/FeedbackContext';
import { colors } from '@/styles/global';
import { NATIVE_REPORTS_MAP } from '@/components/native_reports';

export default function Index() {
  const router = useRouter();
  const { user_info } = useFeedback();
  const [loading, set_loading] = useState(true);
  const fade_anim = useRef(new Animated.Value(1)).current;
  const has_navigated = useRef(false);

  // Hàm chuyển hướng kèm hiệu ứng fade-out mượt mà (Chỉ thực thi đúng 1 lần)
  const navigate_with_fade = (target_route: string) => {
    if (has_navigated.current) return;
    has_navigated.current = true;
    Animated.timing(fade_anim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.replace(target_route as any);
    });
  };

  useEffect(() => {
    let is_mounted = true;

    // Bộ đếm thời gian Timeout 5 giây đề phòng treo khởi chạy
    const timeout_id = setTimeout(() => {
      if (is_mounted && loading) {
        navigate_with_fade('/login');
      }
    }, 5000);

    (async () => {
      try {
        // 🚀 Chạy SONG SONG cả 3 tác vụ để tối ưu tốc độ 0ms phát sinh
        const [stored_user, cached_reports, last_response] = await Promise.all([
          get_user_info(),
          get_reports_list(),
          Notifications.getLastNotificationResponseAsync().catch(() => null)
        ]);

        if (!is_mounted) return;

        clearTimeout(timeout_id);
        const current_user = stored_user || user_info;

        if (current_user) {
          // 🔍 Kiểm tra xem có thông báo bấm mở app từ Killed State không
          const report_stt = last_response?.notification?.request?.content?.data?.report_stt;

          if (report_stt) {
            const stt_str = String(report_stt);
            const report = (cached_reports as any[])?.find(r => String(r.stt) === stt_str);

            if (report) {
              if (Number(report.type) === 4 || stt_str in NATIVE_REPORTS_MAP) {
                navigate_with_fade(`/report/native/${stt_str}`);
              } else if (report.link_report?.startsWith('/realtime')) {
                navigate_with_fade(`/realtime/${stt_str}`);
              } else {
                navigate_with_fade(`/report/${stt_str}`);
              }
            } else {
              if (stt_str in NATIVE_REPORTS_MAP) {
                navigate_with_fade(`/report/native/${stt_str}`);
              } else {
                navigate_with_fade(`/report/${stt_str}`);
              }
            }
          } else {
            // Mở app bình thường -> vào Trang chủ
            navigate_with_fade('/(tabs)');
          }
        } else {
          navigate_with_fade('/login');
        }
      } catch (error) {
        clearTimeout(timeout_id);
        if (is_mounted) navigate_with_fade('/login');
      } finally {
        if (is_mounted) set_loading(false);
      }
    })();

    return () => {
      is_mounted = false;
      clearTimeout(timeout_id);
    };
  }, []);

  return (
    <Animated.View 
      style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background,
        opacity: fade_anim 
      }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ActivityIndicator size="large" color={colors.primary} />
    </Animated.View>
  );
}
