import * as Application from 'expo-application';
import Constants from 'expo-constants';

export interface AppVersionInfo {
  platform: string;
  latest_version: string;
  is_force_update: boolean;
  update_url: string;
  release_notes: string;
}

// Phiên bản Native hiện tại của app đang cài trên thiết bị (iOS & Android)
export const CURRENT_NATIVE_VERSION =
  Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';

/**
 * Trích xuất các cụm số từ chuỗi version (hỗ trợ các định dạng như "1.0.2", "1.0.(2)", "v1.0.3").
 */
export function parse_version_numbers(version_str: string): number[] {
  if (!version_str || typeof version_str !== 'string') return [0, 0, 0];
  const matches = version_str.match(/\d+/g);
  if (!matches || matches.length === 0) return [0, 0, 0];
  return matches.map(Number);
}

/**
 * Kiểm tra phiên bản hiện tại trên máy có nhỏ hơn phiên bản target trên server không.
 */
export function is_update_required(current_str: string, target_str: string): boolean {
  if (!current_str || !target_str) return false;
  const current_parts = parse_version_numbers(current_str);
  const target_parts = parse_version_numbers(target_str);

  const max_len = Math.max(current_parts.length, target_parts.length);
  for (let i = 0; i < max_len; i++) {
    const curr = current_parts[i] ?? 0;
    const req = target_parts[i] ?? 0;
    if (curr < req) return true;   // Máy thấp hơn Server -> Cần update
    if (curr > req) return false;  // Máy cao hơn/bằng Server -> Đã mới nhất
  }
  return false;
}

/**
 * Phân loại chi tiết trạng thái cập nhật phiên bản dựa trên latest_version và is_force_update.
 */
export function check_version_status(
  current_version: string,
  version_info?: AppVersionInfo | null
) {
  if (!version_info || !version_info.latest_version) {
    return { is_force: false, is_optional: false, has_update: false };
  }

  const has_update = is_update_required(current_version, version_info.latest_version);
  const is_force = has_update && (version_info.is_force_update ?? false);
  const is_optional = has_update && !is_force;

  return {
    is_force,
    is_optional,
    has_update,
  };
}
