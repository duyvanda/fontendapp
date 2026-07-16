import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles, colors, spacing } from '@/styles/global';
import CustomHeader from '@/components/CustomHeader';
import ReportWebView from '@/components/ReportWebView';
import { useFeedback } from '@/context/FeedbackContext';
import { format_date_ymd } from '@/utils/string';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const REPORT_PARAMS_CONFIG: Record<string, any[]> = {
  "17": [
    { key: "fromdate", label: "📅 Từ ngày", type: "date", required: true, default_value: format_date_ymd(new Date()) },
    { key: "todate", label: "📅 Đến ngày", type: "date", required: true, default_value: format_date_ymd(new Date()) }
  ]
};

export default function RealtimeReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user_info, fetch_filter_reports_rt, shared, loading, report_id, report_param, filter_reports } = useFeedback();
  
  const [showParamModal, setShowParamModal] = useState(false);
  const [paramsConfig, setParamsConfig] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [initializedId, setInitializedId] = useState<string | null>(null);
  const [is_capturing, set_is_capturing] = useState(false);

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


  useEffect(() => {
    if (user_info && id && initializedId !== id) {
      const config = REPORT_PARAMS_CONFIG[id];
      if (config && config.length > 0) {
        setParamsConfig(config);
        const initialForm: Record<string, string> = {};
        config.forEach(item => {
          initialForm[item.key] = item.default_value !== undefined ? item.default_value : "";
        });
        setFormData(initialForm);
        setShowParamModal(true);
      } else {
        fetch_filter_reports_rt(id, true, {});
      }
      setInitializedId(id);
    }
  }, [user_info, id, initializedId, fetch_filter_reports_rt]);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitParams = () => {
    if (id) {
      setShowParamModal(false);
      fetch_filter_reports_rt(id, true, formData);
    }
  };

  if (initializedId !== id) {
    return <View style={globalStyles.screen} />;
  }

  return (
    <View style={globalStyles.screen}>
      <CustomHeader title={filter_reports?.tenreport || 'Chi tiết báo cáo'} show_back />
      
      {/* Parameter input Modal */}
      <Modal visible={showParamModal} transparent={true} animationType="slide" statusBarTranslucent={true}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: spacing.lg }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: spacing.lg, maxHeight: '80%' }}>
            <Text style={[globalStyles.h2, { marginBottom: spacing.md, color: colors.primary }]}>⚙️ Tham số báo cáo</Text>
            
            <ScrollView style={{ marginBottom: spacing.lg }}>
              {paramsConfig.map((param) => (
                <View key={param.key} style={{ marginBottom: spacing.md }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 6 }}>{param.label}</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15 }}
                    value={formData[param.key] || ''}
                    onChangeText={(val) => handleInputChange(param.key, val)}
                    placeholder={param.placeholder || ''}
                  />
                </View>
              ))}
            </ScrollView>
            
            <View style={[globalStyles.row, { justifyContent: 'flex-end', marginTop: spacing.lg }]}>
              <TouchableOpacity 
                style={[globalStyles.btnSecondary, { marginRight: spacing.md }]} 
                onPress={() => setShowParamModal(false)}
              >
                <Text style={globalStyles.btnSecondaryText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={globalStyles.btnPrimary} 
                onPress={handleSubmitParams}
              >
                <Text style={globalStyles.btnPrimaryText}>🔍 Xem báo cáo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                disabled={is_capturing}
                style={[styles.screenshotBtn, is_capturing && { opacity: 0.5 }]}
              >
                <Ionicons name={is_capturing ? 'hourglass-outline' : 'camera'} size={19} color="#fff" />
              </TouchableOpacity>
            </Reanimated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      ) : !showParamModal ? (
        <View style={globalStyles.emptyContainer}>
          <Text style={globalStyles.h2}>Lỗi tải báo cáo</Text>
          <Text style={globalStyles.emptyText}>Không thể tải dữ liệu báo cáo hoặc không có quyền truy cập.</Text>
        </View>
      ) : null}
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
