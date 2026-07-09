# CHƯA APPLY ĐƯỢC NHE, MỚI CHỈ NHÌN THẤY TAB NOTI VÀ BẤM VÀO ĐÃ ĐỌC THÔI.
# 🔄 Luồng Hoạt Động Của Hệ Thống Push Notification

Tài liệu này mô tả chi tiết toàn bộ vòng đời của một Push Notification, từ khi người dùng mở app đến lúc nhận được thông báo biến động KPI.

## 1. Khởi tạo & Đăng ký thiết bị (Frontend ➔ Backend)

1. **Đăng nhập App**: Người dùng (Ví dụ: `MR1077`) tiến hành đăng nhập thành công vào ứng dụng Expo.
2. **Xin quyền (Permissions)**: 
   - Hàm `registerForPushNotificationsAsync` chạy ngầm.
   - Ứng dụng hiển thị popup xin quyền gửi thông báo (nếu là lần đầu).
3. **Lấy Expo Push Token**: 
   - Sau khi được cấp quyền, thiết bị giao tiếp với máy chủ Expo để lấy một Token định danh duy nhất (VD: `ExponentPushToken[xxxxxxxxxxxx]`).
4. **Lưu Token vào Backend**: 
   - Ứng dụng gọi API `POST /push-token/register/` kèm thông tin `manv` và `expo_push_token`. 
   - Backend lưu lại Token này vào Database, gắn liền với user `MR1077`.

---

## 2. Phát sinh sự kiện & Gửi Push (Backend ➔ Expo ➔ Thiết bị)

1. **Kiểm tra KPI định kỳ**: 
   - Hệ thống Backend (có thể dùng Celery/Cronjob) định kỳ chạy script kiểm tra data.
   - Backend phát hiện: *Tồn kho của MR1077 rớt dưới ngưỡng an toàn*.
2. **Tạo Notification**: 
   - Backend tạo 1 record trong bảng `Notifications` (Lưu lịch sử vào Database).
3. **Gọi Expo Push API**:
   - Backend truy vấn Database lấy ra `expo_push_token` của `MR1077`.
   - Backend gửi một HTTP POST request đến `https://exp.host/--/api/v2/push/send` với payload:
     ```json
     {
       "to": "ExponentPushToken[xxxxxxxxxxxx]",
       "title": "⚠️ Cảnh báo KPI Rớt",
       "body": "KPI Tồn kho của bạn dưới mức an toàn.",
       "data": { "report_stt": "2", "type": "kpi_drop" }
     }
     ```
4. **Trung tâm Expo phân phối**: Máy chủ Expo gửi lệnh Push xuống Apple APNs (iOS) hoặc FCM (Android).

---

## 3. Trải nghiệm người dùng (Thiết bị ➔ Frontend)

Khi thiết bị nhận được Push, sẽ có 2 trường hợp:

### A. 📱 App đang đóng hoặc chạy ngầm (Background / Killed)
- Điện thoại rung/kêu báo hiệu và hiển thị banner thông báo trên màn hình khóa.
- Người dùng bấm vào thông báo.
- App khởi động, đọc cục `data` đính kèm (VD: `report_stt: "2"`) và **tự động chuyển hướng (navigate)** thẳng vào trang chi tiết Báo cáo số 2.

### B. 🟢 App đang mở trên màn hình (Foreground)
- Listener `addNotificationReceivedListener` trong `NotificationContext.tsx` bắt được tín hiệu.
- App **không** hiển thị banner lấn màn hình (tuỳ cấu hình) nhưng lập tức gọi hàm `refresh_unread_count`.
- Icon 🔔 cái Chuông trên góc phải tự động nảy số đỏ (VD: từ `0` ➔ `1`).

---

## 4. Quản lý trạng thái (Frontend ➔ Backend)

1. **Xem danh sách**: Người dùng bấm vào Tab "Thông báo", app gọi `GET /notifications/` để tải toàn bộ lịch sử cảnh báo từ Database.
2. **Đánh dấu đã đọc**: Khi người dùng nhấn vào 1 dòng thông báo, app gọi `POST /notifications/mark-read/`. Con số đỏ trên chuông giảm xuống.
3. **Hủy đăng ký (Logout)**: Khi người dùng bấm Đăng Xuất, app gọi `POST /push-token/unregister/`. Backend xóa token khỏi Database. Dù có rớt KPI thì máy cũng không còn nhận thông báo báo động (tránh làm phiền người dùng khác mượn máy).

---

> [!TIP]
> **Dành riêng cho Dev (Backend)**
> Ở phase tiếp theo để push thực sự hoạt động, Backend cần setup thư viện gọi Expo Push API (như `exponent_server_sdk` cho Python) và cấu hình Cronjob kiểm tra KPI.
