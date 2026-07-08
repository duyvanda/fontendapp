import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { globalStyles } from '@/styles/global';
import CustomHeader from '@/components/CustomHeader';
import ReportWebView from '@/components/ReportWebView';
import { useFeedback } from '@/context/FeedbackContext';

export default function StaticReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user_info, fetch_filter_reports, shared, report_id, report_param, filter_reports } = useFeedback();
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (user_info && id) {
      // isMB = true for mobile layout param
      fetch_filter_reports(id, true);
      setInit(true);
    }
  }, [user_info, id, fetch_filter_reports]);

  if (!init) {
    return <View style={globalStyles.screen} />;
  }

  return (
    <View style={globalStyles.screen}>
      <CustomHeader title={filter_reports?.tenreport || 'Chi tiết báo cáo'} showBack />
      
      {shared ? (
        <ReportWebView 
          uri={`https://datastudio.google.com/embed/reporting/${report_id}${report_param}`}
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
