import React, { useState, useEffect } from 'react';
import CustomHeader from '@/components/CustomHeader';
import { globalStyles, spacing, colors } from '@/styles/global';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { LOCALURL, apiFetch } from '@/utils/api';

type AppItem = {
  id: string;
  icon: string;
  label: string;
  url: string;
  group: string;
};

export default function AppsScreen() {
  const [app_items, set_app_items] = useState<AppItem[]>([]);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    const fetch_apps = async () => {
      try {
        const res = await apiFetch<any>(`${LOCALURL}/get_data/get_app_items/`);
        const data = res?.data || res;
        set_app_items(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch apps:', error);
      } finally {
        set_loading(false);
      }
    };
    fetch_apps();
  }, []);

  const handle_open_app = async (app: AppItem) => {
    // Nếu là URL external, mở bằng WebBrowser để không bị văng ra khỏi app (Apple Prefer)
    if (app.url) {
      await WebBrowser.openBrowserAsync(app.url);
    }
  };

  const apps = app_items.filter(a => a.group === 'apps');
  const tools = app_items.filter(a => a.group === 'tools');

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
      <CustomHeader title="Tiện ích báo cáo" />

      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            {apps.length > 0 && (
              <>
                <Text style={[globalStyles.sectionHeader, { color: colors.primary, letterSpacing: 1.5 }]}>🌐 LIÊN KẾT HỆ THỐNG</Text>
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

            {app_items.length === 0 && (
              <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: spacing.lg }}>
                Không có ứng dụng nào.
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
