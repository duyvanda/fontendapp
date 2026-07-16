import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Modal, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { globalStyles, colors, spacing } from '@/styles/global';
import CustomHeader from '@/components/CustomHeader';
import ReportWebView from '@/components/ReportWebView';
import { useFeedback } from '@/context/FeedbackContext';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export default function StaticReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user_info, fetch_filter_reports, shared, loading, report_id, report_param, filter_reports } = useFeedback();
  const [initializedId, setInitializedId] = useState<string | null>(null);

  const capture_view_ref = useRef<View>(null);
  const screen_w = Dimensions.get('window').width;
  const screen_h = Dimensions.get('window').height;

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

  const handle_screenshot = async () => {
    try {
      if (!capture_view_ref.current) return;
      const file_uri = await captureRef(capture_view_ref, {
        format: 'png',
        quality: 0.95,
      });
      await Sharing.shareAsync(file_uri);
    } catch (e) {
      console.error('Screenshot capture failed:', e);
    }
  };

  useEffect(() => {
    if (user_info && id && initializedId !== id) {
      // isMB = true for mobile layout param
      fetch_filter_reports(id, true);
      setInitializedId(id);
    }
  }, [user_info, id, initializedId, fetch_filter_reports]);

  if (initializedId !== id) {
    return <View style={globalStyles.screen} />;
  }

  return (
    <View style={globalStyles.screen}>
      <CustomHeader title={filter_reports?.tenreport || 'Chi tiết báo cáo'} show_back />
      
      <Modal transparent={true} visible={loading} animationType="fade" statusBarTranslucent={true}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#6c757d', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 }}>
            <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Đang tải...</Text>
          </View>
        </View>
      </Modal>

      {shared ? (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View ref={capture_view_ref} collapsable={false} style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
            <ReportWebView 
              uri={`https://datastudio.google.com/embed/reporting/${report_id}${report_param}`}
            />
          </View>

          {/* Panel nút chụp màn hình nổi (có thể kéo thả) */}
          <GestureDetector gesture={pan_gesture}>
            <Reanimated.View style={btn_panel_style}>
              <TouchableOpacity
                onPress={handle_screenshot}
                style={styles.screenshotBtn}
              >
                <Ionicons name="camera" size={19} color="#fff" />
              </TouchableOpacity>
            </Reanimated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      ) : (
        <View style={globalStyles.emptyContainer}>
          <Text style={globalStyles.h2}>Không có quyền truy cập</Text>
          <Text style={globalStyles.emptyText}>Bạn chưa được cấp quyền xem báo cáo này.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screenshotBtn: {
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
  },
});
