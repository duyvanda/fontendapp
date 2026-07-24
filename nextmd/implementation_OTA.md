# Tài liệu Quy trình & Luồng xử lý Hệ thống (System Flow Documentation)

Tài liệu này tổng hợp toàn bộ các luồng xử lý chính đã được nâng cấp và triển khai trong ứng dụng **BI Portal** (React Native / Expo), bao gồm: Luồng kiểm tra OTA Update, Luồng Đăng nhập tối ưu, Luồng Thông báo Push Realtime và Luồng Khôi phục quyền Thông báo.

---

## 1. Luồng Kiểm tra & Áp dụng OTA Update (Splash Screen OTA Flow)

### Quy trình hoạt động

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant App as App (_layout.tsx)
    participant ExpoUpdates as Expo Updates Server

    User->>App: Mở ứng dụng (Production)
    App->>User: Hiển thị Splash Screen xanh ngọc BI PORTAL ("Đang kiểm tra cập nhật...")
    
    par Kiểm tra OTA với Safe Timeout (10 giây)
        App->>ExpoUpdates: Updates.checkForUpdateAsync()
    and
        App->>App: Bộ đếm Safe Timeout (Max 10s)
    end

    alt KHÔNG CÓ BẢN MỚI (Xử lý siêu nhanh ~100ms)
        ExpoUpdates-->>App: isAvailable = false
        App->>User: Tắt Splash Screen ngay lập tức -> Vào thẳng màn Login / Tabs
    else CÓ BẢN OTA MỚI
        ExpoUpdates-->>App: isAvailable = true
        App->>User: Cập nhật Text: "Đang tải bản cập nhật mới..."
        App->>ExpoUpdates: Updates.fetchUpdateAsync()
        ExpoUpdates-->>App: Tải xong bản cập nhật
        App->>User: Cập nhật Text: "Đang áp dụng..."
        App->>ExpoUpdates: Updates.reloadAsync() (Tự động khởi động lại vào bản mới)
    else MẠNG CHẬM / QUÁ 10 GIÂY TIMEOUT / LỖI
        App->>User: Tự động đóng Splash Screen -> Vào dùng app bình thường (Tránh đơ app)
    end
```

### Các file liên quan
* [`src/app/_layout.tsx`](file:///d:/django_apps/rest/fontendapp/src/app/_layout.tsx#L19-L138): Chứa màn hình Splash thương hiệu và hàm `check_and_apply_update()` xử lý bất đồng bộ kết hợp `Promise.race` (Timeout 10s).

---

## 2. Luồng Đăng nhập Tối ưu (Login Flow)

### Quy trình hoạt động
1. **Tự động ngầm gán Mã tổ chức**: Mã tổ chức mặc định `tenant_id = 'merap'` được gán ngầm dưới nền. Ô nhập "Mã tổ chức" được ẩn khỏi giao diện để tối giản trải nghiệm.
2. **Tự động Focus con trỏ**: Ngay khi mở màn hình Đăng nhập, con trỏ tự động nhấp nháy vào ô **Tên đăng nhập** (bật sẵn bàn phím), người dùng gõ tài khoản ngay không cần bấm thêm thao tác.
3. **Gửi yêu cầu**: Gửi payload `{ email: email.toUpperCase(), password, tenant_id: 'merap' }` về server backend PostgreSQL.

### Các file liên quan
* [`src/app/login.tsx`](file:///d:/django_apps/rest/fontendapp/src/app/login.tsx#L53-L140): Đặt `useState('merap')`, ẩn container input `Mã tổ chức` và dùng `useEffect` tự động `email_input_ref.current?.focus()`.

---

## 3. Luồng Quản lý Thông báo Push Realtime (Push Notification Flow)

### Quy trình hoạt động

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng (Điện thoại)
    participant Auth as Login / Auth Context
    participant NotiCtx as NotificationContext
    participant ExpoNoti as Hệ điều hành / Expo Push
    participant Backend as Backend PostgreSQL API

    User->>Auth: Đăng nhập thành công (Lấy được user_info.manv)
    Auth->>NotiCtx: Cập nhật user_info (kích hoạt có manv)
    
    rect rgb(255, 245, 230)
        Note over User, NotiCtx: Đăng ký Push Token
        NotiCtx->>ExpoNoti: Gọi requestPermissionsAsync()
        ExpoNoti->>User: Hiển thị Popup OS: "BI Portal muốn gửi thông báo cho bạn"
        
        alt Người dùng chọn [ TỪ CHỐI ]
            User-->>ExpoNoti: Denied (Từ chối)
            NotiCtx->>NotiCtx: Dừng luồng (Không lấy Token, Không gửi Backend)
        else Người dùng chọn [ CHO PHÉP ]
            User-->>ExpoNoti: Allowed (Đồng ý)
            NotiCtx->>ExpoNoti: Lấy Push Token (getExpoPushTokenAsync)
            ExpoNoti-->>NotiCtx: Trả về ExponentPushToken[xxxxxxxxxxxx]
            NotiCtx->>Backend: Gửi POST /post_data/expo_insert_push_token/ (manv, push_token, platform)
            Backend-->>NotiCtx: Lưu Token thành công vào PostgreSQL
        end
    end

    rect rgb(240, 248, 255)
        Note over NotiCtx, Backend: Lấy dữ liệu & Đếm số chưa đọc
        NotiCtx->>Backend: Fetch danh sách thông báo & unread_count
        Backend-->>NotiCtx: Trả về unread_count -> Hiển thị Badge đỏ trên TabBar/Header
    end

    rect rgb(250, 235, 255)
        Note over User, Backend: Nhận Push Realtime & Tương tác
        Backend->>ExpoNoti: Server bắn thông báo mới cho manv qua Expo Push Service
        ExpoNoti->>User: Hiển thị Banner nổi + Phát tiếng chuông + Tăng số Badge
        ExpoNoti->>NotiCtx: Listener addNotificationReceivedListener kích hoạt
        NotiCtx->>Backend: Tự động làm mới unread_count mới nhất
        User->>NotiCtx: Xem thông báo -> Bấm "Đánh dấu đã đọc"
        NotiCtx->>Backend: Gửi API expo_insert_mark_notification_read
        NotiCtx->>User: Giảm số Badge trên UI lập tức (Optimistic Update)
    end
```

### Các file liên quan
* [`src/context/NotificationContext.tsx`](file:///d:/django_apps/rest/fontendapp/src/context/NotificationContext.tsx#L112-L170): Chứa hàm `register_push_token_async`, cấu hình Android Notification Channel, lắng nghe `addNotificationReceivedListener` và xử lý API đếm chưa đọc (`unread_count`).
* [`src/app/_layout.tsx`](file:///d:/django_apps/rest/fontendapp/src/app/_layout.tsx#L10-L17): Cấu hình `Notifications.setNotificationHandler` hiển thị banner, âm thanh và badge khi app đang mở (Foreground).

---

## 4. Luồng Khôi phục quyền Thông báo trong Cài đặt (Notification Settings Recovery)

### Quy trình hoạt động

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant Account as AccountScreen (account.tsx)
    participant ExpoNoti as Notifications API
    participant OS as Cài đặt Điện thoại (iOS / Android)

    User->>Account: Bấm vào mục "Cài đặt Thông báo"
    Account->>ExpoNoti: Kiểm tra Notifications.getPermissionsAsync()
    
    alt Quyền đã ĐƯỢC BẬT (granted)
        ExpoNoti-->>Account: status = 'granted'
        Account->>User: Hiển thị Alert: "Quyền thông báo đang ĐƯỢC BẬT"
    else Quyền đang BỊ TẮT / TỪ CHỐI (denied)
        ExpoNoti-->>Account: status = 'denied'
        Account->>User: Hiển thị Alert: "Thông báo đang tắt. Mở Cài đặt thiết bị để bật lại?"
        User->>Account: Bấm nút [ Mở Cài đặt ]
        Account->>OS: Gọi Linking.openSettings()
        OS->>User: Mở trực tiếp màn hình Cài đặt ứng dụng BI Portal
        User->>OS: Gạt công tắc bật "Cho phép thông báo"
        User->>Account: Quay lại ứng dụng BI Portal
        Account->>Account: AppState phát hiện active -> Tự động sinh Push Token và lưu về Server!
    end
```

### Các file liên quan
* [`src/app/account.tsx`](file:///d:/django_apps/rest/fontendapp/src/app/account.tsx#L23-L47): Định nghĩa hàm `handle_notification_settings()` và nút bấm **"Cài đặt Thông báo"** tích hợp `Linking.openSettings()`.

---

## Tóm tắt các Endpoint API liên quan

| Endpoint Backend | Phương thức | Chức năng |
| :--- | :--- | :--- |
| `/get_data/expo_get_notifications/?manv={manv}` | `GET` | Lấy danh sách thông báo của nhân viên |
| `/get_data/expo_get_unread_notifications_count/?manv={manv}` | `GET` | Lấy số lượng thông báo chưa đọc |
| `/post_data/expo_insert_push_token/` | `POST` | Lưu cặp `(manv, push_token, platform)` vào PostgreSQL |
| `/post_data/expo_insert_mark_notification_read/` | `POST` | Đánh dấu 1 thông báo là đã đọc |
| `/post_data/expo_insert_mark_all_notifications_read/` | `POST` | Đánh dấu tất cả thông báo của nhân viên là đã đọc |
