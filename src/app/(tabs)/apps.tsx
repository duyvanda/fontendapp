import CustomHeader from '@/components/CustomHeader';
import { useFeedback } from '@/context/FeedbackContext';
import { colors, globalStyles, radius, spacing } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, View,
} from 'react-native';

type AppItem = {
  id: string;
  icon: string;
  label: string;
  url: string;
  group: string;
};

const STATIC_APP_ITEMS: AppItem[] = [
  { id: 'mkt', icon: '📊', label: 'Thông số MKT & Ads', url: '', group: 'apps' },
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

const MOCK_ORDERS = [
  { id: 'DH-2026-004', time: '14:30', total: '12,500,000đ', status: 'Đang giao' },
  { id: 'DH-2026-003', time: 'Hôm qua', total: '45,200,000đ', status: 'Đã giao' },
  { id: 'DH-2026-002', time: '08/07', total: '18,900,000đ', status: 'Đã giao' },
];

export default function AppsScreen() {
  const { user_info } = useFeedback();

  /* ── Modals state ── */
  const [active_tool, set_active_tool] = useState<string | null>(null);

  /* ── Form States ── */
  const [feedback_text, set_feedback_text] = useState('');
  const [submitting, set_submitting] = useState(false);
  const [submitted, set_submitted] = useState(false);

  /* B2B CRM Dashboard State */
  const [orders, set_orders] = useState(MOCK_ORDERS);
  const [show_support_form, set_show_support_form] = useState(false);
  const [support_title, set_support_title] = useState('');
  const [support_desc, set_support_desc] = useState('');

  /* KPI Form State */
  const [kpi_month, set_kpi_month] = useState(MONTHS[0]);
  const [kpi_type, set_kpi_type] = useState(KPI_TYPES[0].id);
  const [kpi_target_value, set_kpi_target_value] = useState('');

  /* Listing Plan State */
  const [plan_month, set_plan_month] = useState(MONTHS[0]);
  const [plan_product, set_plan_product] = useState(PRODUCTS[0]);
  const [plan_target, set_plan_target] = useState('');

  const handle_open_app = (app: AppItem) => {
    if (app.id === 'mkt') {
      set_active_tool('mkt');
      return;
    }
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

  const handle_submit_support = () => {
    if (!support_title.trim() || !support_desc.trim()) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ tiêu đề và nội dung.');
      return;
    }
    set_submitting(true);
    setTimeout(() => {
      set_submitting(false);
      Alert.alert('Thành công', 'Yêu cầu hỗ trợ đã được gửi đến ban quản trị.');
      set_show_support_form(false);
      set_support_title('');
      set_support_desc('');
    }, 800);
  };

  const apps = STATIC_APP_ITEMS.filter(a => a.group === 'apps');
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
          {apps.length > 0 && (
            <>
              <Text style={[globalStyles.sectionHeader, { color: colors.primary, letterSpacing: 1.5 }]}>📣 MKT & QUẢNG CÁO</Text>
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

      {/* ─── MODAL: MARKETING & ADS PERFORMANCE ─── */}
      <Modal visible={active_tool === 'mkt'} animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: '#f8fafc' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={[styles.modal_container, { flex: 1 }]}>
            <CustomHeader title="Marketing & Quảng cáo" />
            <ScrollView contentContainerStyle={styles.modal_content} keyboardShouldPersistTaps="handled">
              <Text style={styles.tool_title}>📣 Marketing & Ads Performance</Text>
              <Text style={styles.tool_desc}>Giám sát ngân sách quảng cáo, hiệu suất chiến dịch và chỉ số tiếp cận đối tượng.</Text>

              {/* Stats Row */}
              <View style={styles.stats_row}>
                <View style={styles.stat_card}>
                  <Text style={styles.stat_num}>1.8M</Text>
                  <Text style={styles.stat_label}>Lượt tiếp cận</Text>
                </View>
                <View style={styles.stat_card}>
                  <Text style={styles.stat_num}>45.2K</Text>
                  <Text style={styles.stat_label}>Lượt nhấp chuột</Text>
                </View>
                <View style={styles.stat_card}>
                  <Text style={[styles.stat_num, { color: colors.primary }]}>18.5M</Text>
                  <Text style={styles.stat_label}>Ngân sách đã tiêu</Text>
                </View>
              </View>

              {/* KPI Progress Bar */}
              <View style={{
                backgroundColor: '#ffffff',
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: colors.border,
                padding: spacing.md,
                marginBottom: spacing.md,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                    🎯 Tiến độ đạt KPI chuyển đổi (Conversions)
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: colors.primary }}>
                    83.3%
                  </Text>
                </View>
                {/* Progress track */}
                <View style={{ height: 10, backgroundColor: '#e2e8f0', borderRadius: radius.full, overflow: 'hidden' }}>
                  <View style={{ width: '83.3%', height: '100%', backgroundColor: colors.primary, borderRadius: radius.full }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                  <Text style={{ fontSize: 11, color: colors.textCaption }}>Đã đạt: 833 conversions</Text>
                  <Text style={{ fontSize: 11, color: colors.textCaption }}>Chỉ tiêu: 1,000 conversions</Text>
                </View>
              </View>

              {/* Last Updated Timestamp */}
              <Text style={{
                fontSize: 12,
                color: colors.textCaption,
                fontStyle: 'italic',
                textAlign: 'right',
                marginBottom: spacing.lg,
                marginTop: -spacing.xs,
              }}>
                *Số liệu cập nhật tính đến cuối ngày hôm qua
              </Text>

              {/* Profile Info */}
              <View style={styles.form_group}>
                <Text style={styles.form_label}>MÃ ĐỐI TÁC TRUYỀN THÔNG</Text>
                <View style={styles.read_only_box}>
                  <Ionicons name="megaphone" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                  <Text style={styles.read_only_text}>{user_info?.manv || 'GUEST_MKT'}</Text>
                </View>
              </View>

              {/* Support Request Button */}
              {!show_support_form && (
                <TouchableOpacity
                  style={[styles.action_btn, { backgroundColor: colors.primary, marginTop: spacing.md }]}
                  onPress={() => set_show_support_form(true)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="help-buoy" size={20} color="#ffffff" />
                    <Text style={styles.action_btn_text}>Gửi yêu cầu hỗ trợ chiến dịch</Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Support Form Modal/Inline */}
              {show_support_form && (
                <View style={[styles.feedback_section, { marginTop: spacing.md, marginBottom: spacing.md }]}>
                  <Text style={styles.form_label}>TIÊU ĐỀ YÊU CẦU</Text>
                  <TextInput
                    style={styles.form_input}
                    placeholder="Ví dụ: Tăng ngân sách Ads, Đối soát lead..."
                    value={support_title}
                    onChangeText={set_support_title}
                  />
                  <Text style={[styles.form_label, { marginTop: 10 }]}>CHI TIẾT YÊU CẦU HỖ TRỢ</Text>
                  <TextInput
                    style={[styles.form_input, { minHeight: 60 }]}
                    placeholder="Nội dung chi tiết yêu cầu hỗ trợ chiến dịch..."
                    multiline
                    value={support_desc}
                    onChangeText={set_support_desc}
                  />
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                    <TouchableOpacity style={[styles.action_btn, { flex: 1, marginTop: 0 }]} onPress={handle_submit_support}>
                      <Text style={styles.action_btn_text}>Gửi Yêu Cầu</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.action_btn, { flex: 1, backgroundColor: '#94a3b8', marginTop: 0 }]} onPress={() => set_show_support_form(false)}>
                      <Text style={styles.action_btn_text}>Hủy</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.close_modal_btn} onPress={() => { set_active_tool(null); set_show_support_form(false); }}>
                <Text style={styles.close_modal_text}>Đóng</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
                <Text style={styles.form_label}>CHỈ TIÊU MỤC TIÊU</Text>
                <TextInput
                  style={styles.form_input}
                  placeholder="Nhập giá trị cam kết (Ví dụ: Doanh số mong muốn)"
                  keyboardType="numeric"
                  value={kpi_target_value}
                  onChangeText={set_kpi_target_value}
                />
              </View>

              <TouchableOpacity style={styles.action_btn} onPress={handle_submit_kpi} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.action_btn_text}>Gửi KPI Đăng Ký</Text>}
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
              <Text style={styles.tool_title}>📊 Kế Hoạch Listing Sản Phẩm</Text>
              <Text style={styles.tool_desc}>Đăng ký kế hoạch phân phối và listing sản phẩm mới.</Text>

              <View style={styles.form_group}>
                <Text style={styles.form_label}>CHỌN THÁNG TRIỂN KHAI</Text>
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

  /* ── Modal Styling ── */
  modal_container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modal_content: {
    padding: spacing.lg,
  },
  tool_title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  tool_desc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  action_btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  action_btn_text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  close_modal_btn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  close_modal_text: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },

  /* Form controls */
  form_group: {
    marginBottom: spacing.md,
  },
  form_label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
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
  read_only_box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  read_only_text: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  /* Horizontal month chips */
  chips_container: {
    gap: spacing.sm,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chip_active: {
    backgroundColor: colors.primary,
  },
  chip_text: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  chip_text_active: {
    color: '#ffffff',
    fontWeight: '600',
  },

  /* Grid list for KPI types */
  kpi_grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  kpi_card: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  kpi_card_active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  kpi_card_text: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  kpi_card_text_active: {
    color: '#ffffff',
  },

  /* Products list selection */
  product_list: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  product_item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  product_item_active: {
    backgroundColor: colors.primary,
  },
  product_item_text: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  product_item_text_active: {
    color: '#ffffff',
    fontWeight: '600',
  },

  /* CRM Specific Styles */
  stats_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stat_card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
    elevation: 1,
  },
  stat_num: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  stat_label: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  log_box: {
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  result_header: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  checkin_mini_btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkin_mini_btn_text: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  visit_item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  visit_time_box: {
    backgroundColor: '#f1f5f9',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10,
  },
  visit_time: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  visit_name: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  status_badge: {
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  status_badge_text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
