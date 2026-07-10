import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotification, AppNotification } from '@/context/NotificationContext';
import { useFeedback } from '@/context/FeedbackContext';
import { colors, spacing, radius, globalStyles } from '@/styles/global';
import { format_date_ymd } from '@/utils/string'; // Using existing helper if applicable

const NOTIFICATION_THEME = {
  kpi_drop: { icon: 'trending-down', color: colors.error, bg: colors.errorLight },
  deadline: { icon: 'time', color: colors.warning, bg: colors.warningLight },
  target_reached: { icon: 'checkmark-circle', color: colors.success, bg: colors.successLight },
  anomaly: { icon: 'alert-circle', color: colors.info, bg: colors.infoLight },
  default: { icon: 'notifications', color: colors.primary, bg: colors.primaryLight },
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user_info } = useFeedback();
  const { 
    notifications, 
    loading, 
    fetch_notifications, 
    mark_as_read, 
    mark_all_read 
  } = useNotification();

  const loadData = useCallback(() => {
    if (user_info?.manv) {
      console.log('[NotificationsScreen] loadData triggered for manv:', user_info.manv);
      fetch_notifications(user_info.manv);
    }
  }, [user_info?.manv, fetch_notifications]);

  useEffect(() => {
    loadData();
  }, [loadData]);



  const handle_press = (item: AppNotification) => {
    if (!item.is_read) {
      mark_as_read([item.id]);
    }
    if (item.report_stt) {
      router.push(`/report/${item.report_stt}` as any);
    }
  };

  const render_item = ({ item }: { item: AppNotification }) => {
    const theme = NOTIFICATION_THEME[item.type as keyof typeof NOTIFICATION_THEME] || NOTIFICATION_THEME.default;
    
    // Format date string safely
    let dateStr = item.created_at;
    try {
        const d = new Date(item.created_at);
        dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch(e) {}

    return (
      <TouchableOpacity 
        style={[styles.itemContainer, !item.is_read && styles.itemUnread]}
        onPress={() => handle_press(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
          <Ionicons name={theme.icon as any} size={24} color={theme.color} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, !item.is_read && styles.titleUnread]}>{item.title}</Text>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>{dateStr}</Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        {notifications.some(n => !n.is_read) && (
          <TouchableOpacity onPress={() => mark_all_read(user_info?.manv || '')}>
            <Text style={styles.headerAction}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={render_item}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} colors={[colors.primary]} />
        }
        contentContainerStyle={notifications.length === 0 ? styles.listEmpty : styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={globalStyles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textCaption} />
            <Text style={globalStyles.emptyText}>Bạn không có thông báo nào.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerAction: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
  },
  listContent: {
    paddingBottom: 20,
  },
  listEmpty: {
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: '#ffffff',
  },
  itemUnread: {
    backgroundColor: '#f4fbfb', // Very light primary shade
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  titleUnread: {
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: colors.textCaption,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    marginLeft: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 48 + spacing.md * 2, // Align with text
  }
});
