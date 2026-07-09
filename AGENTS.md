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
- **OTA Update**: `eas update --channel preview --message "nội dung"`
