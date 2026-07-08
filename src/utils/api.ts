/**
 * Cấu hình URL và helpers fetch API cho BI Portal.
 * Port từ frontend1/src/context/FeedbackContext.js constants.
 */

export const API_BASE_URL = 'https://bi.meraplion.com/local';
export const LOCALURL = 'https://bi.meraplion.com/local';
export const BIRA_API_URL = 'https://bi.meraplion.com:18002/api';
export const MARKDOWN_CONVERT_URL = 'https://bi.meraplion.com:18002/api/convert-to-markdown';
export const REPORTS_API_URL = `${LOCALURL}/get_data/get_report_phan_quyen_tong_hop/`;

/**
 * Generic fetch wrapper với error handling chuẩn.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Phản hồi không phải JSON: ${text.substring(0, 100)}`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.detail || `HTTP ${response.status}`);
  }

  return data as T;
}
