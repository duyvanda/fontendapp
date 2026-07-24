# Báo cáo Cập nhật Logic Push Notification

Dưới đây là tổng hợp chi tiết toàn bộ các thay đổi vừa được thực hiện để hoàn thiện luồng gửi/nhận Push Notification và chuẩn hóa code convention cho ứng dụng.

## 1. Các thay đổi đã thực hiện

### Sửa lỗi API & Logic đồng bộ Token
- **Cập nhật API Đăng ký Token:** Đã sửa tên API từ `expo_insert_push_token` thành đúng chuẩn `expo_push_token_register` theo như function Postgres.
- **Cập nhật Cấu trúc Dữ liệu:** Sửa key truyền lên Backend từ `push_token` thành `token` để khớp với logic lấy dữ liệu của câu lệnh SQL (`v_token := v_row->>'token'`).

### Hoàn thiện Vòng đời của Push Token
- **Xin quyền ngay khi mở App:** Tách logic xin quyền OS và lấy Expo Push Token ra hàm độc lập `setup_push_token`. Hàm này tự động chạy ngầm ngay khi app vừa bật lên (chưa cần đăng nhập), sau đó lưu token vào thiết bị bằng `AsyncStorage`.
- **Đăng ký Token khi Login:** Hàm `register_push_token_async` nay sẽ tự động lấy token từ `AsyncStorage` (hoặc xin lại nếu mất) để gửi lên API khi user đăng nhập thành công.
- **Gỡ Token khi Logout:** Bổ sung hàm mới `unregister_push_token_async`. Đã tích hợp hàm này trực tiếp vào hàm `logout_user` trong `FeedbackContext.tsx`. Khi user đăng xuất, hệ thống sẽ gọi API `expo_push_token_unregister` để xóa dòng token tương ứng khỏi database, giúp thiết bị **ngừng nhận thông báo** ngay lập tức sau khi đăng xuất.

### Chuẩn hóa Code Convention (`snake_case`)
Đã rà soát và refactor toàn bộ tên biến, state, và hàm trong 2 file `NotificationContext.tsx` và `src/storage/notification.ts` để tuân thủ tuyệt đối quy tắc `snake_case` đã định nghĩa trong `AGENTS.md`. Các thay đổi bao gồm:
- `savePushToken` ➡️ `save_push_token`
- `getPushToken` ➡️ `get_push_token`
- `removePushToken` ➡️ `remove_push_token`
- `setNotifications` ➡️ `set_notifications`
- `setUnreadCount` ➡️ `set_unread_count`
- `setLoading` ➡️ `set_loading`
- `appState` ➡️ `app_state`
- `notificationListener` ➡️ `notification_listener`
- `responseListener` ➡️ `response_listener`

## 2. Các file đã bị thay đổi
1. [d:\django_apps\rest\fontendapp\src\context\NotificationContext.tsx](file:///d:/django_apps/rest/fontendapp/src/context/NotificationContext.tsx)
2. [d:\django_apps\rest\fontendapp\src\storage\notification.ts](file:///d:/django_apps/rest/fontendapp/src/storage/notification.ts)
3. [d:\django_apps\rest\fontendapp\src\context\FeedbackContext.tsx](file:///d:/django_apps/rest/fontendapp/src/context/FeedbackContext.tsx)

## 3. Hành động cần làm tiếp theo (Dành cho bạn)

> [!NOTE]
> **Kiểm tra Deployment Target iOS**
> Nếu bạn quyết định muốn hỗ trợ các thiết bị iOS đời cũ, hãy cài đặt plugin `expo-build-properties` và chỉnh lại config `deploymentTarget` trong `app.json` nhé.
