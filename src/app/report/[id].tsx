import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { globalStyles } from '@/styles/global';
import CustomHeader from '@/components/CustomHeader';
import ReportWebView from '@/components/ReportWebView';
import { useFeedback } from '@/context/FeedbackContext';

export default function StaticReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user_info, fetch_filter_reports, shared, loading, report_id, report_param, filter_reports } = useFeedback();
  const [initializedId, setInitializedId] = useState<string | null>(null);
  const [is_landscape, set_is_landscape] = useState(false);

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
          uri={`https://datastudio.google.com/embed/reporting/${report_id}${report_param}`}
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
