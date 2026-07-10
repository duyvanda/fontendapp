import React, { useState } from 'react';
import CustomHeader from '@/components/CustomHeader';
import { globalStyles, spacing, colors, radius, shadows } from '@/styles/global';
import {
  ScrollView, Text, TouchableOpacity, View, ActivityIndicator,
  TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFeedback } from '@/context/FeedbackContext';

type AppItem = {
  id: string;
  icon: string;
  label: string;
  url: string;
  group: string;
};

const STATIC_APP_ITEMS: AppItem[] = [
  { id: 'gift', icon: '🎁', label: 'Đăng Ký KPI', url: '', group: 'tools' },
  { id: 'listing_plan', icon: '📝', label: 'Listing Plan', url: '', group: 'tools' },
];

const MONTHS = [
  'Tháng 7 / 2026',
  'Tháng 8 / 2026',
  'Tháng 9 / 2026',
  'Tháng 10 / 2026',
  'Tháng 11 / 2026',
  'Tháng 12 / 2026',
];

const KPI_TYPES = [
  { id: 'sales', label: 'Doanh số bán hàng (VND)', icon: 'trending-up' },
  { id: 'visits', label: 'Tần suất viếng thăm khách hàng', icon: 'footsteps' },
  { id: 'coverage', label: 'Độ phủ sản phẩm mục tiêu', icon: 'grid' },
];

const PRODUCTS = [
  'Kháng sinh Amoxicillin 500mg',
  'Siro Ho thảo dược Merap',
  'Xịt mũi Sea Alga',
  'Vitamin C Zinc bổ sung',
];

export default function AppsScreen() {
  const { user_info } = useFeedback();

  /* ── Modals state ── */
  const [active_tool, set_active_tool] = useState<string | null>(null);

  /* ── Form States ── */
  const [feedback_text, set_feedback_text] = useState('');
  const [submitting, set_submitting] = useState(false);
  const [submitted, set_submitted] = useState(false);

  /* KPI Form State */
  const [kpi_month, set_kpi_month] = useState(MONTHS[0]);
  const [kpi_type, set_kpi_type] = useState(KPI_TYPES[0].id);
  const [kpi_target_value, set_kpi_target_value] = useState('');

  /* Listing Plan State */
  const [plan_month, set_plan_month] = useState(MONTHS[0]);
  const [plan_product, set_plan_product] = useState(PRODUCTS[0]);
  const [plan_target, set_plan_target] = useState('');

  const handle_open_app = (app: AppItem) => {
    if (app.id === 'gift') {
      set_active_tool('kpi');
      return;
    }
    if (app.id === 'listing_plan') {
      set_active_tool('listing_plan');
      return;
    }
  };

  /* ── Action Handlers ── */
  const handle_submit_feedback = () => {
    if (!feedback_text.trim()) return;
    set_submitting(true);
    setTimeout(() => {
      set_submitting(false);
      set_submitted(true);
      set_feedback_text('');
      Alert.alert('Cảm ơn bạn!', 'Góp ý của bạn đã được ghi nhận.');
    }, 600);
  };

  const handle_submit_kpi = () => {
    if (!kpi_target_value.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập chỉ số mục tiêu.');
      return;
    }
    set_submitting(true);
    setTimeout(() => {
      set_submitting(false);
      Alert.alert('Thành công', 'Đã đăng ký chỉ tiêu KPI thành công với công ty.');
      set_active_tool(null);
      set_kpi_target_value('');
    }, 800);
  };

  const handle_submit_plan = () => {
    if (!plan_target.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mục tiêu Listing.');
      return;
    }
    set_submitting(true);
    setTimeout(() => {
      set_submitting(false);
      Alert.alert('Thành công', 'Kế hoạch Listing đã được gửi lên hệ thống.');
      set_active_tool(null);
      set_plan_target('');
    }, 800);
  };

  const tools = STATIC_APP_ITEMS.filter(a => a.group === 'tools');

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
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {tools.length > 0 && (
            <>
              <Text style={[globalStyles.sectionHeader, { color: colors.primary, letterSpacing: 1.5 }]}>🛠️ CÔNG CỤ HỖ TRỢ</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: spacing.md }}>
                {tools.map(render_app_card)}
              </View>
            </>
          )}

          {STATIC_APP_ITEMS.length === 0 && (
            <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: spacing.lg }}>
              Không có ứng dụng nào.
            </Text>
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

      {/* ─── MODAL: ĐĂNG KÝ KPI ─── */}
      <Modal visible={active_tool === 'kpi'} animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: '#f8fafc' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={[styles.modal_container, { flex: 1 }]}>
            <CustomHeader title="Đăng ký KPI" />
            <ScrollView contentContainerStyle={styles.modal_content} keyboardShouldPersistTaps="handled">
              <Text style={styles.tool_title}>📈 Đăng Ký KPI Doanh Nghiệp</Text>
              <Text style={styles.tool_desc}>Xác nhận chỉ tiêu cam kết của đối tác cho chu kỳ kinh doanh.</Text>
              
              <View style={styles.form_group}>
                <Text style={styles.form_label}>TÀI KHOẢN ĐĂNG KÝ</Text>
                <View style={styles.read_only_box}>
                  <Ionicons name="person-circle" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={styles.read_only_text}>{user_info?.manv || 'Chưa đăng nhập'}</Text>
                </View>
              </View>

              <View style={styles.form_group}>
                <Text style={styles.form_label}>CHỌN THÁNG ÁP DỤNG</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips_container}>
                  {MONTHS.map(m => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.chip, kpi_month === m && styles.chip_active]}
                      onPress={() => set_kpi_month(m)}
                    >
                      <Text style={[styles.chip_text, kpi_month === m && styles.chip_text_active]}>{m.split(' / ')[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.form_group}>
                <Text style={styles.form_label}>CHỌN LOẠI KPI CAM KẾT</Text>
                <View style={styles.kpi_grid}>
                  {KPI_TYPES.map(k => (
                    <TouchableOpacity
                      key={k.id}
                      style={[styles.kpi_card, kpi_type === k.id && styles.kpi_card_active]}
                      onPress={() => set_kpi_type(k.id)}
                    >
                      <Ionicons
                        name={k.icon as any}
                        size={24}
                        color={kpi_type === k.id ? '#ffffff' : colors.primary}
                        style={{ marginBottom: 8 }}
                      />
                      <Text style={[styles.kpi_card_text, kpi_type === k.id && styles.kpi_card_text_active]}>
                        {k.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.form_group}>
                <Text style={styles.form_label}>CHỈ SỐ CAM KẾT / TARGET</Text>
                <TextInput
                  style={styles.form_input}
                  placeholder="Nhập giá trị số..."
                  keyboardType="numeric"
                  value={kpi_target_value}
                  onChangeText={set_kpi_target_value}
                />
              </View>

              <TouchableOpacity style={styles.action_btn} onPress={handle_submit_kpi} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.action_btn_text}>Đăng Ký Cam Kết</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.close_modal_btn} onPress={() => set_active_tool(null)}>
                <Text style={styles.close_modal_text}>Đóng</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── MODAL: LISTING PLAN ─── */}
      <Modal visible={active_tool === 'listing_plan'} animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: '#f8fafc' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={[styles.modal_container, { flex: 1 }]}>
            <CustomHeader title="Listing Plan" />
            <ScrollView contentContainerStyle={styles.modal_content} keyboardShouldPersistTaps="handled">
              <Text style={styles.tool_title}>📝 Kế Hoạch Đưa Sản Phẩm Mới (Listing)</Text>
              <Text style={styles.tool_desc}>Đề xuất mục tiêu phân phối và đưa hàng mới vào hệ thống điểm bán.</Text>

              <View style={styles.form_group}>
                <Text style={styles.form_label}>TÀI KHOẢN ĐỀ XUẤT</Text>
                <View style={styles.read_only_box}>
                  <Ionicons name="person-circle" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={styles.read_only_text}>{user_info?.manv || 'Chưa đăng nhập'}</Text>
                </View>
              </View>

              <View style={styles.form_group}>
                <Text style={styles.form_label}>THÁNG ĐỀ XUẤT ÁP DỤNG</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips_container}>
                  {MONTHS.map(m => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.chip, plan_month === m && styles.chip_active]}
                      onPress={() => set_plan_month(m)}
                    >
                      <Text style={[styles.chip_text, plan_month === m && styles.chip_text_active]}>{m.split(' / ')[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.form_group}>
                <Text style={styles.form_label}>SẢN PHẨM MỚI</Text>
                <View style={styles.product_list}>
                  {PRODUCTS.map(p => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.product_item, plan_product === p && styles.product_item_active]}
                      onPress={() => set_plan_product(p)}
                    >
                      <Ionicons
                        name="cube-outline"
                        size={18}
                        color={plan_product === p ? '#ffffff' : colors.textSecondary}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.product_item_text, plan_product === p && styles.product_item_text_active]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.form_group}>
                <Text style={styles.form_label}>MỤC TIÊU / TARGET DOANH SỐ (VND / THÁNG)</Text>
                <TextInput
                  style={styles.form_input}
                  placeholder="Ví dụ: 15,000,000"
                  keyboardType="numeric"
                  value={plan_target}
                  onChangeText={set_plan_target}
                />
              </View>

              <TouchableOpacity style={styles.action_btn} onPress={handle_submit_plan} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.action_btn_text}>Gửi Đề Xuất</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.close_modal_btn} onPress={() => set_active_tool(null)}>
                <Text style={styles.close_modal_text}>Đóng</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  feedback_btn_disabled: {
    backgroundColor: '#94a3b8',
  },
  feedback_btn_text: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  feedback_success: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  feedback_success_text: {
    fontSize: 13,
    color: colors.success,
    marginLeft: 6,
    fontWeight: '600',
  },
  modal_container: {
    backgroundColor: '#f8fafc',
  },
  modal_content: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  tool_title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  tool_desc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  form_group: {
    marginBottom: spacing.md,
  },
  form_label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
    letterSpacing: 1,
  },
  form_input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  action_btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.teal,
  },
  action_btn_text: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  close_modal_btn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  close_modal_text: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  read_only_box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  read_only_text: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chips_container: {
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chip_active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chip_text: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chip_text_active: {
    color: '#ffffff',
  },
  kpi_grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  kpi_card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    alignItems: 'center',
  },
  kpi_card_active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  kpi_card_text: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  kpi_card_text_active: {
    color: '#ffffff',
  },
  product_list: {
    gap: 8,
  },
  product_item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  product_item_active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  product_item_text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  product_item_text_active: {
    color: '#ffffff',
  },
});
