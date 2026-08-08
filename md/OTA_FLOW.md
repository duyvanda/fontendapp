# Tài liệu Quy trình & Luồng xử lý OTA Update (OTA Update Flow)

Tài liệu này tổng hợp luồng xử lý chính về kiểm tra, tải xuống và áp dụng bản cập nhật OTA (Over-The-Air) trong ứng dụng **BI Portal** (React Native / Expo).

---

## Thứ tự ưu tiên thực thi khi Cold Boot (Bootstrap Sequence)

> **Quan trọng:** Thứ tự này không được thay đổi.

```
bootstrap_app()  ← được gọi trong useEffect của _layout.tsx
    │
    ├─► 1. capture_initial_notification()   ← PHẢI CHẠY ĐẦU TIÊN
    │         Lưu notification intent vào AsyncStorage TRƯỚC khi OTA có thể reload
    │         Đảm bảo deep-link không bị mất nếu reloadAsync() restart JS runtime
    │
    └─► 2. check_and_apply_update(true)     ← OTA + Native Version Check
              ├─ check_native_version_api()  (timeout 3s)
              └─ OTA check (timeout 10s)
```

---

## Luồng Kiểm tra & Áp dụng OTA Update (Splash Screen OTA Flow)

### Quy trình hoạt động

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant App as App (_layout.tsx)
    participant Storage as AsyncStorage
    participant VersionAPI as Native Version API
    participant ExpoUpdates as Expo Updates Server

    User->>App: Mở ứng dụng (Production)
    App->>App: Hiển thị Splash Screen xanh ngọc BI PORTAL
    App->>Storage: capture_initial_notification()
    Storage-->>App: pending_notification saved (nếu có)

    App->>VersionAPI: check_native_version_api() [timeout 3s]
    VersionAPI-->>App: version info

    alt Force Update
        App->>User: Hiện Modal bắt buộc cập nhật → DỪNG OTA
    else OK
        par Kiểm tra OTA với Safe Timeout (10 giây)
            App->>ExpoUpdates: Updates.checkForUpdateAsync()
        and
            App->>App: Bộ đếm Safe Timeout (Max 10s)
        end

        alt KHÔNG CÓ BẢN MỚI (~100ms)
            ExpoUpdates-->>App: isAvailable = false
            App->>User: Tắt Splash Screen → Vào màn Login / Tabs
        else CÓ BẢN OTA MỚI
            ExpoUpdates-->>App: isAvailable = true
            App->>User: "Đang tải bản cập nhật mới..."
            App->>ExpoUpdates: Updates.fetchUpdateAsync()
            ExpoUpdates-->>App: Tải xong
            App->>User: "Đang áp dụng..."
            App->>App: Updates.reloadAsync()
            Note over App: JS Runtime restart → bootstrap_app() lại từ đầu
            Note over Storage: pending_notification vẫn còn trong AsyncStorage ✅
        else MẠNG CHẬM / QUÁ 10 GIÂY / LỖI
            App->>User: Tự động đóng Splash → Vào dùng app bình thường
        end
    end
```

---

## Vì sao capture_initial_notification() phải chạy TRƯỚC OTA

```
LUỒNG CŨ (bug):
  Tap notification (Killed State)
      ↓
  OTA → reloadAsync()
      ↓
  JS Runtime restart → native response MẤT
      ↓
  index.tsx: getLastNotificationResponseAsync() → null
      ↓
  ❌ Không deep-link được

LUỒNG MỚI (đã fix):
  Tap notification (Killed State)
      ↓
  capture_initial_notification() → AsyncStorage (PERSISTENT)
      ↓
  OTA → reloadAsync()
      ↓
  JS Runtime restart → AsyncStorage VẪN CÒN
      ↓
  FeedbackContext hydrate (initialized = true)
      ↓
  index.tsx: get_pending_notification() → report_stt
      ↓
  ✅ router.replace('/report/{stt}') + clear pending
```

---

## AppState Active — OTA Background Check

```
App từ Background → Foreground (AppState 'active')
  └─► check_and_apply_update(false)   ← KHÔNG capture notification lại
        ├─ Mutex lock is_running ngăn race condition
        ├─ check_native_version_api()
        └─ OTA check (timeout 10s)

Lý do KHÔNG capture notification khi background resume:
  → Killed State đã được xử lý bởi bootstrap_app()
  → App alive tap notification xử lý qua NotificationContext listener
```

---

## Các file liên quan

| File | Vai trò |
|---|---|
| [`src/app/_layout.tsx`](../src/app/_layout.tsx) | `bootstrap_app()`, `capture_initial_notification()`, `check_and_apply_update()` |
| [`src/app/index.tsx`](../src/app/index.tsx) | Chờ `initialized`, đọc `pending_notification`, routing |
| [`src/context/FeedbackContext.tsx`](../src/context/FeedbackContext.tsx) | `initialized` flag, hydrate cache |
| [`src/storage/notification.ts`](../src/storage/notification.ts) | `PendingNotification`, `save/get/remove_pending_notification()` |
