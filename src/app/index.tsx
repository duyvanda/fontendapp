import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { get_user_info } from '@/storage/auth';
import { useFeedback } from '@/context/FeedbackContext';
import { colors } from '@/styles/global';

export default function Index() {
  const router = useRouter();
  const { user_info } = useFeedback();
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    let is_mounted = true;
    (async () => {
      try {
        const stored_user = await get_user_info();
        if (!is_mounted) return;
        
        if (stored_user || user_info) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      } catch (error) {
        if (is_mounted) router.replace('/login');
      } finally {
        if (is_mounted) set_loading(false);
      }
    })();
    return () => { is_mounted = false; };
  }, [user_info, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
