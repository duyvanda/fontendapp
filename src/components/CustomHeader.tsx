import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useFeedback } from '@/context/FeedbackContext';
import { Ionicons } from '@expo/vector-icons';
import { 
  get_id, 
  generate_month_options, 
  inserted_at, 
  remove_accents_with_case, 
  format_date_ymd 
} from '@/utils/string';
import { globalStyles, colors, spacing } from '@/styles/global';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomHeaderProps {
  title?: string;
  show_back?: boolean;
}

export default function CustomHeader({ title = 'BI PORTAL', show_back = false }: CustomHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    user_info,
    user_hr_info,
    login_text,
    login_loading,
    reports,
    filter_reports,
    report_id,
    report_param,
    shared,
    loading,
    rp_screen,
    login_user,
    logout_user,
    fetch_reports,
    fetch_filter_reports,
    fetch_filter_reports_rt,
    clear_filter_report,
    user_logger,
    set_rp_screen,
  } = useFeedback();

  const [show_menu, set_show_menu] = useState(false);
  // removed show_bira state

  const handle_logout = () => {
    logout_user();
  };

  return (
    <View style={{ backgroundColor: colors.primary, paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
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
          {show_back ? (
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
          ) : null}
          {user_info && (
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, marginRight: spacing.sm }}>
              <Text style={{ color: colors.textInverse, fontWeight: 'bold', fontSize: 12 }}>{user_info.manv}</Text>
            </View>
          )}
          <Text
            style={[globalStyles.h3, { color: colors.textInverse, flex: 1 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >{title}</Text>
        </View>

          <TouchableOpacity
              style={[globalStyles.row, { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, gap: 4 }]}
              onPress={handle_logout}
            >
              <Ionicons name="log-out-outline" size={18} color={colors.textInverse} />
              <Text style={{ color: colors.textInverse, fontSize: 12, fontWeight: '600' }}>Đăng xuất</Text>
            </TouchableOpacity>
      </View>
    </View>
  );
}
