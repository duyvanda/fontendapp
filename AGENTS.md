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
    - `expo_check_app_version.sql`: DDL bảng `public.expo_app_version` và function `expo_check_app_version(jsonb)` kiểm tra phiên bản app Native theo platform.

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

# Notification Deep-link Architecture
- **Killed State**: `_layout.tsx` → `capture_initial_notification()` → `save_pending_notification()` → AsyncStorage (persist qua OTA) → `index.tsx` chờ `initialized` → `get_pending_notification()` → route → clear.
- **App Alive (foreground/background)**: `NotificationContext` → `addNotificationResponseReceivedListener` → `handle_notification_response()` → `navigate_to_report()` → `clearLastNotificationResponse()`.
- **Phân vai rõ ràng**: Không có hai nơi cùng tranh nhau consume cùng một notification response.
- **`initialized` flag**: `FeedbackContext` set `initialized = true` trong `finally` block sau khi hydrate user + reports từ cache. `index.tsx` **bắt buộc** phải chờ `initialized` trước khi routing.
- **`pending_notification` storage key**: Lưu `{ notification_id, report_stt, captured_at }`. Được xóa ngay sau khi đã consume.

# App Versioning & Version Check (Cơ chế Kiểm tra Phiên bản)
- **Cấu hình DB & API**: Bảng `public.expo_app_version` & Function `expo_check_app_version(jsonb)` (`/get_data/expo_check_app_version/?platform=<android|ios>`).
- **Đơn giản hóa**: Loại bỏ hoàn toàn `min_required_version`. Chỉ sử dụng duy nhất `latest_version` và cờ `is_force_update`.
- **Cơ chế so sánh**: Hàm `check_version_status(CURRENT_NATIVE_VERSION, version_info)` trong `@/constants/version`:
  - So sánh `CURRENT_NATIVE_VERSION < latest_version` $\rightarrow$ `has_update = true`.
  - `is_force_update = true`: Bắt buộc cập nhật (Modal ẩn nút "Để sau", khóa phím Back Android, dừng luồng OTA check ở Splash).
  - `is_force_update = false`: Gợi ý cập nhật (Modal có nút "Để sau").
  - Nếu `CURRENT_NATIVE_VERSION >= latest_version`: App hoạt động bình thường, không bị block nhầm.
- **Thứ tự ưu tiên thực thi (Execution Priority)**:
  - Luồng kiểm tra Native App Version qua API luôn được chạy **ĐẦU TIÊN** trong mọi kịch bản.
  - **Cold Boot (Khởi động từ đầu / Kill app mở lại)**: Chạy `check_native_version_api()` ngay tại Splash Screen. Nếu là Bắt buộc cập nhật $\rightarrow$ Chặn ngay lập tức, dừng luồng OTA check, hiện Modal khóa ứng dụng.
  - **Background AppState (`AppState === 'active'`)**: Khi từ Background quay lại Foreground, app gọi lại `check_native_version_api()` với cờ Mutex Lock `is_running` ngăn Race condition. Nếu Admin vừa bật `is_force_update = true` trên Server, Modal sẽ lập tức hiện đè lên màn hình khóa ứng dụng.

# Notification & OTA Updates (Lưu ý về Push Notification & OTA)
- **Native Plugin Assets**: Các tài nguyên Native khai báo trong Plugin `app.json` (như `expo-notifications` với `icon: ./assets/images/notification_icon.png`) cần được build lại APK/IPA Native để nhúng trực tiếp vào Android/iOS binary resources (`res/drawable`). OTA Update chỉ đẩy Javascript bundle nên không sửa được Native Resources của ứng dụng đã cài trước đó trên máy user.
- **Tương thích OTA Version**: Khi đẩy OTA update (`eas update`), giữ nguyên `"version"` trong `app.json` nếu muốn các máy chạy bản Native APK/IPA hiện tại nhận được cập nhật (do `runtimeVersion` đang cấu hình theo policy `appVersion`).
- **Đẩy OTA cho nhiều phiên bản Native song song (vd: `1.0.1` & `1.0.2`)**:
  - Do `runtimeVersion` ăn theo `appVersion`, máy ở phiên bản Native nào sẽ chỉ nhận OTA phát hành riêng cho phiên bản đó.
  - **Quy trình đẩy đồng thời cho cả 2 nhóm người dùng**:
    1. Đẩy cho nhóm `1.0.2`: Giữ `"version": "1.0.2"` trong `app.json` $\rightarrow$ Chạy `eas update --channel production --environment production --message "..."`.
    2. Đẩy cho nhóm `1.0.1`: Tạm sửa `"version": "1.0.1"` trong `app.json` $\rightarrow$ Chạy `eas update --channel production --environment production --message "..."`.
    3. Đổi lại `app.json` về `"version": "1.0.2"`.
- **Cold Boot Notification (Killed State Deep-link)**: Dùng `AsyncStorage` (`pending_notification`) thay vì `getLastNotificationResponseAsync()`. Flow: `capture_initial_notification()` trong `_layout.tsx` lưu intent TRƯỚC OTA → sau reload, `index.tsx` đọc `get_pending_notification()` và route → clear bằng `remove_pending_notification()` + `clearLastNotificationResponse()`.

# Build & Submission (Lệnh Build & Nộp ứng dụng Store)
- **Lưu ý quan trọng**: Tuyệt đối **KHÔNG** tự ý chạy các lệnh build nặng tạo file `.apk`/`.aab`/`.ipa` hay lệnh `eas update` nếu không có yêu cầu trực tiếp từ người dùng. Luôn chạy `npx tsc --noEmit` trước khi build.
- **Lệnh Android AAB Production (CH Play)**: `eas build --platform android --profile production`
- **Lệnh Android APK Preview**: `eas build --profile preview --platform android`
- **Lệnh iOS TestFlight (Auto Submit)**: `eas build --platform ios --profile production --auto-submit`
- **Lệnh OTA Update Production**: `eas update --channel production --environment production --message "..."`
- **Nộp iOS từ Windows (App-Specific Password)**:
  ```powershell
  $env:EXPO_APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
  eas submit --platform ios --latest
  # Chọn Provider: MERAP GROUP CORPORATION (128862239)
  ```
