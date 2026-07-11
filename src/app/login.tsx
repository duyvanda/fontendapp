import { useFeedback } from '@/context/FeedbackContext';
import { get_user_info } from '@/storage/auth';
import { colors, radius, spacing } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const {
    user_info,
    // user_hr_info,
    login_text,
    login_loading,
    // reports,
    // filter_reports,
    // report_id,
    // report_param,
    // shared,
    // loading,
    // rp_screen,
    login_user,
    // logout_user,
    // fetch_reports,
    // fetch_filter_reports,
    // fetch_filter_reports_rt,
    // clear_filter_report,
    // user_logger,
    // set_rp_screen,
  } = useFeedback();

  const [tenant_id, set_tenant_id] = useState('');
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');
  const [is_tenant_focused, set_is_tenant_focused] = useState(false);
  const [is_email_focused, set_is_email_focused] = useState(false);
  const [is_password_focused, set_is_password_focused] = useState(false);
  const [show_password, set_show_password] = useState(false);
  const [local_error, set_local_error] = useState('');

  const tenant_input_ref = useRef<TextInput>(null);
  const email_input_ref = useRef<TextInput>(null);
  const password_input_ref = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      const stored_user = await get_user_info();
      if (stored_user || user_info) {
        if (params.redirect) {
          // Handle redirect if needed
        } else {
          router.replace('/(tabs)');
        }
      }
    })();
  }, [user_info, router, params.redirect]);

  const handle_login = () => {
    Keyboard.dismiss();
    set_local_error('');
    const clean_tenant = tenant_id.trim().toLowerCase();
    if (!clean_tenant) {
      set_local_error('Vui lòng nhập mã tổ chức');
      return;
    }
    if (clean_tenant !== 'merap' && clean_tenant !== 'demo') {
      set_local_error('Mã tổ chức không tồn tại');
      return;
    }
    if (!email.trim()) {
      set_local_error('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!password) {
      set_local_error('Vui lòng nhập mật khẩu');
      return;
    }
    login_user({ email: email.toUpperCase(), password, tenant_id: clean_tenant });
  };

  const is_tenant_error = local_error.toLowerCase().includes('tổ chức');
  const is_email_error = local_error.toLowerCase().includes('tên đăng nhập') || !!login_text;
  const is_password_error = local_error.toLowerCase().includes('mật khẩu') || !!login_text;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Background Elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top + 10, 40) }]} keyboardShouldPersistTaps="handled">
        {/* Logo Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.logoTitle}>BI PORTAL</Text>
          <Text style={styles.logoSubtitle}>Multi-Tenant Business Intelligence Portal</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Mã tổ chức <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <View style={[
              styles.inputWrapper,
              is_tenant_focused && styles.inputWrapperFocused,
              is_tenant_error && styles.inputWrapperError
            ]}>
              <Ionicons
                name="business-outline"
                size={20}
                color={is_tenant_error ? colors.error : (is_tenant_focused ? colors.primary : colors.textCaption)}
                style={styles.inputIcon}
              />
              <TextInput
                ref={tenant_input_ref}
                style={styles.input}
                placeholder="Ví dụ: demo"
                placeholderTextColor={colors.textCaption}
                value={tenant_id}
                onChangeText={(text) => {
                  set_tenant_id(text);
                  set_local_error('');
                }}
                onFocus={() => set_is_tenant_focused(true)}
                onBlur={() => set_is_tenant_focused(false)}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => email_input_ref.current?.focus()}
                blurOnSubmit={false}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Tên đăng nhập <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <View style={[
              styles.inputWrapper,
              is_email_focused && styles.inputWrapperFocused,
              is_email_error && styles.inputWrapperError
            ]}>
              <Ionicons
                name="person-outline"
                size={20}
                color={is_email_error ? colors.error : (is_email_focused ? colors.primary : colors.textCaption)}
                style={styles.inputIcon}
              />
              <TextInput
                ref={email_input_ref}
                style={styles.input}
                placeholder="Nhập tên đăng nhập của bạn"
                placeholderTextColor={colors.textCaption}
                value={email}
                onChangeText={(text) => {
                  set_email(text);
                  set_local_error('');
                }}
                onFocus={() => set_is_email_focused(true)}
                onBlur={() => set_is_email_focused(false)}
                autoCapitalize="characters"
                returnKeyType="next"
                onSubmitEditing={() => password_input_ref.current?.focus()}
                blurOnSubmit={false}
                keyboardType="email-address"
                autoComplete="username"
                textContentType="username"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Mật khẩu <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <View style={[
              styles.inputWrapper,
              is_password_focused && styles.inputWrapperFocused,
              is_password_error && styles.inputWrapperError
            ]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={is_password_error ? colors.error : (is_password_focused ? colors.primary : colors.textCaption)}
                style={styles.inputIcon}
              />
              <TextInput
                ref={password_input_ref}
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textCaption}
                value={password}
                onChangeText={(text) => {
                  set_password(text);
                  set_local_error('');
                }}
                onFocus={() => set_is_password_focused(true)}
                onBlur={() => set_is_password_focused(false)}
                secureTextEntry={!show_password}
                returnKeyType="done"
                onSubmitEditing={handle_login}
                autoComplete="password"
                textContentType="password"
              />
              <TouchableOpacity
                onPress={() => set_show_password(!show_password)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={show_password ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textCaption}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handle_login}
            disabled={login_loading}
            activeOpacity={0.8}
            style={[
              { marginTop: spacing.md },
              styles.loginButton,
              login_loading && styles.loginButtonDisabled
            ]}
          >
            {login_loading ? (
              <ActivityIndicator color={colors.textInverse} size="small" />
            ) : (
              <View style={styles.loginButtonContent}>
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
              </View>
            )}
          </TouchableOpacity>

          {local_error || login_text ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={colors.error} style={{ marginRight: spacing.sm }} />
              <Text style={styles.errorText}>
                {local_error || login_text}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity onPress={() => router.push('/terms' as any)} style={{ marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
            <Text style={{ textAlign: 'center', fontSize: 12, color: colors.textCaption, lineHeight: 18 }}>
              Bằng việc đăng nhập, bạn đồng ý với{'\n'}
              <Text style={{ color: colors.primary, textDecorationLine: 'underline', fontWeight: 'bold' }}>
                Điều khoản sử dụng & Chính sách bảo mật
              </Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerDashed} />

          <Text style={styles.helpText}>
            Đăng nhập bằng tài khoản doanh nghiệp được cấp
          </Text>

          <Text style={[styles.helpText, { fontWeight: 'bold' }]}>
            Nền tảng phân tích dữ liệu dành cho doanh nghiệp và đối tác
          </Text>
        </View>
        {/* Version Info */}
        <View style={{ alignItems: 'center', paddingBottom: spacing.md }}>
          <Text style={{ color: colors.textCaption, fontSize: 11 }}>
            v{Constants.expoConfig?.version ?? '1.0.0'}
            {Updates.createdAt
              ? (() => {
                try {
                  const d = new Date(Updates.createdAt);
                  const pad = (n: number) => n.toString().padStart(2, '0');
                  return `  •  ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                } catch (e) {
                  return '  •  (live)';
                }
              })()
              : '  •  (dev)'
            }
          </Text>
          <Text style={{ color: colors.textCaption, fontSize: 10, marginTop: 2 }}>
            ch: {Updates.channel ?? 'n/a'}  |  embedded: {String(Updates.isEmbeddedLaunch)}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 167, 157, 0.05)',
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(150, 240, 229, 0.1)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    paddingTop: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  logoTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#006a64',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  logoSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f9fb',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  inputWrapperError: {
    borderColor: colors.error,
    backgroundColor: '#fff5f5',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    height: '100%',
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  loginButton: {
    borderRadius: radius.full,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00A79D', // Replaced LinearGradient with solid color
    shadowColor: '#00A79D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#00766E',
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  dividerDashed: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginVertical: spacing.md,
  },
  helpText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  resetText: {
    fontSize: 13,
    color: '#006a64',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
