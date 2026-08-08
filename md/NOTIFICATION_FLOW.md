# 🔔 NotificationContext — Full Flow Documentation

> **File nguồn:** [`NotificationContext.tsx`](../src/context/NotificationContext.tsx)  
> **Liên quan:** [`FeedbackContext.tsx`](../src/context/FeedbackContext.tsx) · [`../storage/notification.ts`](../src/storage/notification.ts) · [`_layout.tsx`](../src/app/_layout.tsx) · [`index.tsx`](../src/app/index.tsx)

---

## Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│                        _layout.tsx                              │
│  Notifications.setNotificationHandler(...)  ← Foreground config │
│  capture_initial_notification() ← Lưu pending vào AsyncStorage  │
│  bootstrap_app(): capture → OTA check                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  FeedbackProvider                        │   │
│  │  initialized flag ← hydrate cache → set true            │   │
│  │  ┌───────────────────────────────────────────────────┐  │   │
│  │  │              NotificationProvider                  │  │   │
│  │  │  - notifications[]    - unread_count               │  │   │
│  │  │  - badge sync         - polling 60s                │  │   │
│  │  └───────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## PHASE 1 — App khởi động & Bootstrap Sequence (Cold Boot)

```
App mở (_layout.tsx)
  │
  ├─► Notifications.setNotificationHandler() ← Cấu hình foreground handler
  │
  └─► bootstrap_app() [SEQUENTIAL]:
        │
        ├─► 1. capture_initial_notification()  ← PHẢI CHẠY TRƯỚC OTA
        │       ├─ Đọc Notifications.getLastNotificationResponse() (sync)
        │       ├─ Kiểm tra DEFAULT_ACTION_IDENTIFIER + report_stt hợp lệ
        │       └─ Lưu vào AsyncStorage: save_pending_notification({
        │              notification_id, report_stt, captured_at
        │          })
        │          ✅ Persist qua OTA reloadAsync()
        │
        └─► 2. check_and_apply_update(true)
                ├─ check_native_version_api()   ← Native version check
                └─ OTA check → fetchUpdateAsync() → reloadAsync()
                        ↓
                   ════ JS RUNTIME RESTART ════
                        ↓
                   bootstrap_app() lại từ đầu
                   capture_initial_notification() → overwrite OK (cùng notification_id)
                   OTA: không còn update mới → tiếp tục bình thường
```

---

## PHASE 2 — Splash Router (index.tsx) Routing

```
FeedbackContext hydrate (song song AsyncStorage):
  │  Promise.all([get_user_info(), get_user_hr_info(), get_reports_list()])
  │  → set_user_info, set_user_hr_info, set_reports (từ cache ngay)
  │  → finally: set_initialized(true)   ← signal cho index.tsx
  │
  └─► index.tsx: useEffect([initialized, user_info, reports])
        │
        ├─ Chờ initialized = true  ← guard bắt buộc
        │
        ├─► Không có session (user_info = null)
        │       → navigate_with_fade('/login', clear_notification=true)
        │
        └─► Có session → get_pending_notification() từ AsyncStorage
              │
              ├─► CÓ pending notification (report_stt = "8")
              │       ├─ Tìm report trong Context reports[]
              │       ├─ Xác định route:
              │       │    ├─ type=4 hoặc trong NATIVE_REPORTS_MAP → /report/native/{stt}
              │       │    ├─ link_report starts '/realtime' → /realtime/{stt}
              │       │    └─ Còn lại → /report/{stt}
              │       └─ navigate_with_fade(target_route, clear_notification=true)
              │              └─ Sau fade: clearLastNotificationResponse() + remove_pending_notification()
              │
              └─► KHÔNG có pending → navigate_with_fade('/(tabs)')
```

---

## PHASE 3 — Đã đăng nhập & Xin quyền Push Notification tại Trang chủ `/(tabs)`

```
User đã đăng nhập thành công (hoặc Auto-login vào Trang chủ /(tabs))
  │
  └─► user_info.manv có giá trị
        │
        └─► NotificationProvider phát hiện user_info.manv thay đổi
              └─► useEffect([user_info?.manv]) kích hoạt:
                    │
                    ├─► register_push_token_async(manv)
                    │     ├─ Lấy token từ AsyncStorage (get_push_token)
                    │     ├─ Nếu NULL (chưa có token local):
                    │     │    └─ Gọi setup_push_token():
                    │     │         ├─ getPermissionsAsync()
                    │     │         ├─ Nếu chưa granted → requestPermissionsAsync()
                    │     │         │    └─ 🔔 POPUP HỆ ĐIỀU HÀNH BẬT LÊN XIN QUYỀN TẠI TRANG CHỦ /(tabs)
                    │     │         │
                    │     │         ├─ ❌ TRƯỜNG HỢP USER TỪ CHỐI (status !== 'granted'):
                    │     │         │    └─ Log warning → trả về NULL
                    │     │         │
                    │     │         └─ ✅ TRƯỜNG HỢP USER ĐỒNG Ý (status === 'granted'):
                    │     │              ├─ Android: setNotificationChannelAsync('default', MAX importance)
                    │     │              ├─ getExpoPushTokenAsync({ projectId })
                    │     │              └─ save_push_token(push_token) xuống AsyncStorage
                    │     │
                    │     ├─ ❌ Nếu push_token là NULL (do từ chối quyền):
                    │     │    └─ DỪNG NGAY (return early) → KHÔNG thu thập device_info & KHÔNG gọi API backend register
                    │     │
                    │     └─ ✅ push_token hợp lệ:
                    │          ├─ Thu thập device_info (brand, model, os_name, os_version, app_version...)
                    │          └─ POST /post_data/expo_push_token_register/
                    │               Body: [{ manv, token, platform, device_info }]
                    │               → DB: INSERT/UPDATE expo_push_tokens (upsert by manv, token)
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
                          └─ handle_notification_response(response):
                                ├─ Guard: DEFAULT_ACTION_IDENTIFIER only
                                ├─ Dedup: last_handled_notification_id ref
                                ├─ refresh_unread_count(manv)
                                ├─ navigate_to_report(report_stt)
                                └─ clearLastNotificationResponse()
                                     ← Xóa native response để cold boot sau không re-process
```

---

## PHASE 4 — Nhận Push Notification

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
         ├─► Nếu Expo API trả về response error "DeviceNotRegistered":
         │     └─ Backend thực hiện dọn dẹp: DELETE FROM expo_push_tokens WHERE token = xxx
         │        (Token cũ bị hỏng/vô hiệu hóa do user gỡ app)
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

## PHASE 5 — User tương tác với Notification

### 5A. User bấm vào 1 notification (mark as read)

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

### 5B. User bấm "Đánh dấu tất cả đã đọc"

```
notifications.tsx: mark_all_read(user_info.manv)
  ├─ Optimistic update: set tất cả is_read = true trong state
  ├─ set_unread_count(0)
  ├─ Notifications.setBadgeCountAsync(0) ← badge về 0 ngay lập tức
  └─ POST /post_data/expo_insert_mark_all_notifications_read/
       Body: [{ manv: "MR0123" }]
```

### 5C. Polling 60s đồng bộ badge với server

```
setInterval (60s, chỉ khi app active):
  └─ refresh_unread_count(manv)
       ├─ GET /get_data/expo_get_unread_notifications_count/?manv=xxx
       ├─ set_unread_count(count từ DB)
       └─ Notifications.setBadgeCountAsync(count) ← badge luôn đúng với DB
```

---

## PHASE 6 — Logout

```
FeedbackContext.logout_user()
  │
  ├─► Lấy push_token của thiết bị hiện tại từ AsyncStorage (get_push_token)
  ├─► POST /post_data/expo_push_token_unregister/
  │      Body: [{ manv, token }]
  │      → DB: DELETE FROM expo_push_tokens WHERE token = xxx
  │      → Chỉ xóa đúng token của thiết bị vừa bấm logout (Các thiết bị khác của user vẫn giữ nguyên)
  │      → Thiết bị hiện tại ngừng nhận push notification ngay lập tức
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

## Phân vai xử lý Notification theo trạng thái App

| Trạng thái | Ai xử lý | Cơ chế |
|---|---|---|
| **Killed State** (tap noti mở app) | `_layout.tsx` + `index.tsx` | `capture_initial_notification()` → AsyncStorage → `get_pending_notification()` |
| **App đang sống** (foreground / background) | `NotificationContext` | `addNotificationResponseReceivedListener` → `handle_notification_response()` |

> ⚠️ **Không có hai nơi cùng tranh nhau consume** `pending_notification`:
> - Killed state: chỉ dùng AsyncStorage path
> - App alive: chỉ dùng listener path + `clearLastNotificationResponse()` ngay sau khi xử lý

---

## Chi tiết & Vòng đời của Push Token

### 1. Nguồn gốc sinh Token
- **Android**: `Notifications.getExpoPushTokenAsync()` kết nối với **Google FCM (Firebase Cloud Messaging)** để lấy token thiết bị, sau đó chuẩn hóa thành dạng `ExponentPushToken[...]`.
- **iOS**: Thư viện kết nối với **Apple APNs (Apple Push Notification service)** lấy APNs token, sau đó chuẩn hóa thành dạng `ExponentPushToken[...]`.

### 2. Quản lý lưu trữ local (`src/storage/notification.ts`)

| Key | Hàm | Mục đích |
|---|---|---|
| `push_token` | `save/get/remove_push_token()` | Lưu Expo Push Token |
| `pending_notification` | `save/get/remove_pending_notification()` | Persist notification intent qua OTA reload |

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
| `/send-push-notification/` | POST | Gửi Push Notification (Batch & Multi-device) |

### 📄 Cấu trúc Response chuẩn của API `/send-push-notification/`

```json
{
    "status": "ok",
    "results": [
        {
            "status": "success",
            "manv": "MR2523",
            "devices_sent": 2,
            "device_results": [
                {
                    "token": "ExponentPushToken[iPhone_7Ne2VUNG30DgWcl7OnKYAX]",
                    "ticket_id": "019fd9c9-25c4-7399-971e-6cc8bafe54fd"
                },
                {
                    "token": "ExponentPushToken[iPad_8Mf3WXVH41EhXdm8PoLZBY]",
                    "ticket_id": "028ae8da-36d5-8400-082f-7dd9cbgf65ge"
                }
            ],
            "expo_json": {
                "data": [
                    { "status": "ok", "id": "019fd9c9-25c4-7399-971e-6cc8bafe54fd" },
                    { "status": "ok", "id": "028ae8da-36d5-8400-082f-7dd9cbgf65ge" }
                ]
            }
        }
    ]
}
```

---

## 🔍 Kiểm tra trạng thái Push Receipt từ Expo (Khi App bị gỡ / Uninstall)

Khi người dùng đã gỡ ứng dụng (Uninstall App) nhưng chưa Logout, token vẫn còn tồn tại trong DB `expo_push_tokens`. Khi gọi API gửi thông báo, Expo API ban đầu sẽ trả về Ticket ID với `status: "ok"` (do đã nhận tin vào queue). 

Để kiểm tra trạng thái thực tế sau khi Expo đã giao tiếp với **Google FCM** hoặc **Apple APNs**, sử dụng API **Get Push Receipts**:

- **URL:** `POST https://exp.host/--/api/v2/push/getReceipts`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  {
    "ids": [
      "019fd9c9-25c4-7399-971e-6cc8bafe54fd"
    ]
  }
  ```

- **Response khi thiết bị đã Uninstall (FCM / APNs từ chối):**
  ```json
  {
    "data": {
      "019fd9c9-25c4-7399-971e-6cc8bafe54fd": {
        "status": "error",
        "message": "The recipient device is not registered with FCM.",
        "messageEnum": 7,
        "messageParamValues": [],
        "details": {
          "error": "DeviceNotRegistered",
          "errorCodeEnum": 3,
          "sentAt": 1786065266
        },
        "__debug": {}
      }
    }
  }
  ```

> 💡 **Ghi chú:**  
> Lỗi `"DeviceNotRegistered"` xác nhận thiết bị này đã bị gỡ ứng dụng hoặc token đã hoàn toàn vô hiệu hóa trên dịch vụ của Google/Apple.
