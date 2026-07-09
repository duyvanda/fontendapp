# Yêu Cầu Kiểm Thử (Test Plan) Dành Cho Agent BIRA App

Chào bạn (Agent phụ trách QA/Testing), hệ thống Push Notification của ứng dụng BIRA vừa được xây dựng hoàn thiện từ Backend (PostgreSQL + Django) đến Frontend (React Native - Expo). Nhiệm vụ của bạn là kiểm tra xem toàn bộ luồng tích hợp này có hoạt động trơn tru không.

Dưới đây là tài liệu chi tiết để bạn rà soát:

## 1. Môi trường Backend (Django & PostgreSQL)

Hệ thống đã triển khai các bảng `expo_push_tokens`, `expo_notifications` (định danh bằng cột `manv`) và các Store Procedures xử lý tương ứng. 

**Nhiệm vụ Test:** Sử dụng một Python script (gọi thư viện `urllib` hoặc `requests`) để kiểm thử các Endpoint sau:

- **1. Test Đăng ký Push Token**
  - **API**: `POST https://bi.meraplion.com/local/post_data/expo_push_token_register/`
  - **Payload**: `[{"manv": "TEST01", "token": "ExponentPushToken[AgentQA123]", "platform": "android"}]`
  - **Expected**: HTTP 200, trả về `"status": "success"`.

- **2. Test Đếm số thông báo (Badge)**
  - **API**: `GET https://bi.meraplion.com/local/get_data/expo_get_unread_notifications_count/?manv=TEST01`
  - **Expected**: HTTP 200, `unread_count` trả về `0`.

- **3. Test Bắn Notification Thực Tế (Backend Trigger)**
  - **API**: `POST https://bi.meraplion.com/local/send-push-notification/`
  - **Payload**: 
    ```json
    [
      {
        "manv": "TEST01",
        "title": "Test QA Agent",
        "body": "Đây là tin nhắn test từ hệ thống tự động",
        "type": "system",
        "report_stt": "2"
      }
    ]
    ```
  - **Expected**: HTTP 200. Nếu Expo Token không hợp lệ thì thuộc tính `error` trong kết quả phải ghi rõ.

- **4. Test Lấy danh sách thông báo**
  - **API**: `GET https://bi.meraplion.com/local/get_data/expo_get_notifications/?manv=TEST01`
  - **Expected**: HTTP 200, mảng `rows_data` phải trả về tin nhắn vừa bắn ở bước 3, với trạng thái `is_read: false`.

- **5. Test Đánh dấu đã đọc**
  - **API**: `POST https://bi.meraplion.com/local/post_data/expo_insert_mark_all_notifications_read/`
  - **Payload**: `[{"manv": "TEST01"}]`
  - **Expected**: Chạy lại Bước 2, `unread_count` phải tụt về `0`.

---

## 2. Môi trường Frontend (React Native - Expo)

Source code nằm tại: `D:\django_apps\rest\fontendapp`

**Nhiệm vụ Test:** Hãy đóng vai trò là một Frontend Developer để review source code. Bạn cần kiểm tra 3 điểm trọng yếu sau (Không cần chạy giả lập, chỉ cần verify luồng Logic code):

1. **Storage & Utils (`src/storage/notification.ts`, `src/utils/notifications.ts`)**: 
   - Kiểm tra xem hàm `register_for_push_notificationsAsync()` có đang gọi đúng API `/post_data/expo_push_token_register/` và truyền đúng payload `[{ manv, token, platform }]` không.
   - Hàm `unregisterPushToken` có gọi API `/post_data/expo_push_token_unregister/` hay không.

2. **Context API (`src/context/NotificationContext.tsx`)**:
   - Check xem Context đã parse đúng key `rows_data` từ HTTP Response cho các API `expo_get_notifications` và `expo_get_unread_notifications_count` chưa.
   - API `mark_as_read` (đọc 1 tin) đã được setup vòng lặp loop để gọi API `/post_data/expo_insert_mark_notification_read/` cho mảng các IDs chưa.

3. **Giao diện App (`src/app/(tabs)`)**:
   - Tab "Thông báo" đã xuất hiện trong file `_layout.tsx` chưa, Badge đếm số (BadgeStyle đỏ) có đang lấy giá trị từ biến `unread_count` không.
   - Icon cái chuông (Header) trong `index.tsx` và `CustomHeader.tsx` có đang hiển thị số lượng chưa đọc không.
   - Khi bấm vào 1 tin nhắn trong file `notifications.tsx`, app có gọi `mark_as_read` và chuyển hướng (router) thẳng tới `/report/[id]` (dựa vào `report_stt`) hay không.

---

> [!NOTE]
> Xin lưu ý: Mọi API Endpoint ở Frontend đã được đồng bộ hóa thành `manv` (mã nhân viên). Tuyệt đối không dùng lại key `user_id` cũ trong các Payload HTTP nữa.
> Nếu mọi thứ đều vượt qua các bước kiểm định trên, hệ thống được xem là Đạt Yêu Cầu (Passed).
