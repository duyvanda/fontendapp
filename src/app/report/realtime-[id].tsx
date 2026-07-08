import React, { useEffect, useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
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
  const { user_info, fetch_filter_reports_rt, shared, loading, report_id, report_param, filter_reports } = useFeedback();
  
  const [showParamModal, setShowParamModal] = useState(false);
  const [paramsConfig, setParamsConfig] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (user_info && id) {
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
      setInit(true);
    }
  }, [user_info, id, fetch_filter_reports_rt]);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitParams = () => {
    if (id) {
      setShowParamModal(false);
      fetch_filter_reports_rt(id, true, formData);
    }
  };

  if (!init) {
    return <View style={globalStyles.screen} />;
  }

  return (
    <View style={globalStyles.screen}>
      <CustomHeader title={filter_reports?.tenreport || 'Chi tiết báo cáo'} showBack />
      
      <Modal visible={showParamModal} transparent={true} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.lg }}>
            <Text style={[globalStyles.h2, { marginBottom: spacing.md }]}>📋 Nhập tham số báo cáo</Text>
            
            <ScrollView style={{ maxHeight: 400 }}>
              {paramsConfig.map((param) => (
                <View key={param.key} style={{ marginBottom: spacing.md }}>
                  <Text style={globalStyles.sectionHeader}>{param.label}</Text>
                  {/* Simplistic text input for date for now. In a real app, use a DatePicker component */}
                  <TextInput
                    style={[globalStyles.input]}
                    value={formData[param.key] || ""}
                    onChangeText={(val) => handleInputChange(param.key, val)}
                    placeholder={`Nhập ${param.label.toLowerCase()}`}
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

      {loading ? (
        <View style={globalStyles.emptyContainer}>
          <Text style={globalStyles.emptyText}>Đang tải...</Text>
        </View>
      ) : shared ? (
        <ReportWebView 
          uri={`https://datastudio.google.com/embed/reporting/${report_id}${report_param}`}
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
