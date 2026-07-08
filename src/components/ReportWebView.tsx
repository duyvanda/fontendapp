import React, { useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { globalStyles, colors } from '@/styles/global';

interface ReportWebViewProps {
  uri: string;
}

export default function ReportWebView({ uri }: ReportWebViewProps) {
  const [loading, setLoading] = useState(true);

  return (
    <View style={globalStyles.screen}>
      {loading && (
        <View style={[globalStyles.screen, { position: 'absolute', width: '100%', height: '100%', zIndex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      {Platform.OS === 'web' ? (
        <iframe 
          src={uri} 
          style={{ flex: 1, width: '100%', height: '100%', border: 'none' }} 
          onLoad={() => setLoading(false)}
        />
      ) : (
        <WebView
          source={{ uri }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          style={{ flex: 1, backgroundColor: 'transparent' }}
          startInLoadingState={true}
          renderLoading={() => <View />} // Handled by outer ActivityIndicator
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      )}
    </View>
  );
}
