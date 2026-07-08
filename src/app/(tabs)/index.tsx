import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { globalStyles, colors, spacing } from '@/styles/global';
import CustomHeader from '@/components/CustomHeader';
import { useFeedback } from '@/context/FeedbackContext';

export default function HomeScreen() {
  const { user_info, reports, fetch_reports } = useFeedback();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (user_info?.manv) {
      await fetch_reports(user_info.manv);
    }
    setRefreshing(false);
  }, [user_info, fetch_reports]);

  // Lọc lấy 5 report gần đây hoặc nổi bật (giả lập từ danh sách report)
  const recentReports = reports.slice(0, 5);

  return (
    <View style={globalStyles.screen}>
      <CustomHeader title="Dashboard" />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <View style={globalStyles.cardLg}>
          <Text style={[globalStyles.h2, { marginBottom: spacing.sm }]}>
            Xin chào, {user_info?.manv} 👋
          </Text>
          <Text style={globalStyles.bodySmall}>
            Chào mừng bạn đến với hệ thống BI Portal mới.
          </Text>
        </View>

        <Text style={globalStyles.sectionHeader}>Báo cáo gần đây</Text>
        
        {recentReports.length > 0 ? (
          recentReports.map((report) => (
            <View key={report.stt} style={[globalStyles.card, { marginBottom: spacing.sm }]}>
              <Text style={[globalStyles.h3, { color: colors.primary }]}>📊 {report.tenreport}</Text>
            </View>
          ))
        ) : (
          <View style={globalStyles.emptyContainer}>
            <Text style={globalStyles.emptyText}>Chưa có dữ liệu báo cáo</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
