import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors, spacing } from '@/styles/global';
import CustomHeader from '@/components/CustomHeader';

// Danh sách các ứng dụng
const APP_ITEMS = [
  { id: 'crm', icon: 'briefcase', label: 'CRM Home', url: 'https://crm.meraplion.com' },
  { id: 'crmtp', icon: 'globe', label: 'CRM (TP)', url: 'https://qlcptp.meraplion.com' },
];

export default function AppsScreen() {

  const handleOpenApp = (app: typeof APP_ITEMS[0]) => {
    // Nếu là URL external, mở bằng Linking
    if (app.url) {
      Linking.openURL(app.url);
    }
  };

  return (
    <View style={globalStyles.screen}>
      <CustomHeader title="Ứng dụng & Công cụ" />
      
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={globalStyles.sectionHeader}>📱 APPS</Text>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {APP_ITEMS.map((app) => (
            <TouchableOpacity 
              key={app.id} 
              style={[globalStyles.card, { width: '47%', alignItems: 'center', paddingVertical: spacing.lg }]}
              onPress={() => handleOpenApp(app)}
            >
              <View style={{ 
                width: 56, 
                height: 56, 
                borderRadius: 28, 
                backgroundColor: colors.primaryLight,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.sm
              }}>
                <Ionicons name={app.icon as any} size={28} color={colors.primary} />
              </View>
              <Text style={[globalStyles.body, { fontWeight: '600', textAlign: 'center' }]}>
                {app.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}
