import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFeedback } from '@/context/FeedbackContext';
import { getUserInfo } from '@/storage/auth';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/styles/global';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
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

  const [email, set_email] = useState('');
  const [password, set_password] = useState('');
  const [is_email_focused, set_is_email_focused] = useState(false);
  const [is_password_focused, set_is_password_focused] = useState(false);
  const [show_password, set_show_password] = useState(false);

  useEffect(() => {
    (async () => {
      const stored_user = await getUserInfo();
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
    if (!email || !password) return;
    login_user({ email: email.toUpperCase(), password });
  };

  const handle_reset_password = () => {
    Linking.openURL(
      'https://eoffice.meraplion.com/admincp/reset-password?redirect_url=https://eoffice.meraplion.com/workgate/callback'
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      {/* Background Elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.logoTitle}>BI PORTAL</Text>
          <Text style={styles.logoSubtitle}>Business Intelligence Portal</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>TÊN ĐĂNG NHẬP</Text>
            <View style={[styles.inputWrapper, is_email_focused && styles.inputWrapperFocused]}>
              <Ionicons 
                name="person-outline" 
                size={20} 
                color={is_email_focused ? colors.primary : colors.textCaption} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Nhập tên đăng nhập của bạn"
                placeholderTextColor={colors.textCaption}
                value={email}
                onChangeText={set_email}
                onFocus={() => set_is_email_focused(true)}
                onBlur={() => set_is_email_focused(false)}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>MẬT KHẨU</Text>
            <View style={[styles.inputWrapper, is_password_focused && styles.inputWrapperFocused]}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={is_password_focused ? colors.primary : colors.textCaption} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textCaption}
                value={password}
                onChangeText={set_password}
                onFocus={() => set_is_password_focused(true)}
                onBlur={() => set_is_password_focused(false)}
                secureTextEntry={!show_password}
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
            style={[{ marginTop: spacing.md }, styles.loginButton]}
          >
            {login_loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <View style={styles.loginButtonContent}>
                <Text style={styles.loginButtonText}>Đăng nhập</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.textInverse} />
              </View>
            )}
          </TouchableOpacity>

          {login_text ? (
            <Text style={styles.errorText}>
              {login_text}
            </Text>
          ) : null}

          <View style={styles.dividerDashed} />

          <Text style={styles.helpText}>
            Vui lòng đăng nhập bằng tài khoản DMS / ESALES / CLOUD / BITRIX / EOFFICE
          </Text>
          
          <Text style={styles.helpText}>
            Mọi thắc mắc về tài khoản vui lòng liên hệ Anh Huy IT
          </Text>

          {/* <TouchableOpacity onPress={handle_reset_password}>
            <Text style={styles.resetText}>
              Quên mật khẩu? Bấm vào đây để đặt lại
            </Text>
          </TouchableOpacity> */}
        </View>

        {/* Footer Visual Hint */}
        <View style={styles.footerHint}>
          <View style={[styles.hintLine, { backgroundColor: '#00A79D' }]} />
          <View style={[styles.hintLine, { backgroundColor: colors.border }]} />
          <View style={[styles.hintLine, { backgroundColor: colors.border }]} />
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
    paddingTop: 80,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
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
    padding: spacing.xl,
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
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f9fb',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
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
  errorText: {
    color: colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
    fontSize: 14,
  },
  dividerDashed: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginVertical: spacing.xl,
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
  footerHint: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.xxl,
    opacity: 0.4,
  },
  hintLine: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});
