import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles, colors, spacing } from '@/styles/global';
import CustomHeader from '@/components/CustomHeader';
import ReportWebView from '@/components/ReportWebView';
import { useFeedback } from '@/context/FeedbackContext';
import { format_date_ymd } from '@/utils/string';

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
  const [is_landscape, set_is_landscape] = useState(false);

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
      {!is_landscape && (
        <CustomHeader title={filter_reports?.tenreport || 'Chi tiết báo cáo'} show_back />
      )}
      
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
        <ReportWebView 
          uri={`https://datastudio.google.com/embed/reporting/${report_id}${report_param}`}
          on_orientation_change={set_is_landscape}
        />
      ) : !showParamModal ? (
        <View style={globalStyles.emptyContainer}>
          <Text style={globalStyles.h2}>Lỗi tải báo cáo</Text>
          <Text style={globalStyles.emptyText}>Không thể tải dữ liệu báo cáo hoặc không có quyền truy cập.</Text>
        </View>
      ) : null}
    </View>
  );
}
