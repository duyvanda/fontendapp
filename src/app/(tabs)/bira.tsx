import { View } from 'react-native';

// BIRA Tab is a pseudo-tab. Its layout tabPress listener prevents navigation
// and instead opens the CloudAssist Modal overlay directly.
// This file exists so Expo Router doesn't complain about a missing route for the tab.
export default function BiraTab() {
  return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
}
