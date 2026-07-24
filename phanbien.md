# BÁO CÁO PHẢN BIỆN KỸ THUẬT & KẾT QUẢ ĐÃ XỬ LÝ

---

### 1. ⚠️ Vấn đề UX: Xin quyền Notification ngay khi vừa mở App (`setup_push_token`)
* **Thực trạng cũ**: Ngay khi app vừa khởi động (chưa đăng nhập), `useEffect` tự động gọi `setup_push_token()` gây bật Popup xin quyền OS lập tức.
* **Tác hại**: Tỷ lệ người dùng bấm **Deny (Từ chối)** rất cao vì chưa biết ứng dụng là gì.
* **✅ Đã xử lý**: 
  * Loại bỏ `useEffect` gọi `setup_push_token()` khi app vừa khởi động ở `NotificationContext.tsx`.
  * Dời logic xin quyền `setup_push_token()` vào trong `register_push_token_async(user_info.manv)`. 
  * **Kết quả**: Popup xin quyền thông báo chỉ xuất hiện **sau khi người dùng đã đăng nhập thành công**.

---

### 2. ⚡ Vấn đề Sync Badge: Race Condition trong `mark_as_read`
* **Thực trạng cũ**: Đọc trực tiếp `unread_count` từ state closure dẫn đến tính sai badge khi bấm đọc liên tục nhiều thông báo cùng lúc.
* **✅ Đã xử lý**: 
  * Cập nhật `mark_as_read` trong `NotificationContext.tsx` dùng **Functional State Update** với `set_notifications(prev => ...)`
  * Tính toán trực tiếp số item chưa đọc còn lại (`remaining_unread`) từ mảng `updated` mới nhất và đồng bộ trực tiếp lên app icon badge via `Notifications.setBadgeCountAsync(remaining_unread)`.

---

### 3. 🌐 Vấn đề Unregister Token khi Logout (Cấu hình đơn giản)
* **Thực trạng**: Gọi API `expo_push_token_unregister` khi user bấm Đăng xuất.
* **✅ Đã xử lý (Tối giản)**:
  * Trong `logout_user()` (`FeedbackContext.tsx`), app gọi API gỡ token khi logout, đồng thời đặt `remove_push_token()` vào khối `finally` để **luôn luôn xóa token local** dưới máy nhằm đảm bảo an toàn.
  * Giữ logic đơn giản nhẹ nhàng, không lưu hàng chờ offline rườm rà (vì khi user mới đăng nhập sau, `register_push_token_async` sẽ tự đè token mới lên server).

---

### 4. 🔗 Điều hướng (Deep-linking) khi bấm vào Banner Notification lúc App bị tắt hẳn (Killed State) & Mở ngầm (Background)
* **Thực trạng cũ**: `addNotificationResponseReceivedListener` chỉ mới gọi `refresh_unread_count()`, chưa xử lý mở báo cáo tương ứng (`report_stt`). Hơn nữa khi app bị tắt hẳn (Killed State), listener không bắt được sự kiện mở app từ banner.
* **✅ Đã xử lý**:
  * Tạo hàm điều hướng dùng chung `navigate_to_report(report_stt)` hỗ trợ đẩy màn hình sang Native Report, Realtime Report, hoặc Webview Report chuẩn theo `NATIVE_REPORTS_MAP`.
  * Tạo `handle_notification_response` vừa refresh badge vừa tự chuyển hướng người dùng tới báo cáo tương ứng.
  * Tích hợp hook `Notifications.useLastNotificationResponse()` trong `NotificationContext.tsx` với ref khóa trùng lặp (`handled_last_response_id`) để bắt chính xác notification đã được bấm kể cả khi App khởi động từ **Killed State**.

---

### 📋 Tóm tắt các file đã cập nhật:
1. `src/storage/notification.ts`: Lưu & xóa push token local đơn giản.
2. `src/context/FeedbackContext.tsx`: Cập nhật `logout_user` gọn nhẹ, luôn xóa local token trong `finally`.
3. `src/context/NotificationContext.tsx`: Fix race condition `mark_as_read`, dời thời điểm xin quyền notification, xử lý deep-linking cho ca Foreground/Background & Killed State.
4. `phanbien.md`: Ghi nhận nhật ký xử lý chi tiết.