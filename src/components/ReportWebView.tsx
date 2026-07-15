import { colors, globalStyles } from '@/styles/global';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

interface ReportWebViewProps {
  uri: string;
}

const ZOOM_MIN = 1.0;
const ZOOM_MAX = 2.0;
const BTN_PANEL_W = 38;
const BTN_PANEL_H = 38;

// Tạo HTML wrapper chứa iframe
function make_html(looker_url: string): string {
  const safe_url = looker_url.replace(/"/g, '%22');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;background:#fff;overflow:hidden}
    iframe{width:100%;height:100%;border:none;display:block}
  </style>
  <script>
    // Chặn pinch zoom mặc định của WebKit
    var _b=function(e){e.preventDefault();e.stopPropagation();};
    document.addEventListener('gesturestart',_b,{passive:false});
    document.addEventListener('gesturechange',_b,{passive:false});
    document.addEventListener('gestureend',_b,{passive:false});
    document.addEventListener('touchmove',function(e){if(e.touches&&e.touches.length>1)_b(e);},{passive:false});

    // Inject CSS và ẩn footer trong iframe (cùng origin nhờ baseUrl)
    window.addEventListener('DOMContentLoaded', function() {
      var iframe = document.querySelector('iframe');
      if (!iframe) return;

      function injectCSS() {
        try {
          var doc = iframe.contentDocument || iframe.contentWindow.document;
          if (!doc) return;
          if (doc.getElementById('custom-hide-css')) return;
          var s = doc.createElement('style');
          s.id = 'custom-hide-css';
          s.innerHTML = [
            '.embed-footer,.embedFooter,[class*="embedFooter"],[class*="embed-footer"],.embedFooterContainer,.branding,.google-logo,.report-footer,',
            '.branding-info,a[href*="datastudio.google.com"],a[href*="lookerstudio.google.com"],a[href*="15683626"],a[href*="looker-studio/answer"],a[href*="abuse"],a[href*="report_abuse"],.branding-info ~ div,a[href*="15683626"] ~ div',
            '{display:none!important;pointer-events:none!important;height:0!important;width:0!important;opacity:0!important}',
            '.embed-navigation-bar,.embed-header,[class*="embedHeader"],[class*="embed-header"],[class*="navigation-bar"],[class*="navigationBar"]{min-height:48px!important;height:auto!important;padding:6px!important}',
            '[class*="navigation"] button,[class*="navigation"] [role="button"],[class*="header"] button{transform:scale(1.2)!important;transform-origin:center!important}'
          ].join('');
          (doc.head || doc.documentElement).appendChild(s);
        } catch(e) {}
      }

      function setupClickBlocker(doc) {
        if (!doc) return;
        var blockerId = 'click-blocker-listener';
        if (doc[blockerId]) return;
        doc[blockerId] = true;

        function handler(e) {
          var target = e.target;
          while (target && target !== doc.body) {
            if (target.tagName && target.tagName.toUpperCase() === 'NG2-VISUAL-CONTAINER') {
              // Cho phép click vào bộ lọc (dropdown, bộ chọn...) để người dùng chọn thông số
              if (target.querySelector('.input-control') || target.querySelector('ng2-filter-control') || target.innerHTML.indexOf('input-control') !== -1) {
                return;
              }
              // Chặn đứng sự kiện click ở capture phase để Looker không nhận được tiêu điểm mở menu/phễu
              e.stopPropagation();
              break;
            }
            target = target.parentElement;
          }
        }

        doc.addEventListener('click', handler, true);
        doc.addEventListener('mousedown', handler, true);
        doc.addEventListener('mouseup', handler, true);
      }

      function hide_privacy(root) {
        if (!root) return;

        // Nếu là document (nodeType === 9), cài đặt bộ chặn click
        if (root.nodeType === 9) {
          setupClickBlocker(root);
        }

        ['.embed-footer','.embedFooter','.embedFooterContainer','.branding','.google-logo','.report-footer','[class*="embedFooter"]','[class*="embed-footer"]','[class*="branding"]','[class*="google-logo"]','[class*="report-footer"]','.logo-container',
         '.branding-info','a[href*="datastudio.google.com"]','a[href*="lookerstudio.google.com"]','a[href*="15683626"]','a[href*="looker-studio/answer"]','a[href*="abuse"]','a[href*="report_abuse"]'
        ].forEach(function(sel) {
          try {
            var els = root.querySelectorAll(sel);
            for (var i=0;i<els.length;i++){
              els[i].style.setProperty('display','none','important');
              els[i].style.setProperty('height','0','important');
              els[i].style.setProperty('width','0','important');
              els[i].style.setProperty('opacity','0','important');
              els[i].style.setProperty('pointer-events','none','important');
            }
          } catch(e){}
        });

        // Ẩn triệt để liên kết và toàn bộ khung chứa Quyền riêng tư/Điều khoản/Lạm dụng
        try {
          var fls = root.querySelectorAll('a[href*="15683626"], a[href*="looker-studio/answer"], a[href*="abuse"], a[href*="report_abuse"], a[href*="privacy"], a[href*="terms"]');
          for (var k = 0; k < fls.length; k++) {
            var a = fls[k];
            a.style.setProperty('display', 'none', 'important');
            a.style.setProperty('height', '0', 'important');
            a.style.setProperty('opacity', '0', 'important');
            
            // Ẩn cha trực tiếp
            var p = a.parentElement;
            if (p) {
              p.style.setProperty('display', 'none', 'important');
              p.style.setProperty('height', '0', 'important');
              p.style.setProperty('opacity', '0', 'important');
              
              // Ẩn ông nội để mất toàn bộ dòng text/separator
              var gp = p.parentElement;
              if (gp) {
                gp.style.setProperty('display', 'none', 'important');
                gp.style.setProperty('height', '0', 'important');
                gp.style.setProperty('opacity', '0', 'important');
                
                // Ẩn tiếp cụ nếu là thanh footer dẹt dưới đáy
                var ggp = gp.parentElement;
                if (ggp && (ggp.offsetHeight < 80 || ggp.className.toLowerCase().indexOf('footer') !== -1)) {
                  ggp.style.setProperty('display', 'none', 'important');
                  ggp.style.setProperty('height', '0', 'important');
                  ggp.style.setProperty('opacity', '0', 'important');
                }
              }
            }
          }
        } catch(e){}

        var all = root.querySelectorAll ? root.querySelectorAll('*') : [];
        for (var i=0;i<all.length;i++){
          var el=all[i]; if(el.style&&el.style.display==='none') continue;
          var t=''; if(el.childNodes){for(var c=0;c<el.childNodes.length;c++){if(el.childNodes[c].nodeType===3)t+=el.childNodes[c].textContent;}}
          t=t.trim().toLowerCase();
          if(t.length>0&&t.length<60&&(t.indexOf('quyền riêng tư')!==-1||t.indexOf('chính sách')!==-1||t.indexOf('điều khoản')!==-1||t.indexOf('privacy')!==-1||t.indexOf('terms')!==-1||t.indexOf('data studio')!==-1||t.indexOf('looker studio')!==-1||t.indexOf('báo cáo vi phạm')!==-1||t.indexOf('report abuse')!==-1)){
            el.style.setProperty('display','none','important');el.style.setProperty('height','0','important');el.style.setProperty('opacity','0','important');
            var p=el.parentElement; if(p){p.style.setProperty('display','none','important');var gp=p.parentElement;if(gp&&(gp.offsetHeight<80||gp.className.toLowerCase().indexOf('footer')!==-1)){gp.style.setProperty('display','none','important');}}
          }
          if(el.shadowRoot) hide_privacy(el.shadowRoot);
        }
      }

      function runScan() {
        injectCSS();
        try {
          var doc = iframe.contentDocument || iframe.contentWindow.document;
          if (doc) hide_privacy(doc);
        } catch(e) {}
      }

      iframe.onload = runScan;
      setInterval(runScan, 300);
    });
  <\/script>
</head>
<body>
  <iframe
    src="${safe_url}"
    allowfullscreen
  ></iframe>
</body>
</html>`;
}

export default function ReportWebView({ uri }: ReportWebViewProps) {
  const [webview_loaded, set_webview_loaded] = useState(false);
  const [webview_key, set_webview_key] = useState(0);
  const [zoom_level, set_zoom_level] = useState(ZOOM_MIN);

  const webview_ref = useRef<WebView>(null);
  const capture_view_ref = useRef<View>(null);
  
  const overlay_opacity = useRef(new Animated.Value(1)).current;
  const bar_width = useRef(new Animated.Value(0)).current;
  const pulse_anim = useRef(new Animated.Value(0.3)).current;
  const screen_w = Dimensions.get('window').width;
  const screen_h = Dimensions.get('window').height;

  // Native UIView scale
  const native_scale = useSharedValue(ZOOM_MIN);

  // Tâm của cử chỉ zoom theo ngón tay (mặc định ở tâm màn hình)
  const pinch_focal_x = useSharedValue(screen_w / 2);
  const pinch_focal_y = useSharedValue(screen_h / 2);

  // Native scale control via 2-finger pinch (pinch & pan đồng thời)
  const saved_scale = useSharedValue(ZOOM_MIN);
  const manual_pan_x = useSharedValue(0);
  const manual_pan_y = useSharedValue(0);
  const pinch_start_x = useSharedValue(0);
  const pinch_start_y = useSharedValue(0);

  const pinch_gesture = Gesture.Pinch()
    .onStart((e) => {
      saved_scale.value = native_scale.value;
      pinch_focal_x.value = e.focalX;
      pinch_focal_y.value = e.focalY;
      // Lưu lại toạ độ pan ban đầu trước khi bắt đầu cử chỉ kéo mới
      pinch_start_x.value = manual_pan_x.value;
      pinch_start_y.value = manual_pan_y.value;
    })
    .onUpdate((e) => {
      const next = saved_scale.value * e.scale;
      native_scale.value = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, next));

      // Lượng dịch chuyển tay kéo (pan) từ lúc chạm ngón tay
      const dx = e.focalX - pinch_focal_x.value;
      const dy = e.focalY - pinch_focal_y.value;

      const s = native_scale.value;
      if (s > 1.01) {
        // Giới hạn biên pan theo tỉ lệ zoom hiện tại để tránh report bị lệch ra ngoài màn hình
        const max_tx = ((s - 1) * screen_w) / 2;
        const max_ty = ((s - 1) * screen_h) / 2;
        manual_pan_x.value = Math.max(-max_tx, Math.min(max_tx, pinch_start_x.value + dx));
        manual_pan_y.value = Math.max(-max_ty, Math.min(max_ty, pinch_start_y.value + dy));
      } else {
        manual_pan_x.value = withSpring(0);
        manual_pan_y.value = withSpring(0);
      }
    })
    .onEnd(() => {
      if (native_scale.value <= 1.01) {
        native_scale.value = withSpring(ZOOM_MIN);
        manual_pan_x.value = withSpring(0);
        manual_pan_y.value = withSpring(0);
      }
      runOnJS(set_zoom_level)(native_scale.value);
    });

  // Cử chỉ kéo rê 1 ngón để dịch chuyển (pan) vùng nhìn khi đang ở trạng thái zoom
  const pan_view_gesture = Gesture.Pan()
    .enabled(zoom_level > 1.01) // Chỉ bật kéo 1 ngón khi đang zoom > 100%
    .onStart(() => {
      pinch_start_x.value = manual_pan_x.value;
      pinch_start_y.value = manual_pan_y.value;
    })
    .onUpdate((e) => {
      const s = native_scale.value;
      if (s > 1.01) {
        const max_tx = ((s - 1) * screen_w) / 2;
        const max_ty = ((s - 1) * screen_h) / 2;
        manual_pan_x.value = Math.max(-max_tx, Math.min(max_tx, pinch_start_x.value + e.translationX));
        manual_pan_y.value = Math.max(-max_ty, Math.min(max_ty, pinch_start_y.value + e.translationY));
      }
    });

  const composed_gesture = Gesture.Simultaneous(pinch_gesture, pan_view_gesture);

  // Vị trí panel nút chụp màn hình (kéo thả được)
  const btn_x = useSharedValue(screen_w - BTN_PANEL_W - 12);
  const btn_y = useSharedValue(screen_h / 2 - BTN_PANEL_H / 2);
  const drag_start_x = useSharedValue(0);
  const drag_start_y = useSharedValue(0);

  const pan_gesture = Gesture.Pan()
    .onStart(() => {
      drag_start_x.value = btn_x.value;
      drag_start_y.value = btn_y.value;
    })
    .onUpdate((e) => {
      btn_x.value = Math.max(4, Math.min(screen_w - BTN_PANEL_W - 4, drag_start_x.value + e.translationX));
      btn_y.value = Math.max(4, Math.min(screen_h - BTN_PANEL_H - 60, drag_start_y.value + e.translationY));
    });

  // Scale transform dựa trên điểm chạm thực tế của 2 ngón tay và lượng kéo tay (pan)
  const animated_container_style = useAnimatedStyle(() => {
    const s = native_scale.value;
    const ox = pinch_focal_x.value - screen_w / 2;
    const oy = pinch_focal_y.value - screen_h / 2;
    const tx = manual_pan_x.value;
    const ty = manual_pan_y.value;

    return {
      flex: 1,
      transform: [
        // 1. Dịch chuyển origin về điểm chạm (focal point) để scale chính xác vị trí ngón tay
        { translateX: ox }, { translateY: oy },
        // 2. Thực hiện scale WebView
        { scale: s },
        // 3. Trả lại vị trí dịch chuyển của focal point
        { translateX: -ox }, { translateY: -oy },
        // 4. Áp dụng lượng dịch chuyển kéo tay (panning) ở hệ toạ độ 1:1 màn hình
        { translateX: tx }, { translateY: ty },
      ],
    };
  });

  // HUD % Zoom hiển thị ở giữa phía trên màn hình. Zoom to và tắt mở cực mượt bằng spring.
  const badge_style = useAnimatedStyle(() => {
    const is_zoomed = native_scale.value > 1.01;
    return {
      opacity: withSpring(is_zoomed ? 1 : 0, { damping: 15 }),
      transform: [
        { scale: withSpring(is_zoomed ? 1.25 : 0.6, { damping: 12, stiffness: 130 }) },
      ],
    };
  });

  const btn_panel_style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: btn_x.value,
    top: btn_y.value,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    width: BTN_PANEL_W,
    height: BTN_PANEL_H,
  }));

  const handle_screenshot = async () => {
    try {
      if (!capture_view_ref.current) return;
      const file_uri = await captureRef(capture_view_ref, {
        format: 'png',
        quality: 0.95,
      });
      await Sharing.shareAsync(file_uri);
    } catch (e) {
      console.error('Screenshot capture failed:', e);
    }
  };

  useEffect(() => {
    Animated.timing(bar_width, { toValue: 85, duration: 8000, useNativeDriver: false }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse_anim, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse_anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handle_load_end = () => {
    set_webview_loaded(true);
    Animated.timing(bar_width, { toValue: 100, duration: 300, useNativeDriver: false }).start(() => {
      Animated.timing(overlay_opacity, { toValue: 0, duration: 500, useNativeDriver: true }).start();
    });
  };

  const base_url = 'https://lookerstudio.google.com';
  const normalized_uri = uri.replace('datastudio.google.com', 'lookerstudio.google.com');
  const html_source = make_html(normalized_uri);

  return (
    <View style={globalStyles.screen}>
      {Platform.OS === 'web' ? (
        <iframe
          src={uri}
          style={{ flex: 1, width: '100%', height: '100%', border: 'none' } as any}
          onLoad={handle_load_end}
        />
      ) : (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GestureDetector gesture={composed_gesture}>
            <View ref={capture_view_ref} collapsable={false} style={{ flex: 1, overflow: 'hidden' }}>
              <Reanimated.View style={animated_container_style}>
                <WebView
                  ref={webview_ref}
                  key={webview_key}
                  source={{ html: html_source, baseUrl: base_url }}
                  onLoadEnd={handle_load_end}
                  style={{ flex: 1 }}
                  userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  renderLoading={() => <View />}
                  scalesPageToFit={false}
                  originWhitelist={['*']}
                  allowsInlineMediaPlayback={true}
                  onContentProcessDidTerminate={() => {
                    set_webview_key((k) => k + 1);
                    set_webview_loaded(false);
                  }}
                />
                {Platform.OS === 'ios' && (
                  <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, backgroundColor: '#ffffff', zIndex: 5 }} />
                )}
              </Reanimated.View>
            </View>
          </GestureDetector>

          {/* HUD % Zoom nổi ở phía trên chính giữa màn hình */}
          {webview_loaded && (
            <Reanimated.View pointerEvents="none" style={[badge_style, {
              position: 'absolute',
              top: 28,
              alignSelf: 'center',
              backgroundColor: 'rgba(0,0,0,0.76)',
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 16,
              zIndex: 30,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5
            }]}>
              <Ionicons name="search" size={13} color="#fff" style={{ marginRight: 4 }} />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>
                {Math.round(zoom_level * 100)}%
              </Text>
            </Reanimated.View>
          )}

          {/* Panel nút tiện ích Chụp màn hình (kéo thả được) */}
          {webview_loaded && (
            <GestureDetector gesture={pan_gesture}>
              <Reanimated.View style={btn_panel_style}>
                <TouchableOpacity
                  onPress={handle_screenshot}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3,
                    elevation: 4,
                  }}
                >
                  <Ionicons name="camera" size={19} color="#fff" />
                </TouchableOpacity>
              </Reanimated.View>
            </GestureDetector>
          )}
        </GestureHandlerRootView>
      )}

      {/* Loading skeleton */}
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#f5f5f5', opacity: overlay_opacity, zIndex: 10 }}>
        <View style={{ height: 3, backgroundColor: '#e0e0e0', width: '100%' }}>
          <Animated.View style={{ height: 3, backgroundColor: colors.primary, width: bar_width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />
        </View>
        <View style={{ padding: 16 }}>
          <Animated.View style={{ opacity: pulse_anim, height: 20, width: '60%', backgroundColor: '#ddd', borderRadius: 6 }} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {[38, 28, 33, 22].map((w, i) => (
              <Animated.View key={i} style={{ opacity: pulse_anim, height: 28, width: `${w}%` as any, backgroundColor: '#e0e0e0', borderRadius: 20 }} />
            ))}
          </View>
          <Animated.View style={{ opacity: pulse_anim, height: 180, backgroundColor: '#e8e8e8', borderRadius: 8, marginTop: 16 }} />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Animated.View style={{ opacity: pulse_anim, flex: 1, height: 110, backgroundColor: '#e0e0e0', borderRadius: 8 }} />
            <Animated.View style={{ opacity: pulse_anim, flex: 1, height: 110, backgroundColor: '#e0e0e0', borderRadius: 8 }} />
          </View>
          <Animated.View style={{ opacity: pulse_anim, height: 130, backgroundColor: '#e8e8e8', borderRadius: 8, marginTop: 12 }} />
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: '#bbb', fontSize: 12 }}>Đang tải dữ liệu báo cáo...</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
