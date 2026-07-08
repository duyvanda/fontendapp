import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { globalStyles, colors, spacing } from '@/styles/global';
import CustomHeader from '@/components/CustomHeader';

export default function TonKhoTocDoBanScreen() {
  return (
    <View style={globalStyles.screen}>
      <CustomHeader title="Tồn kho & Tốc độ bán" show_back />
      <View style={globalStyles.emptyContainer}>
        <Text style={[globalStyles.h2, { color: colors.primary }]}>Coming Soon</Text>
        <Text style={globalStyles.emptyText}>Báo cáo Tồn kho & Tốc độ bán đang được phát triển.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
