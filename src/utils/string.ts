/**
 * Các hàm tiện ích xử lý chuỗi và ngày tháng.
 * Port từ frontend1/src/utils/string.js — adapted for React Native (no window.*).
 */

/**
 * Xoá dấu tiếng Việt, chuyển về chữ thường không dấu.
 */
export function remove_accents(str: string): string {
  if (!str) return str;
  return str
    .normalize('NFD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

/**
 * Xoá dấu nhưng giữ nguyên hoa thường.
 */
export function remove_accents_with_case(str: string): string {
  if (!str) return str;
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Format date → DD-MM-YYYY
 */
export function format_date(dateString: string | Date): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format date → YYYY-MM-DD
 */
export function format_date_ymd(date: Date | string): string {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

/**
 * Lấy ngày hiện tại dạng [year, month, day].
 */
export function get_current_dmy(): [number, number, number] {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
}

/**
 * Tạo version string dựa theo thời gian hiện tại.
 * Format: THHMMSSmmm
 */
export function get_version(): string {
  const date = new Date();
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `T${h}${m}${s}${ms}`;
}

/**
 * Timestamp ISO +7 giờ, không có Z. Dùng cho inserted_at.
 */
export function inserted_at(): string {
  const datetime = new Date();
  datetime.setHours(datetime.getHours() + 7);
  return datetime.toISOString().replace('Z', '');
}

/**
 * Tạo unique ID dạng YYYYMMDDHHMMSSmmm.
 */
export function get_id(): string {
  return new Date(Date.now() + 7 * 3600000)
    .toISOString()
    .replace(/[-:.TZ]/g, '');
}

/**
 * Format số ngăn cách hàng nghìn bằng dấu phẩy.
 */
export function format_number(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Tạo danh sách tháng cho select dropdown.
 */
export function generate_month_options(
  startOffset: number,
  endOffset: number,
): Array<{ value: string; label: string }> {
  const options = [];
  const today = new Date();
  for (let i = startOffset; i <= endOffset; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const value = `${year}-${month}-01`;
    const label = date.toLocaleDateString('vi-VN', {
      month: 'long',
      year: 'numeric',
    });
    options.push({ value, label });
  }
  return options;
}
