# 📝 Hướng Dẫn Tối Ưu Quyền Hạn & Tái Kích Hoạt Tính Năng (Apple & Google Play)

Tài liệu này ghi nhận toàn bộ các thư viện và quyền hạn native đã được **gỡ bỏ** để phục vụ cho việc duyệt App Store/Google Play Store dễ dàng hơn, đồng thời hướng dẫn cách **tái kích hoạt** các tính năng này khi bạn bắt tay vào code thật.

---

## 🛡️ Tóm tắt các tính năng đã gỡ bỏ để duyệt App
Để tránh việc bị Apple và Google từ chối tự động (Auto-reject) do xin quyền thừa thãi (mã nguồn có thư viện nhưng giao diện không sử dụng), các phần sau đã được tạm thời gỡ bỏ:
1. **Face ID / Sinh trắc học** (`expo-local-authentication`)
2. **Push Notifications (Thông báo đẩy)** (`expo-notifications`)
3. **Geo-location (Định vị)** (`expo-location`)

---

## 🛠️ Hướng dẫn Tái kích hoạt (Khi bắt đầu Code thật)

### 1. Kích hoạt lại Face ID / Vân tay
Nếu bạn muốn thêm tính năng đăng nhập bằng sinh trắc học:

#### Bước 1.1: Cài đặt lại thư viện
Chạy lệnh cài đặt của Expo để lấy phiên bản tương thích:
```bash
npx expo install expo-local-authentication
```

#### Bước 1.2: Cấu hình lại file `app.json`
Thêm plugin và mô tả quyền vào `app.json` tại các vị trí tương ứng:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSFaceIDUsageDescription": "Ứng dụng cần quyền Face ID / Touch ID để xác thực đăng nhập nhanh chóng và bảo mật."
      }
    },
    "android": {
      "permissions": [
        "android.permission.USE_BIOMETRIC",
        "android.permission.USE_FINGERPRINT"
      ]
    },
    "plugins": [
      "expo-local-authentication"
    ]
  }
}
```

---

### 2. Kích hoạt lại Push Notifications
Khi bạn sẵn sàng triển khai hệ thống thông báo đẩy:

#### Bước 2.1: Cài đặt lại thư viện
```bash
npx expo install expo-notifications
```

#### Bước 2.2: Cấu hình lại file `app.json`
Thêm các quyền Android và cấu hình plugin hiển thị icon/màu sắc của thông báo:
```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.SCHEDULE_EXACT_ALARM",
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.VIBRATE"
      ]
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#00A79D",
          "defaultChannel": "default"
        }
      ]
    ]
  }
}
```

#### Bước 2.3: Mở khóa Code (Uncomment)
1. **Mở file** `src/utils/notifications.ts`:
   - Uncomment các dòng import thư viện:
     ```typescript
     import * as Device from 'expo-device';
     import * as Notifications from 'expo-notifications';
     ```
   - Mở khóa đoạn handler mặc định ở đầu file (`Notifications.setNotificationHandler...`).
   - Mở khóa toàn bộ logic bên trong hàm `registerForPushNotificationsAsync(manv: string)`.
2. **Mở file** `src/context/NotificationContext.tsx`:
   - Uncomment dòng import:
     ```typescript
     import * as Notifications from 'expo-notifications';
     ```
   - Mở khóa block listener nhận thông báo ở chế độ foreground (`useEffect` lắng nghe `Notifications.addNotificationReceivedListener`).

---

### 3. Kích hoạt lại Định vị (Location)
Nếu sau này hệ thống cần lấy tọa độ của người dùng để phân vùng dữ liệu:

#### Bước 3.1: Cài đặt lại thư viện
```bash
npx expo install expo-location
```

#### Bước 3.2: Cấu hình lại file `app.json`
Thêm các quyền truy cập GPS trên Android và mô tả hiển thị trên iOS:
```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION"
      ]
    },
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Ứng dụng cần quyền truy cập vị trí để hiển thị dữ liệu theo khu vực."
        }
      ]
    ]
  }
}
```

---

## ⚠️ Lưu ý quan trọng khi Build Native sau khi thay đổi
Mọi thay đổi liên quan đến `app.json` (thêm quyền, thêm plugin native) sẽ **không có tác dụng qua OTA Update** (`eas update`). Bạn bắt buộc phải chạy lệnh đóng gói native mới:
```bash
eas build --profile preview --platform android
```
*(Hoặc dùng profile production tương ứng).*
