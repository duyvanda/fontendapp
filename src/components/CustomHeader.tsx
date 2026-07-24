import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useFeedback } from '@/context/FeedbackContext';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors, spacing } from '@/styles/global';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomHeaderProps {
  title?: string;
  show_back?: boolean;
}

export default function CustomHeader({ title = 'BI PORTAL', show_back = false }: CustomHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user_info } = useFeedback();

  return (
    <View style={{ backgroundColor: colors.primary, paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
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
        <View style={[globalStyles.row, { flex: 1, marginRight: spacing.sm }]}>
          {show_back ? (
            <TouchableOpacity 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }} 
              style={{
                marginRight: spacing.sm,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.textInverse} />
            </TouchableOpacity>
          ) : null}
          {user_info && (
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, marginRight: spacing.sm }}>
              <Text style={{ color: colors.textInverse, fontWeight: 'bold', fontSize: 12 }}>{user_info.manv}</Text>
            </View>
          )}
          <Text
            style={[globalStyles.h3, { color: colors.textInverse, flex: 1 }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >{title}</Text>
        </View>

      </View>
    </View>
  );
}
