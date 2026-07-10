import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFeedback } from '@/context/FeedbackContext';
import { colors, spacing, globalStyles, radius } from '@/styles/global';
import { NATIVE_REPORTS_MAP } from '@/components/native_reports';

export default function NativeReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { reports, toggle_favorite, user_info } = useFeedback();

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
      return <ReportComponent />;
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
              style={{ marginRight: spacing.sm }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
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

      {/* ── Report Content ── */}
      <View style={{ flex: 1 }}>
        {render_report_content()}
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
