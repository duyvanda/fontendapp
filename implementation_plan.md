# 3 Bug Fixes: Sort by Index, Date Picker in Modal, Android Safe Area

Tổng hợp 3 thay đổi độc lập nhau trong app BI Portal mobile.

---

## 1. Sort báo cáo theo `index` thay vì ABC

**Vấn đề**: API trả về thêm field `index` (số thứ tự từ DB), nhưng hiện tại code đang sort theo tên báo cáo (ABC). Cần sort theo `index` để giữ đúng thứ tự server định.

**Phân tích**:
- `Report` interface trong `FeedbackContext.tsx` chưa có field `index`.
- `filtered_reports` trong `index.tsx` sort: favorites lên đầu → trong mỗi nhóm sort ABC. Cần đổi thành favorites lên đầu → trong mỗi nhóm sort theo `index` tăng dần.
- `get_reports_in_folder()` sort trong folder: chỉ đưa favorite lên đầu, không có fallback. Cần thêm fallback `index`.
- `apps.tsx` (nếu dùng reports) không ảnh hưởng.

### Proposed Changes

#### [MODIFY] [FeedbackContext.tsx](file:///d:/django_apps/rest/fontendapp/src/context/FeedbackContext.tsx)
- Thêm field `index?: number` vào `Report` interface.

#### [MODIFY] [index.tsx](file:///d:/django_apps/rest/fontendapp/src/app/(tabs)/index.tsx)
- Trong `filtered_reports` (line 91-98): thay `a.tenreport.localeCompare(b.tenreport, 'vi')` → `(a.index ?? 9999) - (b.index ?? 9999)`.
- Trong `get_reports_in_folder()` (line 199-203): thêm fallback sort theo `index` khi `aFav === bFav`.

---

## 2. Date Picker thay vì TextInput trong Realtime Report Modal

**Vấn đề**: Field type `"date"` trong `REPORT_PARAMS_CONFIG` đang render `<TextInput>` thay vì date picker, user phải nhập tay.

**Phân tích**: Trong `[id].tsx` line 93-98, mọi field đều render `<TextInput>` bất kể `type`. Cần thêm phân nhánh: nếu `param.type === 'date'` → dùng date picker.

**Giải pháp**: Dùng `@react-native-community/datetimepicker` (đã phổ biến trong Expo). Nếu chưa có thì dùng package này (cần check xem đã cài chưa).

> [!IMPORTANT]
> Cần kiểm tra package.json xem `@react-native-community/datetimepicker` đã được cài chưa.

**UI**: Hiển thị button/label show ngày hiện tại, nhấn vào mở native DateTimePicker (iOS calendar sheet, Android calendar dialog).

#### [MODIFY] [[id].tsx](file:///d:/django_apps/rest/fontendapp/src/app/realtime/[id].tsx)
- Import `DateTimePicker` từ `@react-native-community/datetimepicker`.
- Thêm state `date_picker_visible` + `active_date_key` để quản lý picker mở cho field nào.
- Trong render param list: nếu `param.type === 'date'` → hiển thị `TouchableOpacity` cho thấy ngày + icon lịch, nhấn vào show DateTimePicker.
- Xử lý `onChange` của DateTimePicker: format ngày thành `YYYY-MM-DD` bằng `format_date_ymd` và lưu vào `formData`.

---

## 3. Nút xoay màn hình bị che bởi safe zone Android

**Vấn đề**: Khi kéo panel nút xuống phía dưới, nút bị che bởi thanh navigation bar của Android (safe area inset bottom). Ảnh screenshot từ user xác nhận điều này.

**Phân tích**: Trong `ReportWebView.tsx`:
- `btn_y` init tại `screen_h / 2 - BTN_PANEL_H / 2` (OK).
- Giới hạn drag max: `screen_h - BTN_PANEL_H - 60` (hardcode 60 pixels).
- Giới hạn auto-anchor khi xoay: `Math.max(4, Math.min(screen_h - BTN_PANEL_H - 60, btn_y.value))`.
- Con số `60` có thể không đủ trên thiết bị Android có navigation bar cao hơn, hoặc quá nhiều trên thiết bị không có. Cần dùng safe area inset bottom thực tế.

**Giải pháp**: 
- Import `useSafeAreaInsets` và đọc `insets.bottom`.
- Tính `bottom_guard = insets.bottom + 12` (12 = padding mong muốn).
- Dùng `bottom_guard` thay cho hardcode `60` ở: `pan_gesture.onUpdate` và `useEffect` anchor khi xoay.
- Truyền `bottom_guard` vào worklet qua `useSharedValue` vì worklet không thể trực tiếp đọc React state.

#### [MODIFY] [ReportWebView.tsx](file:///d:/django_apps/rest/fontendapp/src/components/ReportWebView.tsx)
- Import `useSafeAreaInsets` từ `react-native-safe-area-context`.
- Tính `bottom_guard = insets.bottom + 12`.
- Tạo `safe_bottom = useSharedValue(bottom_guard)`.
- Update `safe_bottom.value` trong useEffect khi `insets.bottom` thay đổi.
- Dùng `safe_bottom.value` trong `pan_gesture.onUpdate` (thay `60`).
- Dùng `bottom_guard` trong `useEffect` anchor khi `screen_h` thay đổi (thay `60`).

---

## Verification Plan

### Automated Tests
- `npx tsc --noEmit` để check TypeScript sau khi thêm field `index`.

### Manual Verification
- **Fix 1 (Sort)**: Mở app, kiểm tra danh sách báo cáo sort theo `index` API trả về, không còn sort ABC.
- **Fix 2 (Date Picker)**: Mở realtime report ID 17, kiểm tra popup hiển thị calendar picker thay vì text input.
- **Fix 3 (Safe Area)**: Trên Android, kéo nút xoay xuống phía dưới cùng → nút không bị che bởi navigation bar.
