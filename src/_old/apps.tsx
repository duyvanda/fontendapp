import React, { useState, useEffect } from 'react';
import CustomHeader from '@/components/CustomHeader';
import { globalStyles, spacing, colors, radius } from '@/styles/global';
import {
  ScrollView, Text, TouchableOpacity, View, ActivityIndicator,
  TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { LOCALURL, apiFetch } from '@/utils/api';
import { useFeedback } from '@/context/FeedbackContext';

type AppItem = {
  id: string;
  icon: string;
  label: string;
  url: string;
  group: string;
};

export default function AppsScreen() {
  const { user_info } = useFeedback();
  const [app_items, set_app_items] = useState<AppItem[]>([]);
  const [loading, set_loading] = useState(true);

  /* ── Feedback form state ── */
  const [feedback_text, set_feedback_text] = useState('');
  const [submitting, set_submitting] = useState(false);
  const [submitted, set_submitted] = useState(false);

  useEffect(() => {
    const fetch_apps = async () => {
      try {
        const res = await apiFetch<any>(`${LOCALURL}/get_data/get_app_items/`);
        const data = res?.data || res;
        set_app_items(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch apps:', error);
      } finally {
        set_loading(false);
      }
    };
    fetch_apps();
  }, []);

  /* Force HTTPS */
  const ensure_https = (url: string) => {
    if (!url) return url;
    return url.replace(/^http:\/\//i, 'https://');
  };

  const handle_open_app = async (app: AppItem) => {
    if (app.url) {
      await WebBrowser.openBrowserAsync(ensure_https(app.url));
    }
  };

  /* ── Submit feedback ── */
  const handle_submit_feedback = async () => {
    if (!feedback_text.trim()) return;
    set_submitting(true);
    /* Chỉ cần hiện alert — không cần gọi API */
    setTimeout(() => {
      set_submitting(false);
      set_submitted(true);
      set_feedback_text('');
      Alert.alert('Cảm ơn bạn!', 'Góp ý của bạn đã được ghi nhận.');
    }, 600);
  };

  const apps = app_items.filter(a => a.group === 'apps');
  const tools = app_items.filter(a => a.group === 'tools');

  const render_app_card = (app: AppItem) => (
    <TouchableOpacity
      key={app.id}
      style={[
        globalStyles.card, 
        { 
          width: '47%', 
          alignItems: 'center', 
          paddingVertical: spacing.md, 
          paddingHorizontal: spacing.xs,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border
        }
      ]}
      onPress={() => handle_open_app(app)}
      activeOpacity={0.7}
    >
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
      }}>
        <Text style={{ fontSize: 22 }}>{app.icon}</Text>
      </View>
      <Text 
        style={[globalStyles.bodySmall, { fontWeight: '700', textAlign: 'center', color: colors.textPrimary }]}
        numberOfLines={2}
      >
        {app.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.screen}>
      <CustomHeader title="Tiện ích" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
          ) : (
            <>
              {apps.length > 0 && (
                <>
                  <Text style={[globalStyles.sectionHeader, { color: colors.primary, letterSpacing: 1.5 }]}>🌐 LIÊN KẾT HỆ THỐNG</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md }}>
                    {apps.map(render_app_card)}
                  </View>
                </>
              )}

              {tools.length > 0 && (
                <>
                  <Text style={[globalStyles.sectionHeader, { marginTop: spacing.lg, color: colors.primary, letterSpacing: 1.5 }]}>🛠️ CÔNG CỤ HỖ TRỢ</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md }}>
                    {tools.map(render_app_card)}
                  </View>
                </>
              )}

              {app_items.length === 0 && (
                <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: spacing.lg }}>
                  Không có ứng dụng nào.
                </Text>
              )}
            </>
          )}

          {/* ── Feedback Form ── */}
          <View style={styles.feedback_section}>
            <View style={styles.feedback_header}>
              <Ionicons name="chatbox-ellipses-outline" size={20} color={colors.primary} />
              <Text style={styles.feedback_title}>Góp ý & Phản hồi</Text>
            </View>
            <Text style={styles.feedback_desc}>
              Bạn muốn cải thiện tính năng nào? Hãy cho chúng tôi biết.
            </Text>
            <TextInput
              style={styles.feedback_input}
              placeholder="Nhập góp ý của bạn..."
              placeholderTextColor={colors.textCaption}
              value={feedback_text}
              onChangeText={set_feedback_text}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.feedback_btn, (!feedback_text.trim() || submitting) && styles.feedback_btn_disabled]}
              onPress={handle_submit_feedback}
              disabled={!feedback_text.trim() || submitting}
              activeOpacity={0.7}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.feedback_btn_text}>Gửi góp ý</Text>
                </>
              )}
            </TouchableOpacity>
            {submitted && (
              <View style={styles.feedback_success}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.feedback_success_text}>Đã gửi thành công!</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  feedback_section: {
    marginTop: spacing.xl,
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  feedback_header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  feedback_title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  feedback_desc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  feedback_input: {
    backgroundColor: '#f7f9fb',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 100,
    marginBottom: spacing.md,
  },
  feedback_btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  feedback_btn_disabled: {
    opacity: 0.5,
  },
  feedback_btn_text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  feedback_success: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  feedback_success_text: {
    fontSize: 14,
    color: colors.success,
    marginLeft: 6,
    fontWeight: '500',
  },
});
