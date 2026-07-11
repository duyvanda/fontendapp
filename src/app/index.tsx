/**
 * Màn hình Khởi tạo & Định tuyến tự động (Splash Router / Gatekeeper)
 * - Tác dụng:
 *   1. Chạy đầu tiên khi mở ứng dụng.
 *   2. Đọc bộ nhớ tạm để kiểm tra trạng thái đăng nhập của người dùng.
 *   3. Nếu đã đăng nhập -> chuyển vào trang chủ /(tabs) kèm hiệu ứng fade-out 300ms.
 *   4. Nếu chưa đăng nhập -> chuyển ra màn hình đăng nhập /login.
 *   5. Cơ chế Timeout fallback tự đưa về /login sau 5 giây nếu gặp lỗi treo.
 */
import { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Animated, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { get_user_info } from '@/storage/auth';
import { useFeedback } from '@/context/FeedbackContext';
import { colors } from '@/styles/global';

export default function Index() {
  const router = useRouter();
  const { user_info } = useFeedback();
  const [loading, set_loading] = useState(true);
  const fade_anim = useRef(new Animated.Value(1)).current;

  // Hàm chuyển hướng kèm hiệu ứng fade-out mượt mà
  const navigate_with_fade = (target_route: string) => {
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
        const stored_user = await get_user_info();
        if (!is_mounted) return;

        clearTimeout(timeout_id);
        if (stored_user || user_info) {
          navigate_with_fade('/(tabs)');
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
  }, [user_info, router]);

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
