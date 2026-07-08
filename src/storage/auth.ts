/**
 * Storage layer cho user authentication.
 * Thay thế localStorage → AsyncStorage cho React Native.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserInfo {
  manv: string;
  email: string;
  token: string;
  ho_ten?: string;
  phong_ban?: string;
}

export interface UserHrInfo {
  manv?: string;
  show_cloud_assist?: boolean;
  cloud_assist_questions?: Array<{ question: string }>;
  [key: string]: unknown;
}

const KEYS = {
  USER_INFO: 'user_info',
  USER_HR_INFO: 'user_hr_info',
  USER_LST_REPORTS: 'userLstReports',
  BIRA_SESSION_ID: 'bira_session_id',
} as const;

// ─── user_info ─────────────────────────────────────────────────────────────────

export async function saveUserInfo(info: UserInfo): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_INFO, JSON.stringify(info));
}

export async function getUserInfo(): Promise<UserInfo | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_INFO);
  return raw ? JSON.parse(raw) : null;
}

export async function removeUserInfo(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER_INFO);
}

// ─── user_hr_info ──────────────────────────────────────────────────────────────

export async function saveUserHrInfo(info: UserHrInfo): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_HR_INFO, JSON.stringify(info));
}

export async function getUserHrInfo(): Promise<UserHrInfo | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_HR_INFO);
  return raw ? JSON.parse(raw) : null;
}

export async function removeUserHrInfo(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER_HR_INFO);
}

// ─── Reports list ──────────────────────────────────────────────────────────────

export async function saveReportsList(reports: unknown[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_LST_REPORTS, JSON.stringify(reports));
}

export async function getReportsList(): Promise<unknown[]> {
  const raw = await AsyncStorage.getItem(KEYS.USER_LST_REPORTS);
  return raw ? JSON.parse(raw) : [];
}

export async function removeReportsList(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER_LST_REPORTS);
}

// ─── BIRA session ──────────────────────────────────────────────────────────────

export async function getBiraSessionId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.BIRA_SESSION_ID);
}

export async function saveBiraSessionId(id: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.BIRA_SESSION_ID, id);
}

// ─── Clear all ─────────────────────────────────────────────────────────────────

export async function clearAllAuth(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.USER_INFO,
    KEYS.USER_HR_INFO,
    KEYS.USER_LST_REPORTS,
  ]);
}
