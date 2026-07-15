import { colors, globalStyles } from '@/styles/global';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Reanimated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { WebView } from 'react-native-webview';

interface ReportWebViewProps {
  uri: string;
}

const ZOOM_MIN = 1.0;
const ZOOM_MAX = 1.5;
const ZOOM_STEP = 0.1;
const BTN_PANEL_W = 48;
const BTN_PANEL_H = 110;

// Tạo HTML wrapper chứa iframe — y chang cách web (frontend1) embed Looker.
// Outer page dùng device-width/1:1 → Looker trong iframe render đúng mobile nav.
// Pinch zoom bị chặn ở outer page JS.
function make_html(looker_url: string): string {
  // Thay thế các dấu nháy kép bằng %22 để tránh làm gãy thuộc tính src của iframe
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
    // Chặn pinch zoom ở outer page
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
            '.embed-footer,.embedFooter,[class*="embedFooter"],[class*="embed-footer"],.embedFooterContainer,.branding,.google-logo,.report-footer,.ng2-chart-menu-button,.view-applied-filters-button,[data-mat-icon-name="more_vert"],[data-mat-icon-name="filter_list"]{display:none!important;pointer-events:none!important;height:0!important;opacity:0!important}',
            '.embed-navigation-bar,.embed-header,[class*="embedHeader"],[class*="embed-header"],[class*="navigation-bar"],[class*="navigationBar"]{min-height:48px!important;height:auto!important;padding:6px!important}',
            '[class*="navigation"] button,[class*="navigation"] [role="button"],[class*="header"] button{transform:scale(1.2)!important;transform-origin:center!important}'
          ].join('');
          (doc.head || doc.documentElement).appendChild(s);
        } catch(e) {}
      }

      function hide_privacy(root) {
        if (!root) return;
        ['.embed-footer','.embedFooter','.embedFooterContainer','.branding','.google-logo','.report-footer','[class*="embedFooter"]','[class*="embed-footer"]','[class*="branding"]','[class*="google-logo"]','[class*="report-footer"]','.logo-container'].forEach(function(sel) {
          try { var els = root.querySelectorAll(sel); for (var i=0;i<els.length;i++){els[i].style.setProperty('display','none','important');els[i].style.setProperty('height','0','important');els[i].style.setProperty('opacity','0','important');} } catch(e){}
        });
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
      setInterval(runScan, 1000);
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
  const overlay_opacity = useRef(new Animated.Value(1)).current;
  const bar_width = useRef(new Animated.Value(0)).current;
  const pulse_anim = useRef(new Animated.Value(0.3)).current;
  const screen_w = Dimensions.get('window').width;
  const screen_h = Dimensions.get('window').height;

  // Native UIView scale — no WebKit re-render, no crash
  const native_scale = useSharedValue(ZOOM_MIN);

  // Panel nút zoom — kéo thả được
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

  // Scale transform từ vị trí panel
  const animated_container_style = useAnimatedStyle(() => {
    const s = native_scale.value;
    const ox = btn_x.value + BTN_PANEL_W / 2 - screen_w / 2;
    const oy = btn_y.value + BTN_PANEL_H / 2 - screen_h / 2;
    return {
      flex: 1,
      transform: [
        { translateX: ox }, { translateY: oy },
        { scale: s },
        { translateX: -ox }, { translateY: -oy },
      ],
    };
  });

  const btn_panel_style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: btn_x.value,
    top: btn_y.value,
    alignItems: 'center',
    gap: 6,
    zIndex: 20,
  }));

  const handle_zoom_in = () => {
    const next = Math.min(zoom_level + ZOOM_STEP, ZOOM_MAX);
    set_zoom_level(next);
    native_scale.value = withSpring(next, { damping: 18, stiffness: 200 });
  };

  const handle_zoom_out = () => {
    const next = Math.max(zoom_level - ZOOM_STEP, ZOOM_MIN);
    set_zoom_level(next);
    native_scale.value = withSpring(next, { damping: 18, stiffness: 200 });
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

  // Chuẩn hoá URL sang lookerstudio.google.com và dùng baseUrl tương ứng
  // để tránh bị redirect chéo origin làm lỗi CORS khi can thiệp DOM iframe.
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
          <Reanimated.View style={animated_container_style}>
            <WebView
              ref={webview_ref}
              key={webview_key}
              // Load HTML wrapper + iframe thay vì load thẳng URL
              // → Looker render đúng như trong Safari web (frontend1)
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
              <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, backgroundColor: '#ffffff', zIndex: 5 }} />
            )}
          </Reanimated.View>

          {/* Nút zoom +/- kéo thả */}
          {webview_loaded && (
            <GestureDetector gesture={pan_gesture}>
              <Reanimated.View style={btn_panel_style}>
                <TouchableOpacity onPress={handle_zoom_in} disabled={zoom_level >= ZOOM_MAX}
                  style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: zoom_level >= ZOOM_MAX ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3, elevation: 4 }}>
                  <Text style={{ color: '#fff', fontSize: 22, lineHeight: 26, fontWeight: '300' }}>+</Text>
                </TouchableOpacity>

                <View style={{ backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>{Math.round(zoom_level * 100)}%</Text>
                </View>

                <TouchableOpacity onPress={handle_zoom_out} disabled={zoom_level <= ZOOM_MIN}
                  style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: zoom_level <= ZOOM_MIN ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3, elevation: 4 }}>
                  <Text style={{ color: '#fff', fontSize: 26, lineHeight: 28, fontWeight: '300' }}>−</Text>
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
