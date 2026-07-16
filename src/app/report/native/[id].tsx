import React, { useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFeedback } from '@/context/FeedbackContext';
import { colors, spacing, globalStyles, radius } from '@/styles/global';
import { NATIVE_REPORTS_MAP } from '@/components/native_reports';

import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export default function NativeReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { reports, toggle_favorite, user_info } = useFeedback();

  // ─── States & Refs cho Gesture & Screenshot ───
  const [zoom_level, set_zoom_level] = useState(1.0);
  const [is_capturing, set_is_capturing] = useState(false);
  const capture_view_ref = useRef<View>(null);
  
  const screen_w = Dimensions.get('window').width;
  const screen_h = Dimensions.get('window').height;

  // Native scale và pan states
  const native_scale = useSharedValue(1.0);
  const pinch_focal_x = useSharedValue(screen_w / 2);
  const pinch_focal_y = useSharedValue(screen_h / 2);
  const saved_scale = useSharedValue(1.0);
  const manual_pan_x = useSharedValue(0);
  const manual_pan_y = useSharedValue(0);
  const pinch_start_x = useSharedValue(0);
  const pinch_start_y = useSharedValue(0);

  // Cử chỉ Zoom bằng 2 ngón tay
  const pinch_gesture = Gesture.Pinch()
    .onStart((e) => {
      saved_scale.value = native_scale.value;
      pinch_focal_x.value = e.focalX;
      pinch_focal_y.value = e.focalY;
      pinch_start_x.value = manual_pan_x.value;
      pinch_start_y.value = manual_pan_y.value;
    })
    .onUpdate((e) => {
      const next = saved_scale.value * e.scale;
      native_scale.value = Math.max(1.0, Math.min(2.0, next));

      const dx = e.focalX - pinch_focal_x.value;
      const dy = e.focalY - pinch_focal_y.value;

      const s = native_scale.value;
      if (s > 1.01) {
        const max_tx = ((s - 1) * screen_w) / 2;
        const max_ty = ((s - 1) * screen_h) / 2;
        manual_pan_x.value = Math.max(-max_tx, Math.min(max_tx, pinch_start_x.value + dx));
        manual_pan_y.value = Math.max(-max_ty, Math.min(max_ty, pinch_start_y.value + dy));
      } else {
        manual_pan_x.value = withSpring(0);
        manual_pan_y.value = withSpring(0);
      }
    })
    .onEnd(() => {
      if (native_scale.value <= 1.01) {
        native_scale.value = withSpring(1.0);
        manual_pan_x.value = withSpring(0);
        manual_pan_y.value = withSpring(0);
      }
      runOnJS(set_zoom_level)(native_scale.value);
    });

  // Cử chỉ kéo rê 1 ngón tay khi đang phóng to
  const pan_view_gesture = Gesture.Pan()
    .enabled(zoom_level > 1.01)
    .onStart(() => {
      pinch_start_x.value = manual_pan_x.value;
      pinch_start_y.value = manual_pan_y.value;
    })
    .onUpdate((e) => {
      const s = native_scale.value;
      if (s > 1.01) {
        const max_tx = ((s - 1) * screen_w) / 2;
        const max_ty = ((s - 1) * screen_h) / 2;
        manual_pan_x.value = Math.max(-max_tx, Math.min(max_tx, pinch_start_x.value + e.translationX));
        manual_pan_y.value = Math.max(-max_ty, Math.min(max_ty, pinch_start_y.value + e.translationY));
      }
    });

  const composed_gesture = Gesture.Simultaneous(pinch_gesture, pan_view_gesture);

  // Vị trí panel nút chụp màn hình (kéo thả được)
  const BTN_PANEL_W = 38;
  const BTN_PANEL_H = 38;
  const btn_x = useSharedValue(screen_w - BTN_PANEL_W - 12);
  const btn_y = useSharedValue(screen_h / 2 - BTN_PANEL_H / 2);
  const drag_start_x = useSharedValue(0);
  const drag_start_y = useSharedValue(0);

  const pan_gesture = Gesture.Pan()
    .onStart(() => {
      drag_start_x.value = btn_x.value;
      drag_start_y.value = btn_y.value;
    })
    .onUpdate((e) => {
      btn_x.value = Math.max(4, Math.min(screen_w - BTN_PANEL_W - 4, drag_start_x.value + e.translationX));
      btn_y.value = Math.max(4, Math.min(screen_h - BTN_PANEL_H - 120, drag_start_y.value + e.translationY));
    });

  // Animated styles cho container phóng to/thu nhỏ
  const animated_container_style = useAnimatedStyle(() => {
    const s = native_scale.value;
    const ox = pinch_focal_x.value - screen_w / 2;
    const oy = pinch_focal_y.value - screen_h / 2;
    const tx = manual_pan_x.value;
    const ty = manual_pan_y.value;

    return {
      flex: 1,
      transform: [
        { translateX: ox }, { translateY: oy },
        { scale: s },
        { translateX: -ox }, { translateY: -oy },
        { translateX: tx }, { translateY: ty },
      ],
    };
  });

  // Animated styles cho HUD % Zoom
  const badge_style = useAnimatedStyle(() => {
    const is_zoomed = native_scale.value > 1.01;
    return {
      opacity: withSpring(is_zoomed ? 1 : 0, { damping: 15 }),
      transform: [
        { scale: withSpring(is_zoomed ? 1.25 : 0.6, { damping: 12, stiffness: 130 }) },
      ],
    };
  });

  // Animated styles cho nút tiện ích camera
  const btn_panel_style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: btn_x.value,
    top: btn_y.value,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    width: BTN_PANEL_W,
    height: BTN_PANEL_H,
  }));

  // Xử lý chụp màn hình báo cáo
  const handle_screenshot = async () => {
    if (is_capturing) return;
    try {
      set_is_capturing(true);
      if (!capture_view_ref.current) return;
      const file_uri = await captureRef(capture_view_ref, {
        format: 'jpg',
        quality: 0.8,
      });
      await Sharing.shareAsync(file_uri);
    } catch (e) {
      console.error('Screenshot capture failed:', e);
    } finally {
      set_is_capturing(false);
    }
  };

  // Tìm báo cáo tương ứng trong list
  const report = useMemo(() => {
    return reports.find(r => r.stt === id);
  }, [reports, id]);

  const isFav = useMemo(() => {
    return report?.yeu_thich && String(report.yeu_thich) !== '0';
  }, [report]);

  const handle_toggle_fav = () => {
    if (report) {
      toggle_favorite(report);
    }
  };

  // Render báo cáo native tương ứng dựa vào ID (stt)
  const render_report_content = () => {
    if (!report) {
      return (
        <View style={globalStyles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textCaption} />
          <Text style={globalStyles.emptyText}>Không tìm thấy thông tin báo cáo.</Text>
        </View>
      );
    }

    // Lấy Component tương ứng từ bảng map dựa trên ID (stt)
    const ReportComponent = id ? NATIVE_REPORTS_MAP[id] : null;

    if (ReportComponent) {
      // Truyền scrollEnabled xuống báo cáo native để vô hiệu hóa scroll khi đang zoom
      return <ReportComponent scrollEnabled={zoom_level <= 1.01} />;
    }

    return (
      <View style={globalStyles.emptyContainer}>
        <Ionicons name="construct-outline" size={48} color={colors.textCaption} />
        <Text style={globalStyles.h2}>Đang cập nhật</Text>
        <Text style={globalStyles.emptyText}>Báo cáo native này đang được xây dựng.</Text>
      </View>
    );
  };

  return (
    <View style={globalStyles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* ── Custom Header with Favorite Button ── */}
      <View style={{ backgroundColor: colors.primary, paddingTop: insets.top }}>
        <View
          style={[
            globalStyles.rowBetween,
            {
              height: 56,
              paddingHorizontal: spacing.md,
              backgroundColor: colors.primary,
              borderBottomWidth: 1,
              borderBottomColor: colors.primaryDark,
            },
          ]}
        >
          <View style={[globalStyles.row, { flex: 1, marginRight: spacing.sm }]}>
            <TouchableOpacity 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }} 
              style={{
                marginRight: spacing.sm,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
            </TouchableOpacity>
            
            {user_info && (
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, marginRight: spacing.sm }}>
                <Text style={{ color: colors.textInverse, fontWeight: 'bold', fontSize: 12 }}>{user_info.manv}</Text>
              </View>
            )}
            
            <Text
              style={[globalStyles.h3, { color: colors.textInverse, flex: 1 }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {report?.tenreport || 'Báo cáo Native'}
            </Text>
          </View>

          {/* Favorite Button on Header */}
          {report && (
            <TouchableOpacity 
              onPress={handle_toggle_fav}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.favButton}
            >
              <Ionicons 
                name={isFav ? "star" : "star-outline"} 
                size={24} 
                color={isFav ? colors.warning : colors.textInverse} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Report Content wrapped with Zoom & Capture Gestures ── */}
      <View style={{ flex: 1 }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GestureDetector gesture={composed_gesture}>
            <View ref={capture_view_ref} collapsable={false} style={{ flex: 1, overflow: 'hidden', backgroundColor: '#fcfcfc' }}>
              <Reanimated.View style={animated_container_style}>
                {render_report_content()}
              </Reanimated.View>
            </View>
          </GestureDetector>

          {/* HUD % Zoom nổi ở phía trên chính giữa màn hình báo cáo */}
          <Reanimated.View pointerEvents="none" style={[badge_style, {
            position: 'absolute',
            top: 16,
            alignSelf: 'center',
            backgroundColor: 'rgba(0,0,0,0.76)',
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 16,
            zIndex: 30,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5
          }]}>
            <Ionicons name="search" size={13} color="#fff" style={{ marginRight: 4 }} />
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
              {Math.round(zoom_level * 100)}%
            </Text>
          </Reanimated.View>

          {/* Panel nút chụp màn hình nổi (có thể kéo thả) */}
          <GestureDetector gesture={pan_gesture}>
            <Reanimated.View style={btn_panel_style}>
              <TouchableOpacity
                onPress={handle_screenshot}
                disabled={is_capturing}
                style={[{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3,
                  elevation: 4,
                }, is_capturing && { opacity: 0.5 }]}
              >
                <Ionicons name={is_capturing ? 'hourglass-outline' : 'camera'} size={19} color="#fff" />
              </TouchableOpacity>
            </Reanimated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  favButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
