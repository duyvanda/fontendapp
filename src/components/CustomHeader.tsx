import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors, spacing } from '@/styles/global';
import { useFeedback } from '@/context/FeedbackContext';
import CloudAssist from '@/components/CloudAssist';

interface CustomHeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function CustomHeader({ title = 'BI PORTAL', showBack = false }: CustomHeaderProps) {
  const router = useRouter();
  const { user_info, user_hr_info, logout_user } = useFeedback();
  const [showMenu, setShowMenu] = useState(false);
  const [showBira, setShowBira] = useState(false);

  const handleLogout = () => {
    logout_user();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <View
        style={[
          globalStyles.rowBetween,
          {
            height: 56,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.primary,
            borderBottomWidth: 1,
            borderBottomColor: colors.primaryDark,
          },
        ]}
      >
        <View style={globalStyles.row}>
          {showBack ? (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
              <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
            </TouchableOpacity>
          ) : null}
          <Text style={[globalStyles.h3, { color: colors.textInverse }]}>{title}</Text>
        </View>

        {user_info && (
          <View style={globalStyles.row}>
            {/* BIRA CloudAssist Button */}
            {user_hr_info?.show_cloud_assist && (
              <TouchableOpacity style={{ marginRight: spacing.md }} onPress={() => setShowBira(true)}>
                <Ionicons name="chatbubbles" size={24} color={colors.textInverse} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[globalStyles.row, { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50 }]}
              onPress={() => setShowMenu(!showMenu)}
            >
              <Ionicons name="person-circle" size={20} color={colors.textInverse} style={{ marginRight: 6 }} />
              <Text style={{ color: colors.textInverse, fontWeight: 'bold' }}>{user_info.manv}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <CloudAssist visible={showBira} onClose={() => setShowBira(false)} />
    </SafeAreaView>
  );
}
