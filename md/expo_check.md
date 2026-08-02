Ran command: `npx expo install --check`

Kết quả khi chạy `npx expo install --check` báo các package sau cần được cập nhật để tương thích tốt nhất với Expo SDK đang dùng:

```text
The following packages should be updated for best compatibility with the installed expo version:
  expo@57.0.8 - expected version: ~57.0.9
  expo-constants@57.0.7 - expected version: ~57.0.8
  expo-image-picker@57.0.6 - expected version: ~57.0.7
  expo-notifications@57.0.7 - expected version: ~57.0.8
  expo-router@57.0.8 - expected version: ~57.0.9
  expo-sharing@57.0.7 - expected version: ~57.0.8
  expo-updates@57.0.10 - expected version: ~57.0.11
  react-native@0.86.0 - expected version: 0.86.2
  react-native-reanimated@4.5.0 - expected version: 4.5.1
  react-native-worklets@0.10.0 - expected version: 0.10.1
```

Để tự động sửa (nâng cấp các package này lên phiên bản expected ở trên), bạn chỉ cần chạy:
```powershell
npx expo install --fix
```

Bạn có muốn mình chạy lệnh `--fix` luôn không?