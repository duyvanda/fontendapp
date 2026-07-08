import { useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/global';
import CloudAssist from '@/components/CloudAssist';

export default function TabLayout() {
  const [show_bira, set_show_bira] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            elevation: 8,
            shadowColor: colors.cardShadowColor,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bira"
          listeners={() => ({
            tabPress: (e) => {
              // Prevent default action (don't navigate to empty tab)
              e.preventDefault();
              // Show BIRA Modal
              set_show_bira(true);
            },
          })}
          options={{
            title: 'BIRA',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={size} color={colors.primary} /> // Keep it colored or active? Let's stick to standard color
            ),
          }}
        />
        <Tabs.Screen
          name="apps"
          options={{
            title: 'Apps',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="apps" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <CloudAssist visible={show_bira} onClose={() => set_show_bira(false)} />
    </>
  );
}
