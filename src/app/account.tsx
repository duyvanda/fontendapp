import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFeedback } from '@/context/FeedbackContext';
import { colors, spacing, radius } from '@/styles/global';
import { LOCALURL } from '@/utils/api';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user_info, logout_user } = useFeedback();
  const [deleting, set_deleting] = useState(false);

  const handle_delete_account = () => {
    Alert.alert(
      'Xóa tài khoản',
      'Bạn có chắc chắn muốn xóa tài khoản? Mọi dữ liệu cá nhân (yêu thích, tags, lịch sử) sẽ bị xóa vĩnh viễn và không thể khôi phục.',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xóa tài khoản',
          style: 'destructive',
          onPress: async () => {
            set_deleting(true);
            try {
              const manv = user_info?.manv;
              if (manv) {
                await fetch(`${LOCALURL}/post_data/delete_user_account/`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify([{ manv }]),
                });
              }
              Alert.alert(
                'Đã gửi yêu cầu',
                'Yêu cầu xóa tài khoản đã được ghi nhận. Dữ liệu sẽ được xóa trong vòng 14 ngày làm việc.',
                [{ text: 'OK', onPress: () => logout_user() }]
              );
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể gửi yêu cầu xóa tài khoản. Vui lòng thử lại sau.');
            } finally {
              set_deleting(false);
            }
          },
        },
      ]
    );
  };

  const handle_logout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Huỷ', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: () => logout_user() },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back_btn}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.header_title}>Tài khoản</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Info Card */}
        <View style={styles.user_card}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
          <Text style={styles.user_name}>{user_info?.manv || 'N/A'}</Text>
          <Text style={styles.user_sub}>Tài khoản doanh nghiệp</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menu_section}>
          <TouchableOpacity style={styles.menu_item} onPress={() => router.push('/terms' as any)}>
            <Ionicons name="document-text-outline" size={22} color={colors.textPrimary} />
            <Text style={styles.menu_text}>Điều khoản & Chính sách</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textCaption} />
          </TouchableOpacity>

          <View style={styles.menu_divider} />

          <TouchableOpacity style={styles.menu_item} onPress={handle_logout}>
            <Ionicons name="log-out-outline" size={22} color={colors.textPrimary} />
            <Text style={styles.menu_text}>Đăng xuất</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textCaption} />
          </TouchableOpacity>
        </View>

        {/* Delete Account — Danger Zone */}
        <View style={styles.danger_section}>
          <Text style={styles.danger_label}>VÙNG NGUY HIỂM</Text>
          <TouchableOpacity
            style={styles.delete_btn}
            onPress={handle_delete_account}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.delete_btn_text}>Xóa tài khoản</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.danger_hint}>
            Hành động này không thể hoàn tác. Mọi dữ liệu cá nhân sẽ bị xóa vĩnh viễn.
          </Text>
        </View>

        {/* Version */}
        <View style={styles.version_box}>
          <Text style={styles.version_text}>
            BI Portal v{Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
          <Text style={styles.version_text}>
            {Updates.channel ?? 'dev'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
  },
  back_btn: { width: 40, alignItems: 'flex-start' },
  header_title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: { padding: spacing.md, paddingBottom: 40 },
  user_card: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  user_name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  user_sub: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menu_section: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  menu_item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: 16,
  },
  menu_text: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  menu_divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 52,
  },
  danger_section: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  danger_label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  delete_btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  delete_btn_text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  danger_hint: {
    fontSize: 13,
    color: colors.textCaption,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  version_box: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  version_text: {
    fontSize: 12,
    color: colors.textCaption,
    marginBottom: 2,
  },
});
