import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PUSH_TOKEN: 'push_token',
} as const;

export async function savePushToken(token: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.PUSH_TOKEN, token);
}

export async function getPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.PUSH_TOKEN);
}

export async function removePushToken(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.PUSH_TOKEN);
}
