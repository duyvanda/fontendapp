# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Duyệt plan trước khi sửa file và code.

# Code convention
- Tên biến/hàm: snake_case (tracking_chi_phi_hcp, handle_submit, set_arr_hcp)
- Context: luôn destructure đủ FeedbackContext
- **Sử dụng utilities (`src/utils`)**:
  - **`api.ts`**: Chứa hằng số URL và hàm `apiFetch<T>(url, options)`. Bắt buộc dùng `apiFetch` thay thế `fetch` thô cho **tất cả các API call trong hệ thống** (bao gồm giao tiếp với server BI Portal, BI Local Rest, BIRA, v.v...) để tự động đính kèm chữ ký bảo mật (`X-Portal-Time`, `X-Portal-Token`).
  - **`device.ts`**: Chứa hàm `async get_device_info()`. Bắt buộc phải có `await` khi gọi để lấy đầy đủ thông tin thiết bị (như `device_id`, `os_version`, v.v...).
  - **`string.ts`**: Chứa các hàm tiện ích xử lý chuỗi và định dạng ngày tháng như `remove_accents`, `format_date`, `format_date_ymd`, `get_id`, `format_number`... Luôn import từ đây để dùng đồng nhất.

# old project
- D:\django_apps\rest\frontend1

# backend
- D:\django_apps\rest\frontend1\bi_local_rest
    - `local_views.py`:
        - `get_data(request, pk)`: Endpoint GET lấy dữ liệu qua Stored Function PostgreSQL (`/get_data/<pk>/`)
        - `post_data(request, pk)`: Endpoint POST thực thi Stored Function PostgreSQL (`/post_data/<pk>/`, ví dụ: `expo_push_token_register`, `expo_push_token_unregister`)
        - `api_send_push_notification(request)`: Endpoint POST gửi Push Notification qua Expo API (`/send-push-notification/`)
        - `api_get_superset_guest_token(request)`: Endpoint lấy Guest Token Superset (`/get_superset_guest_token/`)
        - `send_support_email_notification(request)`: Endpoint gửi Email thông báo hỗ trợ (`/send_support_email_notification/`)
    - `local_urls.py`: Khai báo URL routing cho các endpoint của `bi_local_rest`

# folder structure
- @folder_structure.md

# api là postgresql luôn thông qua local_views hàm get_data và hàm get_data. Cách viết PSQL như sau:
- D:\ai-docs\postgres\write_get_function.md
- D:\ai-docs\postgres\write_insert_function.md

# sql
- `sql/`: Thư mục chứa các script DDL và Stored Functions PostgreSQL:
    - `expo_push_tokens.sql`: DDL bảng `public.expo_push_tokens` (lưu token notification, platform, device_info JSONB theo `manv`).
    - `expo_push_token_register.sql`: Function `expo_push_token_register(jsonb)` xử lý lưu/cập nhật token push notification cho user khi login.
    - `expo_push_token_unregister.sql`: Function `expo_push_token_unregister(jsonb)` xử lý xóa token push notification khi user logout.

# Build preview (KHÔNG TỰ Ý BẤM)
- **Build APK preview**: `eas build --profile preview --platform android`
- **Check config**: `eas config --platform ios --profile production`
- **Build TestFlight iOS (Auto Submit)**: `eas build --platform ios --profile production --auto-submit`
- **OTA Update**: `eas update --channel preview --environment preview --message "Update text"`
- **OTA production update**: `eas update --channel production --environment production --message "Update text"`
- npx tsc --noEmit luôn chạy trước khi build
- **Lưu ý quan trọng**: Tuyệt đối không tự ý chạy các lệnh build nặng tạo file .apk/.aab HOẶC lệnh `eas update` (OTA Update) nếu không có sự yêu cầu trực tiếp từ người dùng. Luôn luôn đề xuất lệnh để người dùng tự xác nhận chứ không tự ý submit nữa.


# API
- Hệ thống sử dụng PostgreSQL Stored Functions nhận và trả về JSONB.
- URL get: https://bi.meraplion.com/local/get_data/<ten_ham>, input json là query params
- URL post: https://bi.meraplion.com/local/post_data/<ten_ham>

# Report Types
- `type: 0` & `type: 1`: Looker Studio embed (tự động thay `xxxxxx` -> `manv`, `vvvvvv` -> `manv_int_0`).
- `type: 4`: Native report (Render bằng React Native component khai báo trong `NATIVE_REPORTS_MAP`).
- `link_report` bắt đầu bằng `/realtime`: Realtime report xử lý qua backend API.
- `type: 5`: Echart HTML report (Render trực tiếp qua file HTML từ `link_report`, tự động thay `xxxxxx` -> `manv` của user).

# Workthough format: walkthrough_DDMMYYYY_HHMMSS.md tạo trong thư mục changelog/ ở gốc dự án (không bỏ vào thư mục md/)
- Ưu tiên gom file lại nếu trùng giờ.
