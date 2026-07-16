# 🍎 Apple App Store — Các bước còn lại

> Tất cả code changes đã hoàn thành. Dưới đây là các bước **thủ công** cần làm trước khi submit.

---

## ⚠️ LƯU Ý SỐNG CÒN ĐỂ ĐƯỢC DUYỆT APP (Đọc kỹ)

### 1. Phân quyền Báo cáo Looker Studio cho Demo Account
- **Vấn đề:** Reviewer dùng tài khoản demo `DEMO_APPLE` đăng nhập. Khi bấm xem các báo cáo nhúng (Looker Studio), nếu link bắt đăng nhập Google hoặc hiện thông báo "Không có quyền truy cập", Apple sẽ **reject ngay lập tức (Guideline 2.1)**.
- **Giải pháp:** Cấu hình các báo cáo hiển thị cho tài khoản `DEMO_APPLE` trên PostgreSQL là các link báo cáo Looker **đã được set Public** (Anyone with the link can view) hoặc nhúng qua Service Account/Embed Token để người kiểm duyệt mở là xem được biểu đồ ngay lập tức mà không cần đăng nhập Google.

### 2. Quay Video Demo dự phòng (Bảo hiểm 100%)
- **Cách làm:** Quay một video màn hình (Screen Recording) đầy đủ luồng đi của app (Login -> Xem báo cáo nhúng & native -> Chat với BIRA AI -> Đăng ký KPI/Listing -> Vào Account -> Xóa tài khoản).
- **Mục đích:** Host video lên Google Drive (Public) hoặc Youtube (Không công khai) và đính kèm link vào mục **Review Notes** trên App Store Connect kèm ghi chú: `"In case of any connectivity issues with private analytical servers, please refer to this screen recording demonstrating the core flow: [LINK]"`. Đây là bí quyết giúp app hybrid/nội bộ được duyệt cực nhanh.

### 3. Tài khoản Developer cá nhân vs Doanh nghiệp (Guideline 5.2.1)
- **Vấn đề:** Nếu submit bằng tài khoản Apple cá nhân nhưng app chứa logo/tên công ty `Merap`, Apple sẽ **Hold** app vì nghi ngờ vi phạm bản quyền thương hiệu.
- **Giải pháp:** Submit bằng tài khoản Organization (Doanh nghiệp) của công ty là an toàn nhất.

### 4. Ẩn chữ "Beta", "Test" trên giao diện
- Apple cấm các từ liên quan đến thử nghiệm hiển thị trên UI chính của app Store. Hãy đảm bảo build production không hiển thị các chữ như "Beta version", "Test Mode".

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

- Tạo tài khoản test với Mã tổ chức (Organization Code): `demo`, Tên đăng nhập: `DEMO_APPLE`, Mật khẩu: `Demo@12345`
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
- Organization Code: demo
- Username: DEMO_APPLE
- Password: Demo@12345

ABOUT THIS APP:
BI Portal is a B2B analytics platform serving multiple independent 
business partners and distributors, each with their own provisioned 
account and permissioned data — similar to standard B2B SaaS platforms 
(e.g., CRM or analytics tools).

Accounts are provisioned by administrators — self-registration is 
intentionally disabled, as accounts are tied to verified business 
relationships (B2B SaaS model, not a consumer app).

KEY SCREENS TO TEST:
1. HOME: Search and browse assigned reports.
2. NATIVE REPORTS (recommended to test first): On the Home screen, tap 
   "CRM Overall Dashboard" or "Delivery Performance" to view fully 
   native, high-performance charts and interactions.
3. BIRA: AI chat assistant (tap the BIRA tab). Supports natural-language 
   queries about business metrics, and can attach photos/documents via 
   the camera and photo library (used for attaching business documents 
   to chat, not for social/media sharing).
4. NOTIFICATIONS: Smart business alerts (KPI drops, deadlines, anomalies).
5. ACCOUNT & DELETION: Tap the User Pill (top right of Home header) to 
   open Account settings, where the Account Deletion feature is located.

NOTE ON EMBEDDED REPORTS:
The app includes fully native dashboards as primary experience.
Embedded views are used only for legacy or specialized analytics.

USER-GENERATED CONTENT:
The app does not provide any public content sharing or social features. 
All uploaded images/documents are private and used strictly within 
business workflows (e.g., attaching documents to AI chat for analysis).

PERMISSIONS USAGE:
- Camera & Photo Library: Used only to capture or attach business-related 
  documents/images to AI chat for analysis. No social sharing or public posting.

REQUIREMENTS:
- Internet connection is required for AI processing and data synchronization.

MONETIZATION:
This app does not include in-app purchases or payment features.

In case of any connectivity issues with private analytical servers, 
please refer to this screen recording demonstrating the core flow:
https://youtube.com/your-demo-link
```

---

## ⚠️ Lưu ý quan trọng về Bản quyền & Sở hữu (Guideline 5.2.1)

Nếu bạn dùng tài khoản Developer cá nhân để upload app có chứa logo/thương hiệu riêng của công ty (`Meraplion`, `Merap`, v.v. - không bao gồm thuật ngữ công nghệ chung như `BI` hay `BIRA`), Apple có khả năng cao sẽ giữ lại (Hold) hoặc Reject với lý do **vi phạm bản quyền**.

**Cách xử lý:**
- Tốt nhất là đăng ký tài khoản Developer dưới dạng **Organization / Enterprise** của chính công ty.
- Nếu bắt buộc dùng account cá nhân, hãy chuẩn bị sẵn giấy uỷ quyền sử dụng thương hiệu từ phía công ty để nộp khi Apple yêu cầu.


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
