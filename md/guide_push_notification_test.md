# 📬 Hướng dẫn Gửi Push Notification để Test

## 1. Lấy Expo Push Token

### Cách 1 — Từ Database Postgres
```sql
SELECT manv, token, platform, device_info->>'model_name' AS device, updated_at
FROM expo_push_tokens
ORDER BY updated_at DESC;
```

### Cách 2 — Từ Console Log khi app chạy
Khi đăng nhập, `NotificationContext` tự log ra:
```
[NotificationContext] Generated Push Token: ExponentPushToken[xxxxxxxxxx]
```

---

## 2. Cấu trúc Payload chuẩn (Expo Push API)

```json
{
  "to": "ExponentPushToken[xxxxxxxxxx]",
  "title": "Tiêu đề thông báo",
  "body": "Nội dung thông báo",
  "sound": "default",
  "badge": 1,
  "data": {
    "report_stt": "001"
  }
}
```

### Giải thích các field:

| Field | Bắt buộc | Mô tả |
|-------|----------|-------|
| `to` | ✅ | Expo Push Token của thiết bị |
| `title` | ✅ | Tiêu đề hiển thị trên notification |
| `body` | ✅ | Nội dung chính |
| `sound` | ❌ | `"default"` để phát âm thanh mặc định |
| `badge` | ❌ | Số hiển thị trên icon app (iOS) |
| `data` | ❌ | Dữ liệu custom — `report_stt` dùng để điều hướng màn hình |

---

## 3. Cách gửi

### Cách A — Expo Dashboard (Dễ nhất, hỗ trợ tiếng Việt đầy đủ)

1. Vào: **https://expo.dev/notifications**
2. Điền token vào ô **"Expo push token"**
3. Điền **Title** và **Body** (gõ tiếng Việt thoải mái)
4. Bấm **"Send notification"**

---

### Cách B — curl (Terminal / Git Bash)

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "to": "ExponentPushToken[xxxxxxxxxx]",
    "title": "Test BI Portal",
    "body": "Thong bao test",
    "sound": "default",
    "badge": 1
  }'
```

---

### Cách C — PowerShell (Windows)

> ⚠️ PowerShell có thể bị lỗi encoding tiếng Việt. Dùng ASCII hoặc dùng Expo Dashboard thay thế.

```powershell
$bytes = [System.Text.Encoding]::UTF8.GetBytes('{"to":"ExponentPushToken[xxxxxxxxxx]","title":"Test BI Portal","body":"Test message","sound":"default","badge":1}')

Invoke-RestMethod `
  -Uri "https://exp.host/--/api/v2/push/send" `
  -Method POST `
  -ContentType "application/json; charset=utf-8" `
  -Body $bytes
```

---

### Cách D — Từ Backend Python (Production)

```python
import requests

def send_push_notification(token: str, title: str, body: str, report_stt: str = ""):
    payload = {
        "to": token,
        "title": title,
        "body": body,
        "sound": "default",
        "badge": 1,
        "data": {"report_stt": report_stt}
    }
    res = requests.post(
        "https://exp.host/--/api/v2/push/send",
        json=payload,
        headers={"Content-Type": "application/json; charset=utf-8"}
    )
    return res.json()
```

---

## 4. Gửi cho nhiều người cùng lúc (Batch — tối đa 100 tokens)

```json
[
  {
    "to": "ExponentPushToken[token_1]",
    "title": "Thong bao",
    "body": "Noi dung"
  },
  {
    "to": "ExponentPushToken[token_2]",
    "title": "Thong bao",
    "body": "Noi dung"
  }
]
```

---

## 5. Response thành công

```json
{
  "data": {
    "status": "ok",
    "id": "019f9450-9b06-70e9-xxxx-xxxxxxxxxxxx"
  }
}
```

`status = "ok"` → Expo đã nhận và đang chuyển đến thiết bị.

---

## 6. Notification không hiện trên Lock Screen — Kiểm tra

| Nguyên nhân | Cách fix |
|-------------|----------|
| App chưa được cấp quyền | iOS: **Cài đặt → BI Portal → Thông báo → Bật "Màn hình khóa"** |
| Đang bật Focus / DND | Tắt **Focus Mode** hoặc thêm app vào whitelist |
| Preview bị ẩn (iOS) | **Cài đặt → Thông báo → Hiển thị bản xem trước → Luôn luôn** |
| App đang foreground | Notification hiện dạng in-app banner, không lên lock screen |

---

## 7. Luồng test chuẩn

```
1. Khóa màn hình điện thoại
2. Gửi notification (ưu tiên dùng https://expo.dev/notifications)
3. Nhìn vào màn hình khóa ngay lập tức
4. Notification hiện → ✅ Thành công
5. Mở khóa → vào app → badge số giảm → ✅ Optimistic update đúng
```
