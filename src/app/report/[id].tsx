import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Modal, Dimensions } from 'react-native';
import { get_device_info } from '@/utils/device';
import { useLocalSearchParams } from 'expo-router';
import { globalStyles } from '@/styles/global';
import CustomHeader from '@/components/CustomHeader';
import ReportWebView from '@/components/ReportWebView';
import { useFeedback } from '@/context/FeedbackContext';

export default function StaticReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user_info, fetch_filter_reports, shared, loading, report_id, report_param, filter_reports, user_logger } = useFeedback();
  const [initializedId, setInitializedId] = useState<string | null>(null);
  const [is_landscape, set_is_landscape] = useState(false);

  useEffect(() => {
    if (user_info && id && initializedId !== id) {
      // isMB = true for mobile layout param
      fetch_filter_reports(id, true);
      
      const logView = async () => {
        const device_info = await get_device_info();
        user_logger(user_info.manv, id, true, Dimensions.get('window').width, device_info);
      };
      logView();
      
      setInitializedId(id);
    }
  }, [user_info, id, initializedId, fetch_filter_reports, user_logger]);

  if (initializedId !== id) {
    return <View style={globalStyles.screen} />;
  }

  return (
    <View style={globalStyles.screen}>
      {!is_landscape && (
        <CustomHeader title={filter_reports?.tenreport || 'Chi tiết báo cáo'} show_back />
      )}
      
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
          uri={
            filter_reports?.type === 5
              ? (filter_reports.link_report
                  ? filter_reports.link_report.replace(/xxxxxx/g, user_info?.manv || '')
                  : report_param)
              : `https://datastudio.google.com/embed/reporting/${report_id}${report_param}`
          }
          on_orientation_change={set_is_landscape}
        />
      ) : (
        <View style={globalStyles.emptyContainer}>
          <Text style={globalStyles.h2}>Không có quyền truy cập</Text>
          <Text style={globalStyles.emptyText}>Bạn chưa được cấp quyền xem báo cáo này.</Text>
        </View>
      )}
    </View>
  );
}
