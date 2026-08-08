import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  BackHandler,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/styles/global';
import { AppVersionInfo, CURRENT_NATIVE_VERSION, check_version_status } from '@/constants/version';

interface VersionUpdateModalProps {
  visible: boolean;
  version_info: AppVersionInfo | null;
  onClose?: () => void;
}

export default function VersionUpdateModal({
  visible,
  version_info,
  onClose,
}: VersionUpdateModalProps) {
  const { is_force } = check_version_status(CURRENT_NATIVE_VERSION, version_info);
  const target_version = version_info?.latest_version || 'mới nhất';
  const release_notes =
    version_info?.release_notes ||
    'Ứng dụng đã có phiên bản mới với nhiều cải tiến hiệu năng và tính năng mới. Vui lòng cập nhật để tiếp tục trải nghiệm tốt nhất.';

  // Chặn nút Back cứng trên Android khi ở chế độ Force Update
  useEffect(() => {
    if (!visible || !is_force) return;

    const back_handler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Trả về true để nuốt sự kiện bấm Back, không cho thoát modal
      return true;
    });

    return () => back_handler.remove();
  }, [visible, is_force]);

  const handle_open_store = async () => {
    const default_store_url =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/vn/app/bi-portal/id6790836391'
        : 'https://play.google.com/store/apps/details?id=com.duyvanda.biportal';

    const url = version_info?.update_url || default_store_url;
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.error('Error opening store URL:', e);
      try {
        await Linking.openURL(default_store_url);
      } catch (err) {
        console.error('Fallback store URL error:', err);
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        if (!is_force && onClose) onClose();
      }}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Badge Icon */}
          <View style={styles.icon_container}>
            <View style={styles.icon_bg}>
              <Ionicons name="rocket-sharp" size={32} color="#00A79D" />
            </View>
          </View>

          {/* Header Tag */}
          <View style={styles.version_tag}>
            <Text style={styles.version_tag_text}>
              Phiên bản v{target_version}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {is_force ? 'Yêu cầu Cập nhật Ứng dụng' : 'Đã có Bản Cập nhật Mới!'}
          </Text>

          {/* Description */}
          <Text style={styles.subtitle}>
            Bạn đang dùng phiên bản <Text style={styles.bold_text}>v{CURRENT_NATIVE_VERSION}</Text>. Vui lòng cập nhật ứng dụng lên phiên bản <Text style={styles.bold_text}>v{target_version}</Text> từ cửa hàng ứng dụng.
          </Text>

          {/* Release Notes Box */}
          <View style={styles.notes_box}>
            <View style={styles.notes_header}>
              <Ionicons name="sparkles" size={14} color="#00A79D" style={{ marginRight: 6 }} />
              <Text style={styles.notes_title}>Có gì mới?</Text>
            </View>
            <Text style={styles.notes_content}>{release_notes}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.button_group}>
            <TouchableOpacity
              style={styles.update_btn}
              onPress={handle_open_store}
              activeOpacity={0.8}
            >
              <Ionicons name="cloud-download-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.update_btn_text}>Cập nhật ngay</Text>
            </TouchableOpacity>

            {!is_force && onClose && (
              <TouchableOpacity
                style={styles.skip_btn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.skip_btn_text}>Để sau</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  icon_container: {
    marginTop: -48,
    marginBottom: 12,
  },
  icon_bg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F4FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#00A79D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  version_tag: {
    backgroundColor: 'rgba(0, 167, 157, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  version_tag_text: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A79D',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  bold_text: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  notes_box: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notes_header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notes_title: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00A79D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notes_content: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  button_group: {
    width: '100%',
    gap: 10,
  },
  update_btn: {
    width: '100%',
    height: 48,
    backgroundColor: '#00A79D',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00A79D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  update_btn_text: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  skip_btn: {
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skip_btn_text: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
