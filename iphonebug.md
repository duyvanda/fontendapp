Nhìn ảnh thì đúng là 2 nút (camera + xoay màn hình) đang bị lùi vào trong, cách mép phải một khoảng trống khá rõ, chứ không dính sát viền phải như kiểu TikTok mong muốn. Điều này khớp với chẩn đoán ở trên: `right_guard` đang được tính dựa trên `insets.right` bị "cũ" (giá trị portrait) tại thời điểm effect chạy để set `btn_x`.

Cụ thể hơn với trường hợp trong ảnh:

```js
const right_guard = is_real_landscape
  ? (Math.max(insets.right, Platform.OS === 'android' ? 48 : 24) + 12)
  : (insets.right + 12);
```

Trên iPhone không có notch/Dynamic Island (như iPhone SE, hoặc kể cả có notch nhưng tuỳ hướng xoay trái/phải), `insets.right` ở landscape thường = **0**, nên `right_guard` sẽ fallback về `Math.max(0, 24) + 12 = 36`. Nhưng khoảng cách trong ảnh nhìn có vẻ **lớn hơn 36px nhiều** — điều này gợi ý một trong 2 khả năng:

**Khả năng 1: `screen_w` chưa cập nhật kịp khi effect chạy**

```js
useEffect(() => {
  btn_x.value = screen_w - BTN_PANEL_W - right_guard;
  ...
}, [screen_w, screen_h, bottom_guard, right_guard, top_guard]);
```

Nếu `screen_w` lúc effect này chạy vẫn đang là chiều rộng **portrait** (vì `useWindowDimensions()` trên iOS đôi khi bắn callback update *trước* khi `ScreenOrientation.lockAsync` thực sự xoay xong native view), thì `btn_x` bị tính theo `screen_w` nhỏ hơn thực tế → nút bị đẩy vào trong so với mép phải thật.

**Khả năng 2: đang dùng nhầm `right_guard` không đồng bộ với thời điểm xoay**

Vì `handle_toggle_orientation` gọi `lockAsync` **bất đồng bộ (await)**, nhưng `set_is_landscape` / `on_orientation_change` chỉ chạy *sau khi* awaited xong — trong khi `useWindowDimensions` hook lại tự động re-render theo sự kiện xoay vật lý riêng, độc lập với state `is_landscape` của bạn. Hai nguồn "biết mình đang landscape" (state cục bộ `is_landscape` vs. `screen_w > screen_h` thực tế) có thể lệch pha nhau vài frame, khiến `is_real_landscape` sai thời điểm đó, kéo theo `right_guard` tính sai công thức (dùng nhánh portrait thay vì landscape).

### Cách sửa đề xuất — buộc tính lại vị trí nút *sau khi* xoay xong hẳn

```js
const handle_toggle_orientation = async () => {
  try {
    const next_landscape = !is_landscape;

    native_scale.value = withSpring(ZOOM_MIN);
    manual_pan_x.value = withSpring(0);
    manual_pan_y.value = withSpring(0);
    set_zoom_level(ZOOM_MIN);

    if (is_landscape) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }

    set_is_landscape(next_landscape);
    on_orientation_change?.(next_landscape);

    // Đợi native view + insets + dimensions ổn định hẳn rồi mới chốt lại vị trí nút
    requestAnimationFrame(() => {
      setTimeout(() => {
        const w = Dimensions.get('window').width;
        const h = Dimensions.get('window').height;
        btn_x.value = withSpring(w - BTN_PANEL_W - right_guard);
        btn_y.value = withSpring(
          Math.max(top_guard, Math.min(h - BTN_PANEL_H - bottom_guard, btn_y.value))
        );
      }, 250); // thời gian animation xoay của iOS thường ~250-400ms
    });
  } catch (e) {
    console.error('Failed to change screen orientation:', e);
  }
};
```

Lưu ý: dùng `Dimensions.get('window')` trực tiếp tại thời điểm `setTimeout` chạy (thay vì closure `screen_w`/`screen_h` cũ từ `useWindowDimensions()` lúc hàm được tạo) để chắc chắn lấy đúng kích thước **sau khi** xoay xong, tránh bug do closure giữ giá trị stale.

Nếu sau khi thêm đoạn này mà vẫn lệch, bạn thử log ra để xác nhận chính xác giá trị nào sai tại đúng thời điểm nút bị lệch:

```js
console.log('DEBUG', { screen_w, screen_h, insets, right_guard, btn_x: btn_x.value });
```

đặt ngay trong effect đồng bộ vị trí nút, rồi so sánh với số liệu thực tế trên ảnh chụp để biết chính xác là do `screen_w` sai hay `insets.right` sai.