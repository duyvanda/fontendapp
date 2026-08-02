# Tài liệu Quy trình & Luồng xử lý OTA Update (OTA Update Flow)

Tài liệu này tổng hợp luồng xử lý chính về kiểm tra, tải xuống và áp dụng bản cập nhật OTA (Over-The-Air) trong ứng dụng **BI Portal** (React Native / Expo).

---

## Luồng Kiểm tra & Áp dụng OTA Update (Splash Screen OTA Flow)

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
