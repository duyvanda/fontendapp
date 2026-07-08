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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFeedback } from '@/context/FeedbackContext';
import { globalStyles, colors } from '@/styles/global';
import { getUserInfo } from '@/storage/auth';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login_user, user_info, login_text, login_loading } = useFeedback();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  useEffect(() => {
    (async () => {
      const storedUser = await getUserInfo();
      if (storedUser || user_info) {
        if (params.redirect) {
          // Handle redirect if needed
        } else {
          router.replace('/(tabs)');
        }
      }
    })();
  }, [user_info, router, params.redirect]);

  const handleLogin = () => {
    if (!email || !password) return;
    login_user({ email: email.toUpperCase(), password });
  };

  const handleResetPassword = () => {
    Linking.openURL(
      'https://eoffice.meraplion.com/admincp/reset-password?redirect_url=https://eoffice.meraplion.com/workgate/callback'
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.screen}
    >
      <ScrollView contentContainerStyle={globalStyles.emptyContainer}>
        <View style={[globalStyles.cardLg, { width: '100%', maxWidth: 400 }]}>
          <Text style={[globalStyles.sectionHeader, { textAlign: 'center', fontSize: 24, marginBottom: 24, color: colors.primary }]}>
            BI PORTAL
          </Text>

          <Text style={globalStyles.sectionHeader}>Mã Nhân Viên</Text>
          <TextInput
            style={[globalStyles.input, isEmailFocused && globalStyles.inputFocused, { marginBottom: 16 }]}
            placeholder="Nhập Mã NV"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
            autoCapitalize="characters"
          />

          <Text style={globalStyles.sectionHeader}>Mật Khẩu</Text>
          <TextInput
            style={[globalStyles.input, isPasswordFocused && globalStyles.inputFocused, { marginBottom: 24 }]}
            placeholder="Nhập Mật Khẩu"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            secureTextEntry
          />

          <TouchableOpacity
            style={globalStyles.btnPrimary}
            onPress={handleLogin}
            disabled={login_loading}
          >
            {login_loading ? (
              <ActivityIndicator color={colors.textInverse} />
            ) : (
              <Text style={globalStyles.btnPrimaryText}>ĐĂNG NHẬP</Text>
            )}
          </TouchableOpacity>

          {login_text ? (
            <Text style={[globalStyles.emptyText, { color: colors.error, marginTop: 16 }]}>
              {login_text}
            </Text>
          ) : null}

          <View style={globalStyles.dividerDashed} />

          <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginBottom: 8 }]}>
            Vui lòng đăng nhập bằng tài khoản DMS / ESALES / CLOUD / BITRIX / EOFFICE
          </Text>
          
          <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginBottom: 16 }]}>
            Mọi thắc mắc về tài khoản vui lòng liên hệ Anh Huy IT (0902995675 - Zalo)
          </Text>

          <TouchableOpacity onPress={handleResetPassword}>
            <Text style={[globalStyles.bodySmall, { textAlign: 'center', color: colors.primary, fontWeight: '600' }]}>
              Quên mật khẩu? Bấm vào đây để đặt lại
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
