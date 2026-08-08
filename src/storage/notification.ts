import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PUSH_TOKEN: 'push_token',
  PENDING_NOTIFICATION: 'pending_notification',
} as const;

export interface PendingNotification {
  notification_id: string;
  report_stt: string;
  captured_at: number;
}

export async function save_push_token(token: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.PUSH_TOKEN, token);
}

export async function get_push_token(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.PUSH_TOKEN);
}

export async function remove_push_token(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.PUSH_TOKEN);
}

export async function save_pending_notification(
  notification: PendingNotification,
): Promise<void> {
  await AsyncStorage.setItem(
    KEYS.PENDING_NOTIFICATION,
    JSON.stringify(notification),
  );
}

export async function get_pending_notification(): Promise<PendingNotification | null> {
  const value = await AsyncStorage.getItem(KEYS.PENDING_NOTIFICATION);

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<PendingNotification>;

    if (
      !parsed.notification_id ||
      !parsed.report_stt ||
      typeof parsed.captured_at !== 'number'
    ) {
      await remove_pending_notification();
      return null;
    }

    return {
      notification_id: parsed.notification_id,
      report_stt: parsed.report_stt,
      captured_at: parsed.captured_at,
    };
  } catch (error) {
    console.log('[NotificationStorage] Invalid pending notification:', error);
    await remove_pending_notification();
    return null;
  }
}

export async function remove_pending_notification(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.PENDING_NOTIFICATION);
}
