# 🔔 NotificationContext — Full Flow Documentation

> **File nguồn:** [`NotificationContext.tsx`](./NotificationContext.tsx)  
> **Liên quan:** [`FeedbackContext.tsx`](./FeedbackContext.tsx) · [`../storage/notification.ts`](../storage/notification.ts)

---

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        _layout.tsx                              │
│  Notifications.setNotificationHandler(...)  ← Foreground config │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  FeedbackProvider                        │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │              NotificationProvider                  │  │   │
│  │  │  - notifications[]    - unread_count               │  │   │
│  │  │  - badge sync         - polling 60s                │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 1 — App khởi động (Chưa cần Login)

```
App mở
  │
  ├─► _layout.tsx: Notifications.setNotificationHandler()
  │     └─ Cấu hình foreground: shouldShowAlert, shouldPlaySound, shouldSetBadge = true
  │
  └─► NotificationProvider mount
        └─► useEffect → setup_push_token()
              ├─ Gọi getPermissionsAsync()
              │    ├─ Nếu chưa có quyền → requestPermissionsAsync() → Popup OS cho user chọn
              │    └─ Nếu đã có quyền → tiếp tục
              ├─ Android: setNotificationChannelAsync('default', MAX importance)
              ├─ Gọi getExpoPushTokenAsync({ projectId })
              │    └─ Trả về: ExponentPushToken[xxxxxxxxxx]
              └─ Lưu token vào AsyncStorage (save_push_token)
                   └─ Token sẵn sàng, chờ login để gửi lên server
```

---

## PHASE 2 — Login thành công

```
User đăng nhập → FeedbackContext.login_user() thành công
  │
  └─► set_user_info(data) → user_info.manv có giá trị
        │
        └─► NotificationProvider phát hiện user_info.manv thay đổi
              └─► useEffect([user_info?.manv]) kích hoạt:
                    │
                    ├─► register_push_token_async(manv)
                    │     ├─ Lấy token từ AsyncStorage (get_push_token)
                    │     │    └─ Nếu null → gọi lại setup_push_token()
                    │     ├─ Thu thập device_info:
                    │     │    ├─ Device.brand, Device.modelName
                    │     │    ├─ Device.getDeviceNameAsync()  ← async!
                    │     │    ├─ Device.osName, Device.osVersion
                    │     │    ├─ Application.nativeApplicationVersion
                    │     │    ├─ Application.nativeBuildVersion
                    │     │    └─ Device.isDevice
                    │     └─ POST /post_data/expo_push_token_register/
                    │          Body: [{ manv, token, platform, device_info }]
                    │          → DB: INSERT/UPDATE expo_push_tokens (upsert by manv)
                    │          → Nếu token cũ đang gắn với user khác → DELETE trước
                    │
                    ├─► refresh_unread_count(manv)
                    │     ├─ GET /get_data/expo_get_unread_notifications_count/?manv=xxx
                    │     ├─ set_unread_count(count)
                    │     └─ Notifications.setBadgeCountAsync(count) ← Đồng bộ badge icon
                    │
                    ├─► setInterval(60s):
                    │     └─ Nếu app đang active → refresh_unread_count(manv)
                    │
                    ├─► AppState.addEventListener('change'):
                    │     └─ Nếu background/inactive → active:
                    │           ├─ register_push_token_async(manv)  ← re-register khi resume
                    │           └─ refresh_unread_count(manv)
                    │
                    ├─► addNotificationReceivedListener:
                    │     └─ Nhận push khi app đang foreground → refresh_unread_count()
                    │
                    └─► addNotificationResponseReceivedListener:
                          └─ User bấm vào notification banner → refresh_unread_count()
```

---

## PHASE 3 — Nhận Push Notification

```
Backend Server
  ├─ INSERT notification vào bảng expo_notifications (manv, title, body, type, report_stt)
  ├─ SELECT COUNT(*) unread FROM expo_notifications WHERE manv = xxx AND is_read = false
  └─ POST https://exp.host/--/api/v2/push/send
       Body: {
         "to": "ExponentPushToken[xxxxxxxxxx]",
         "title": "Tiêu đề",
         "body": "Nội dung",
         "sound": "default",
         "badge": <unread_count>,   ← số chưa đọc tại thời điểm gửi
         "data": { "report_stt": "001" }
       }
         │
         ▼
Expo Push Service → gửi đến APNs (iOS) / FCM (Android)
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  App đang BACKGROUND / LOCK SCREEN                  │
│  → Hệ điều hành hiện banner + âm thanh              │
│  → Icon app hiện badge số (từ field "badge")         │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  App đang FOREGROUND                                 │
│  → setNotificationHandler hiển thị in-app banner    │
│  → addNotificationReceivedListener kích hoạt        │
│  → refresh_unread_count() → badge đồng bộ với DB    │
└─────────────────────────────────────────────────────┘
```

---

## PHASE 4 — User tương tác với Notification

### 4A. User bấm vào 1 notification (mark as read)

```
notifications.tsx: handle_press(item)
  │
  ├─ Nếu item.is_read = false → mark_as_read([item.id])
  │     ├─ Đếm số notification thực sự chưa đọc trong ids
  │     ├─ Optimistic update: set is_read = true trong state ngay
  │     ├─ new_count = unread_count - unread_ids  (Math.max 0)
  │     ├─ set_unread_count(new_count)
  │     ├─ Notifications.setBadgeCountAsync(new_count) ← badge giảm ngay lập tức
  │     └─ POST /post_data/expo_insert_mark_notification_read/
  │          Body: [{ id: xxx }]  ← gộp tất cả ids vào 1 request
  │
  └─ Nếu item.report_stt có giá trị → điều hướng màn hình:
        ├─ type = 4 hoặc trong NATIVE_REPORTS_MAP → /report/native/{stt}
        ├─ link_report startsWith '/realtime' → /realtime/{stt}
        └─ Còn lại → /report/{stt}
```

### 4B. User bấm "Đánh dấu tất cả đã đọc"

```
notifications.tsx: mark_all_read(user_info.manv)
  ├─ Optimistic update: set tất cả is_read = true trong state
  ├─ set_unread_count(0)
  ├─ Notifications.setBadgeCountAsync(0) ← badge về 0 ngay lập tức
  └─ POST /post_data/expo_insert_mark_all_notifications_read/
       Body: [{ manv: "MR0123" }]
```

### 4C. Polling 60s đồng bộ badge với server

```
setInterval (60s, chỉ khi app active):
  └─ refresh_unread_count(manv)
       ├─ GET /get_data/expo_get_unread_notifications_count/?manv=xxx
       ├─ set_unread_count(count từ DB)
       └─ Notifications.setBadgeCountAsync(count) ← badge luôn đúng với DB
```

---

## PHASE 5 — Logout

```
FeedbackContext.logout_user()
  │
  ├─► Lấy push_token từ AsyncStorage (get_push_token)
  ├─► POST /post_data/expo_push_token_unregister/
  │      Body: [{ manv, token }]
  │      → DB: DELETE FROM expo_push_tokens WHERE token = xxx
  │      → Thiết bị ngừng nhận push notification ngay sau khi logout
  │
  ├─► remove_push_token() ← xóa token khỏi AsyncStorage
  │      (Lần đăng nhập sau sẽ xin lại token mới từ Expo)
  │
  ├─► clear_all_auth() ← xóa user data
  ├─► set_user_info(null)
  │
  └─► NotificationProvider phát hiện user_info = null
        └─► useEffect cleanup:
              ├─ clearInterval(interval 60s)
              ├─ subscription.remove() (AppState)
              ├─ notification_listener.remove()
              └─ response_listener.remove()
```

---

## Tóm tắt Badge lifecycle

| Sự kiện | Badge thay đổi | Nguồn |
|---------|---------------|-------|
| Backend gửi push với `badge: N` | Set = N | APNs / FCM |
| Login → `refresh_unread_count` | Set = số chưa đọc từ DB | Server |
| App foreground, nhận push | Refresh từ DB | Server |
| App resume từ background | Refresh từ DB | Server |
| Polling 60s | Đồng bộ với DB | Server |
| Bấm vào 1 notification | Giảm đi số đã đọc | Optimistic local |
| Bấm "Đọc hết" | Set = 0 | Optimistic local |

---

## API Endpoints sử dụng

| Endpoint | Method | Chức năng |
|----------|--------|-----------|
| `/get_data/expo_get_notifications/?manv=` | GET | Lấy danh sách thông báo |
| `/get_data/expo_get_unread_notifications_count/?manv=` | GET | Đếm số chưa đọc |
| `/post_data/expo_push_token_register/` | POST | Đăng ký token + device_info |
| `/post_data/expo_push_token_unregister/` | POST | Hủy token khi logout |
| `/post_data/expo_insert_mark_notification_read/` | POST | Đánh dấu đã đọc (batch) |
| `/post_data/expo_insert_mark_all_notifications_read/` | POST | Đánh dấu tất cả đã đọc |
