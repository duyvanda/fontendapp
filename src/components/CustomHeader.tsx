import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useFeedback } from '@/context/FeedbackContext';
import { Ionicons } from '@expo/vector-icons';
import CloudAssist from '@/components/CloudAssist';
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
  const [show_bira, set_show_bira] = useState(false);

  const handle_logout = () => {
    logout_user();
    router.replace('/login');
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
        <View style={globalStyles.row}>
          {show_back ? (
            <TouchableOpacity 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }} 
              style={{ marginRight: spacing.md }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
            </TouchableOpacity>
          ) : null}
          <Text style={[globalStyles.h3, { color: colors.textInverse }]}>{title}</Text>
        </View>

        {user_info && (
          <View style={globalStyles.row}>
            {/* BIRA CloudAssist Button */}
            {user_hr_info?.show_cloud_assist && (
              <TouchableOpacity style={{ marginRight: spacing.md }} onPress={() => set_show_bira(true)}>
                <Ionicons name="chatbubbles" size={24} color={colors.textInverse} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[globalStyles.row, { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50 }]}
              onPress={() => set_show_menu(!show_menu)}
            >
              <Ionicons name="person-circle" size={20} color={colors.textInverse} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.textInverse, fontWeight: 'bold' }}>{user_info.manv}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <CloudAssist visible={show_bira} onClose={() => set_show_bira(false)} />
    </View>
  );
}
