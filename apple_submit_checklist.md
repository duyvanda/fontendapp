# 🍎 Apple App Store — Các bước còn lại

> Tất cả code changes đã hoàn thành. Dưới đây là các bước **thủ công** cần làm trước khi submit.

---

## 1. Chạy SQL trên PostgreSQL

Chạy file `delete_account_sql.sql` trên database production.

> ⚠️ Kiểm tra `search_path` của connection PostgreSQL. Nếu `search_path` không có `bi_schema`, đổi `bi_schema.` thành `public.` trong file SQL.

---

## 2. Host Privacy Policy URL

Apple yêu cầu 1 trang web **public** (không cần login) chứa chính sách bảo mật.

**Cách làm:** Tạo 1 file HTML tĩnh trên server `bi.meraplion.com`:

```
https://bi.meraplion.com/privacy-policy
```

Nội dung copy từ `src/app/terms.tsx` là đủ — không cần design đẹp.

---

## 3. Đảm bảo demo account cho Apple reviewer

- Tạo 1 tài khoản test, ví dụ: `DEMO_APPLE` / `Demo@123`
- Phải có `show_cloud_assist = true` để BIRA hoạt động
- Phải có ít nhất vài báo cáo được phân quyền
- Phải có ít nhất 1-2 thông báo trong tab Notifications

---

## 4. Đăng ký Apple Developer (nếu chưa có)

- Đăng ký tại https://developer.apple.com ($99/năm)
- Tạo App ID với bundle: `com.duyvanda.biportal`
- Tạo Provisioning Profile cho Distribution

---

## 5. Build iOS

```bash
eas build --profile preview --platform ios
```

> ⚠️ Lần đầu build iOS sẽ cần Apple Developer credentials.

---

## 6. Chuẩn bị trên App Store Connect

### 6.1 Screenshots (bắt buộc)
- **6.7" iPhone** (iPhone 15 Pro Max): ít nhất 3 ảnh
- **6.5" iPhone** (iPhone 11 Pro Max): ít nhất 3 ảnh  
- **12.9" iPad** (nếu `supportsTablet: true`): ít nhất 3 ảnh

Chụp các màn hình: Login → Home → BIRA Chat → Notifications → Account

### 6.2 App Information
| Field | Giá trị |
|---|---|
| App Name | BI Portal |
| Subtitle | Business Intelligence & AI Assistant |
| Category | Business (Primary), Productivity (Secondary) |
| Privacy Policy URL | `https://bi.meraplion.com/privacy-policy` |
| Age Rating | 4+ |

### 6.3 Description (tiếng Anh)
```
BI Portal is a B2B analytics platform for businesses, 
distributors, and authorized partners.

Key Features:
• Interactive business reports and KPI dashboards
• BIRA — AI-powered assistant for querying business 
  metrics through natural language
• Smart notifications for KPI drops, deadlines, and 
  data anomalies
• Integrated business tools and utilities
• Favorites and workspace organization

Accounts are provisioned by organization administrators.
```

### 6.4 Review Notes
```
DEMO ACCOUNT:
- Username: DEMO_APPLE
- Password: Demo@123

ABOUT THIS APP:
BI Portal is a B2B analytics platform for pharmaceutical 
distributors and business partners. 

Accounts are provisioned by organization administrators — 
no self-registration by design (B2B SaaS model).

KEY SCREENS TO TEST:
1. HOME: Search and browse assigned reports
2. BIRA: AI chat assistant (tap the BIRA tab)
3. NOTIFICATIONS: Smart business alerts
4. ACCOUNT: User profile, terms, and account deletion
```

---

## 7. Submit for Review

1. Upload build từ EAS hoặc Transporter
2. Điền đầy đủ metadata ở bước 6
3. Chọn **"Manually release this version"** (để kiểm tra trước khi release)
4. Submit for Review

---

## ✅ Checklist cuối cùng

- [ ] SQL `delete_user_account` đã chạy trên PostgreSQL
- [ ] Privacy Policy URL đã host public
- [ ] Demo account hoạt động + BIRA bật
- [ ] Apple Developer account active
- [ ] iOS build thành công
- [ ] Screenshots đã chụp (iPhone + iPad)
- [ ] App description + Review Notes đã điền
- [ ] Submit for Review
