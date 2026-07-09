import CustomHeader from '@/components/CustomHeader';
import { colors, globalStyles, spacing } from '@/styles/global';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={globalStyles.screen}>
      <CustomHeader title="Điều khoản & Chính sách" show_back />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}
      >
        <Text style={styles.title}>ĐIỀU KHOẢN SỬ DỤNG VÀ CHÍNH SÁCH BẢO MẬT</Text>
        <Text style={styles.date}>Cập nhật lần cuối: 09/07/2026</Text>

        <Text style={styles.sectionTitle}>1. Mục đích ứng dụng (Internal Use Only)</Text>
        <Text style={styles.paragraph}>
          BI Portal là ứng dụng lưu hành nội bộ dành riêng cho nhân viên, quản lý và đối tác được uỷ quyền của công ty. Ứng dụng cung cấp các báo cáo phân tích dữ liệu kinh doanh (Business Intelligence) và trợ lý ảo hỗ trợ công việc.
          Tài khoản đăng nhập được cấp phát trực tiếp từ hệ thống nhân sự (DMS / BITRIX / EOFFICE). Hệ thống không hỗ trợ việc tự do đăng ký tài khoản cho người dùng bên ngoài.
        </Text>

        <Text style={styles.sectionTitle}>2. Quyền riêng tư và Thu thập dữ liệu</Text>
        <Text style={styles.paragraph}>
          Để cung cấp trải nghiệm làm việc tốt nhất (bao gồm tính năng Trợ lý ảo BIRA), ứng dụng có thể yêu cầu một số quyền truy cập trên thiết bị của bạn:
        </Text>
        <Text style={styles.bullet}>• <Text style={styles.bold}>Camera & Thư viện ảnh:</Text> Dùng để chụp và tải lên các chứng từ, hình ảnh nhằm mục đích đính kèm vào nội dung chat trao đổi công việc với BIRA.</Text>
        <Text style={styles.bullet}>• <Text style={styles.bold}>Microphone (Thu âm):</Text> Dùng để hỗ trợ tính năng nhập liệu bằng giọng nói (Voice typing) hoặc chat Voice (nếu có).</Text>
        <Text style={styles.paragraph}>
          Tất cả dữ liệu hình ảnh, âm thanh và file đính kèm được mã hoá và truyền tải an toàn về hệ thống máy chủ nội bộ của công ty. Chúng tôi cam kết không thu thập dữ liệu ngầm khi ứng dụng không hoạt động.
        </Text>

        <Text style={styles.sectionTitle}>3. Xử lý dữ liệu Trí tuệ nhân tạo (AI)</Text>
        <Text style={styles.paragraph}>
          Tính năng BIRA Chat sử dụng mô hình ngôn ngữ lớn để hỗ trợ giải đáp công việc. Các nguyên tắc bảo mật với AI:
        </Text>
        <Text style={styles.bullet}>• Dữ liệu công việc của bạn (câu hỏi, file đính kèm) chỉ được xử lý nội bộ để tạo ra câu trả lời phục vụ trực tiếp cho bạn.</Text>
        <Text style={styles.bullet}>• Chúng tôi KHÔNG sử dụng dữ liệu chat và tài liệu nhạy cảm của công ty để huấn luyện (train) các mô hình AI công cộng bên thứ ba.</Text>
        <Text style={styles.bullet}>• <Text style={styles.bold}>Lưu ý quan trọng:</Text> BIRA là trí tuệ nhân tạo và có thể đưa ra các số liệu hoặc kết luận có sai sót. Vui lòng luôn kiểm tra chéo (cross-check) các thông tin quan trọng trước khi ra quyết định kinh doanh.</Text>

        <Text style={styles.sectionTitle}>4. Trách nhiệm của nhân viên</Text>
        <Text style={styles.paragraph}>
          Bảo mật thông tin là ưu tiên hàng đầu. Bạn đồng ý:
        </Text>
        <Text style={styles.bullet}>• Không chia sẻ tài khoản đăng nhập cho bất kỳ ai, kể cả đồng nghiệp.</Text>
        <Text style={styles.bullet}>• Không chụp ảnh màn hình các báo cáo kinh doanh nhạy cảm để phát tán ra bên ngoài hoặc sử dụng trên các mạng xã hội.</Text>
        <Text style={styles.bullet}>• Tuân thủ nghiêm ngặt mọi thoả thuận bảo mật thông tin (NDA) đã ký kết với công ty.</Text>

        <Text style={styles.sectionTitle}>5. Chấm dứt quyền truy cập</Text>
        <Text style={styles.paragraph}>
          Công ty có quyền thu hồi hoặc khoá tài khoản truy cập BI Portal của bạn ngay lập tức mà không cần báo trước nếu phát hiện có hành vi vi phạm chính sách bảo mật, hoặc khi bạn đã chính thức chấm dứt hợp đồng lao động/hợp tác với công ty.
        </Text>

        <Text style={styles.paragraph}>
          Bằng việc tiếp tục đăng nhập và sử dụng ứng dụng, bạn xác nhận đã đọc, hiểu và đồng ý toàn bộ các điều khoản nêu trên. Mọi thắc mắc về kỹ thuật hoặc tài khoản, vui lòng liên hệ trực tiếp Bộ phận IT.
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  date: {
    fontSize: 13,
    color: colors.textCaption,
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  paragraph: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  bullet: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  bold: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  }
});
