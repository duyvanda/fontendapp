# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Code convention
- Tên biến/hàm: snake_case (tracking_chi_phi_hcp, handle_submit, set_arr_hcp)
- Context: luôn destructure đủ FeedbackContext
- string utils import các hàm ở đó để dùng.

# old project
- D:\django_apps\rest\frontend1

# backend
- D:\django_apps\rest\frontend1\bi_local_rest
    - local_views.py
    - local_urls.py

# folder structure
- @folder_structure.md

# api là postgresql luôn thông qua local_views hàm get_data và hàm get_data. Cách viết PSQL như sau:
- D:\ai-docs\postgres\write_get_function.md
- D:\ai-docs\postgres\write_insert_function.md

# Build preview
- **Build APK preview**: `eas build --profile preview --platform android`
- **Build TestFlight iOS (Auto Submit)**: `eas build --platform ios --profile production --auto-submit`
- **OTA Update**: `eas update --channel preview --environment preview --message "Update text"`
- **OTA production update**: `eas update --channel production --environment production --message "Update text"`
- **Lưu ý quan trọng**: Tuyệt đối không tự ý chạy các lệnh build nặng tạo file .apk/.aab HOẶC lệnh `eas update` (OTA Update) nếu không có sự yêu cầu trực tiếp từ người dùng. Luôn luôn đề xuất lệnh để người dùng tự xác nhận chứ không tự ý submit nữa.

