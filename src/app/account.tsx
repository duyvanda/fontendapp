import { useFeedback } from '@/context/FeedbackContext';
import { colors, radius, spacing } from '@/styles/global';
import { LOCALURL } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text, TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user_info, user_hr_info, logout_user } = useFeedback();
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
      {/* Header phẳng, hiện đại */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.back_btn} 
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.header_title}>Tài khoản</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 16, spacing.lg) }
        ]}
      >
        {/* User Info Card */}
        <View style={styles.user_card}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
          <Text style={styles.user_name}>
            {user_hr_info?.hovatenfullname || user_hr_info?.hoten || 'Người dùng BI Portal'}
          </Text>
          <Text style={styles.user_sub}>
            {user_info?.manv || 'N/A'}
            {user_hr_info?.chucdanhengtitle || user_hr_info?.ten_chucdanh
              ? `  •  ${user_hr_info.chucdanhengtitle || user_hr_info.ten_chucdanh}`
              : '  •  Tài khoản doanh nghiệp'}
          </Text>
          {(user_hr_info?.phongdeptsummary || user_hr_info?.ten_bophan) ? (
            <Text style={styles.user_dept}>
              {user_hr_info.phongdeptsummary || user_hr_info.ten_bophan}
            </Text>
          ) : null}
        </View>

        {/* Menu Items */}
        <View style={styles.menu_section}>
          <TouchableOpacity style={styles.menu_item} onPress={() => router.push('/terms' as any)}>
            <View style={[styles.menu_icon_bg, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="document-text-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menu_text}>Điều khoản & Chính sách</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textCaption} />
          </TouchableOpacity>

          <View style={styles.menu_divider} />

          <TouchableOpacity style={styles.menu_item} onPress={handle_logout}>
            <View style={[styles.menu_icon_bg, { backgroundColor: '#fff7ed' }]}>
              <Ionicons name="log-out-outline" size={20} color="#f97316" />
            </View>
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
            Hành động này không thể hoàn tác. Mọi dữ liệu cá nhân sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </Text>
        </View>

        {/* Version */}
        <View style={styles.version_box}>
          <Text style={styles.version_text}>
            BI Portal v{Constants.expoConfig?.version ?? '1.0.0'}
            {Updates.createdAt
              ? (() => {
                try {
                  const d = new Date(Updates.createdAt);
                  const pad = (n: number) => n.toString().padStart(2, '0');
                  return `  •  ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())} (Up 47)`;
                } catch (e) {
                  return '  •  (live) (Fix 47)';
                }
              })()
              : '  •  (dev) (Fix 47)'
            }
          </Text>
          <Text style={styles.version_text}>
            ch: {Updates.channel ?? 'n/a'}  |  embedded: {String(Updates.isEmbeddedLaunch)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back_btn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  header_title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  content: { padding: spacing.lg },
  user_card: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 167, 157, 0.1)',
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
    textAlign: 'center',
  },
  user_dept: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: spacing.sm,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menu_section: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  menu_item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: 14,
  },
  menu_icon_bg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu_text: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
    marginLeft: spacing.sm + 4,
  },
  menu_divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 68,
  },
  danger_section: {
    backgroundColor: colors.errorLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  danger_label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  delete_btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
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
    color: colors.textSecondary,
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
