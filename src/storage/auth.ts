/**
 * Storage layer cho user authentication.
 * Thay thế localStorage → AsyncStorage cho React Native.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface user_info_type {
  manv: string;
  email: string;
  token: string;
  ho_ten?: string;
  phong_ban?: string;
}

export interface user_hr_info_type {
  manv?: string;
  hoten?: string;
  hovatenfullname?: string;
  ten_chucdanh?: string;
  chucdanhengtitle?: string;
  ten_bophan?: string;
  phongdeptsummary?: string;
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

export async function save_user_info(info: user_info_type): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_INFO, JSON.stringify(info));
}

export async function get_user_info(): Promise<user_info_type | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_INFO);
  return raw ? JSON.parse(raw) : null;
}

export async function remove_user_info(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER_INFO);
}

// ─── user_hr_info ──────────────────────────────────────────────────────────────

export async function save_user_hr_info(info: user_hr_info_type): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_HR_INFO, JSON.stringify(info));
}

export async function get_user_hr_info(): Promise<user_hr_info_type | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER_HR_INFO);
  return raw ? JSON.parse(raw) : null;
}

export async function remove_user_hr_info(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER_HR_INFO);
}

// ─── Reports list ──────────────────────────────────────────────────────────────

export async function save_reports_list(reports: unknown[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_LST_REPORTS, JSON.stringify(reports));
}

export async function get_reports_list(): Promise<unknown[]> {
  const raw = await AsyncStorage.getItem(KEYS.USER_LST_REPORTS);
  return raw ? JSON.parse(raw) : [];
}

export async function remove_reports_list(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER_LST_REPORTS);
}

// ─── BIRA session ──────────────────────────────────────────────────────────────

export async function get_bira_session_id(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.BIRA_SESSION_ID);
}

export async function save_bira_session_id(id: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.BIRA_SESSION_ID, id);
}

// ─── Clear all ─────────────────────────────────────────────────────────────────

export async function clear_all_auth(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.USER_INFO,
    KEYS.USER_HR_INFO,
    KEYS.USER_LST_REPORTS,
  ]);
}
