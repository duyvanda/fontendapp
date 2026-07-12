import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { globalStyles, colors } from '@/styles/global';

interface ReportWebViewProps {
  uri: string;
}

export default function ReportWebView({ uri }: ReportWebViewProps) {
  const [webview_loaded, set_webview_loaded] = useState(false);
  const overlay_opacity = useRef(new Animated.Value(1)).current;
  const bar_width = useRef(new Animated.Value(0)).current;
  const pulse_anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Animate progress bar slowly to 85% while waiting
    Animated.timing(bar_width, {
      toValue: 85,
      duration: 8000,
      useNativeDriver: false,
    }).start();

    // Shimmer/pulse loop
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
    // Snap bar to 100% then fade overlay out
    Animated.timing(bar_width, {
      toValue: 100,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(overlay_opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={globalStyles.screen}>
      {/* WebView renders immediately – always visible behind overlay */}
      {Platform.OS === 'web' ? (
        <iframe
          src={uri}
          style={{ flex: 1, width: '100%', height: '100%', border: 'none' } as any}
          onLoad={handle_load_end}
        />
      ) : (
        <WebView
          source={{ uri }}
          onLoadEnd={handle_load_end}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          renderLoading={() => <View />}
          scalesPageToFit={false}
          injectedJavaScriptBeforeContentLoaded={`
            (function() {
              // Viewport configuration
              var meta = document.querySelector('meta[name=viewport]');
              if (!meta) {
                meta = document.createElement('meta');
                meta.name = 'viewport';
                document.head.appendChild(meta);
              }
              meta.content = 'width=1280, initial-scale=' + (window.screen.width / 1280);

              // Inject CSS immediately to hide Looker Studio footer elements
              var style_el = document.createElement('style');
              style_el.type = 'text/css';
              style_el.innerHTML = '.embed-footer, .embedFooter, [class*="embedFooter"], [class*="embed-footer"], .embedFooterContainer, .branding, .google-logo, .report-footer { display: none !important; }';
              (document.head || document.documentElement).appendChild(style_el);

              // Periodic search to hide elements based on class names and text content
              function hide_elements() {
                // Find all links to hide branding / privacy policy
                var links = document.getElementsByTagName('a');
                for (var i = 0; i < links.length; i++) {
                  var link = links[i];
                  var text_val = (link.textContent || link.innerText || '').toLowerCase();
                  var href_val = (link.href || '').toLowerCase();
                  if (
                    text_val.indexOf('data studio') !== -1 ||
                    text_val.indexOf('looker studio') !== -1 ||
                    text_val.indexOf('quyền riêng tư') !== -1 ||
                    text_val.indexOf('privacy') !== -1 ||
                    href_val.indexOf('google.com/policies') !== -1
                  ) {
                    link.style.setProperty('display', 'none', 'important');
                    var parent_el = link.parentElement;
                    if (parent_el) {
                      parent_el.style.setProperty('display', 'none', 'important');
                      var grand_parent_el = parent_el.parentElement;
                      if (grand_parent_el && (
                        grand_parent_el.className.toLowerCase().indexOf('footer') !== -1 ||
                        grand_parent_el.className.toLowerCase().indexOf('embed') !== -1 ||
                        grand_parent_el.offsetHeight < 60
                      )) {
                        grand_parent_el.style.setProperty('display', 'none', 'important');
                      }
                    }
                  }
                }
              }

              // Run immediately and at intervals to catch dynamically loaded content
              hide_elements();
              setInterval(hide_elements, 3000);
            })();
            true;
          `}
        />
      )}

      {/* Skeleton overlay – fades out when loaded */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#f5f5f5',
          opacity: overlay_opacity,
          zIndex: 10,
        }}
      >
        {/* Progress bar at top */}
        <View style={{ height: 3, backgroundColor: '#e0e0e0', width: '100%' }}>
          <Animated.View
            style={{
              height: 3,
              backgroundColor: colors.primary,
              width: bar_width.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>

        {/* Skeleton shimmer blocks */}
        <View style={{ padding: 16 }}>
          {/* Title skeleton */}
          <Animated.View
            style={{ opacity: pulse_anim, height: 20, width: '60%', backgroundColor: '#ddd', borderRadius: 6 }}
          />

          {/* Filter chips row */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {[38, 28, 33, 22].map((w, i) => (
              <Animated.View
                key={i}
                style={{ opacity: pulse_anim, height: 28, width: `${w}%` as any, backgroundColor: '#e0e0e0', borderRadius: 20 }}
              />
            ))}
          </View>

          {/* Big chart block */}
          <Animated.View
            style={{ opacity: pulse_anim, height: 180, backgroundColor: '#e8e8e8', borderRadius: 8, marginTop: 16 }}
          />

          {/* Two small pie/donut cards */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Animated.View style={{ opacity: pulse_anim, flex: 1, height: 110, backgroundColor: '#e0e0e0', borderRadius: 8 }} />
            <Animated.View style={{ opacity: pulse_anim, flex: 1, height: 110, backgroundColor: '#e0e0e0', borderRadius: 8 }} />
          </View>

          {/* Treemap/table block */}
          <Animated.View
            style={{ opacity: pulse_anim, height: 130, backgroundColor: '#e8e8e8', borderRadius: 8, marginTop: 12 }}
          />

          {/* Hint text */}
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <Text style={{ color: '#bbb', fontSize: 12 }}>Đang tải dữ liệu báo cáo...</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
