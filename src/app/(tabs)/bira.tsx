import React from 'react';
import { View, Text } from 'react-native';
import CloudAssist from '@/components/CloudAssist';
import { useFeedback } from '@/context/FeedbackContext';
import { globalStyles, colors, spacing } from '@/styles/global';
import CustomHeader from '@/components/CustomHeader';

export default function BiraTab() {
  const { user_hr_info } = useFeedback();

  if (!user_hr_info?.show_cloud_assist) {
    return (
      <View style={globalStyles.screen}>
        <CustomHeader title="BIRA" />
        <View style={[globalStyles.emptyContainer, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🤖</Text>
          <Text style={[globalStyles.h2, { color: colors.textSecondary }]}>BIRA AI Assistant</Text>
          <Text style={[globalStyles.emptyText, { marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: 32 }]}>
            Tính năng này chưa được kích hoạt cho tài khoản của bạn.{'\n'}Vui lòng liên hệ quản trị viên để được hỗ trợ.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={globalStyles.screen}>
      <CloudAssist />
    </View>
  );
}
