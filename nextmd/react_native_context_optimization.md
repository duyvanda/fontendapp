# Gợi ý tối ưu React Context (FeedbackContext)

Phần lớn các component trong React Native đều phụ thuộc vào `FeedbackContext` để lấy state. Nếu Context không được tối ưu tốt, nó sẽ trở thành "nút thắt cổ chai" gây ra hàng loạt các đợt re-render vô nghĩa (unnecessary re-renders) trên toàn bộ ứng dụng.

Dưới đây là các phương pháp tối ưu cực kỳ quan trọng cho `FeedbackContext.tsx` (và các Context khác trong app của bạn):

## 1. Tránh Re-render toàn bộ App bằng `useMemo`

Hiện tại, `value` truyền vào `FeedbackContext.Provider` là một object được khởi tạo lại mới hoàn toàn mỗi khi component `FeedbackProvider` chạy.
```javascript
// CODE CHƯA TỐI ƯU
return (
  <FeedbackContext.Provider value={{ user_info, reports, fetch_reports, ... }}>
    {children}
  </FeedbackContext.Provider>
);
```

> [!WARNING]
> Mọi component con gọi `useFeedback()` đều bị "ép" phải re-render mỗi khi một state bất kỳ bên trong Provider thay đổi, ngay cả khi component đó không hề dùng tới state bị đổi đó. 

**CÁCH TỐI ƯU:** Sử dụng `useMemo` để bọc toàn bộ object `value` lại. Object này chỉ được tạo mới khi một trong các dependencies thực sự thay đổi.

```javascript
// CODE ĐÃ TỐI ƯU
const contextValue = useMemo(() => ({
  user_info,
  user_hr_info,
  login_text,
  login_loading,
  reports,
  filter_reports,
  report_id,
  report_param,
  shared,
  loading,
  rp_screen,
  login_user,
  logout_user,
  fetch_reports,
  fetch_filter_reports,
  fetch_filter_reports_rt,
  clear_filter_report,
  toggle_favorite,
  user_logger,
  set_rp_screen,
  save_tags,
}), [
  user_info, user_hr_info, login_text, login_loading, reports, 
  filter_reports, report_id, report_param, shared, loading, rp_screen
]);

return (
  <FeedbackContext.Provider value={contextValue}>
    {children}
  </FeedbackContext.Provider>
);

Viewed FeedbackContext.tsx:115-132

Bạn hoàn toàn chính xác! `login_loading` đúng là chỉ xảy ra một lần lúc đăng nhập nên không đáng lo. 

Nhưng khi scan kỹ các state khác trong `FeedbackContext.tsx`, mình thấy có **2 trường hợp xảy ra rất thường xuyên** và chính là thủ phạm gây ra hiện tượng re-render diện rộng (unnecessary re-renders) trên toàn bộ App của bạn:

### 1. Khi người dùng xem Báo cáo (Click xem Report hoặc đổi Filter)
Mỗi khi người dùng bấm vào xem một báo cáo bất kỳ, hoặc tải một báo cáo Real-time, các hàm `fetch_filter_reports` và `fetch_filter_reports_rt` sẽ được kích hoạt. Hàng loạt state bị thay đổi liên tục:
- `loading` (nháy từ `false` -> `true` -> `false`)
- `shared` (nháy từ `true` -> `false` -> `true`)
- `report_id` (cập nhật ID mới)
- `report_param` (cập nhật chuỗi query mới)
- `filter_reports` (cập nhật object báo cáo mới)

**Hậu quả:** 
Bất kỳ Component nào gọi `useFeedback()` (dù chỉ để lấy `user_info` để hiển thị Avatar ở Header, hay lấy danh sách `reports` ở Sidebar) **đều sẽ bị ép re-render lại toàn bộ** mỗi khi cái spinner `loading` bật lên và tắt đi. Điều này làm app bị khựng hoặc chớp khung hình khi chuyển báo cáo.

### 2. Khi người dùng thả Tim (Favorite) hoặc đổi Tag
Trong hàm `toggle_favorite` và `save_tags`, bạn đang dùng kỹ thuật Optimistic Update:
```javascript
set_reports(prev => prev.map(...))
```
Mỗi khi người dùng chạm vào nút Trái tim, toàn bộ mảng `reports` được clone ra và cập nhật lại. 
**Hậu quả:** Ngay cả khi người dùng đang ở màn hình Chi tiết Báo cáo, chỉ bấm tim một cái, thì các component nằm tít ngoài màn hình Home hay Sidebar (đang trỏ tới mảng `reports` cũ) cũng sẽ bị kích hoạt re-render.

---

### Sự thật mất lòng về React Context
Cho dù bạn bọc `useMemo` cho cái `value` của Context, thì khi `loading` hoặc `reports` thay đổi, React bắt buộc vẫn phải tạo lại object `value` đó, và toàn bộ App vẫn sẽ bị re-render. React Context không có cơ chế "chỉ re-render những gì lấy ra dùng" (Selector).

**Giải pháp triệt để nếu app bị lag:**
Chẻ `FeedbackContext` khổng lồ này ra làm 2 (hoặc 3) Context nhỏ hơn:
1. **`AuthContext`**: Chứa `user_info`, `user_hr_info`, `login_user`... (Cái này cực ít khi đổi, component nào móc vào Auth sẽ nằm im cả ngày không bị re-render).
2. **`ReportsContext`**: Chứa mảng `reports`, `toggle_favorite`, `save_tags`.
3. **`UIContext`** (hoặc gộp chung): Chứa `loading`, `report_param`, `report_id` (Đây là những thứ đổi liên tục nhất mỗi khi lướt báo cáo).

Bằng cách chẻ nhỏ ra, khi `loading` nháy, chỉ những component nào gọi `useUIContext()` mới bị re-render, còn Header (gọi `AuthContext`) sẽ hoàn toàn đứng im. Bạn thấy hướng đi này có hợp lý với mô hình app hiện tại không?
```

---

## 2. Dùng `useCallback` cho các hàm hành động (Actions)

Các hàm như `login_user`, `fetch_reports`, `toggle_favorite` hiện tại đang được tạo mới lại mỗi lần render. Điều này làm cho `useMemo` ở bước trên bị vô hiệu hóa (vì tham chiếu hàm luôn thay đổi).

**CÁCH TỐI ƯU:** Bọc các hàm này bằng `useCallback`.

```javascript
const login_user = useCallback(async (logindata) => {
  // logic...
}, []); // dependency rỗng nếu không phụ thuộc state bên ngoài

const toggle_favorite = useCallback(async (report: Report) => {
  // logic...
}, [user_info]); // Phụ thuộc vào user_info.manv
```

---

## 3. Đưa các hàm Helper (tiện ích) ra ngoài Component

Các hàm không phụ thuộc vào React state hoặc props, ví dụ như `parse_tags` (hiện đang nằm lồng bên trong `fetch_reports`), nên được cắt và đưa ra ngoài cùng của file.

> [!TIP]
> Việc đưa các helper function ra ngoài scope của Component giúp tiết kiệm bộ nhớ, vì Javascript không phải cấp phát và định nghĩa lại hàm đó ở mỗi chu kỳ render.

```javascript
// Đưa hàm này ra ngoài cùng file, dưới các dòng import
const parse_tags = (tagsVal: any): string[] => {
  if (!tagsVal) return [];
  if (Array.isArray(tagsVal)) return tagsVal;
  if (typeof tagsVal === 'string') {
    try {
      const parsed = JSON.parse(tagsVal);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};
```

Khi kết hợp 3 phương pháp trên, `FeedbackContext` của bạn sẽ được tối ưu hoàn hảo, giảm tải đáng kể cho CPU của điện thoại và khắc phục tình trạng giật lag màn hình khi thay đổi State.
