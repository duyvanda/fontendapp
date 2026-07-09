import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, RefreshControl, TextInput,
  TouchableOpacity, StyleSheet, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback, Report } from '@/context/FeedbackContext';
import { useNotification } from '@/context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { remove_accents_with_case } from '@/utils/string';
import { colors, spacing, radius } from '@/styles/global';

const REPORT_ICONS = ['analytics', 'pie-chart', 'stats-chart', 'bar-chart', 'trending-up'];
const REPORT_COLORS = [
  { bg: 'rgba(0, 167, 157, 0.1)', icon: '#00A79D' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    user_info, reports, fetch_reports, clear_filter_report, logout_user, toggle_favorite
  } = useFeedback();
  
  const { unread_count } = useNotification();

  const [refreshing, set_refreshing] = useState(false);
  const [search_query, set_search_query] = useState('');
  const [active_tab, set_active_tab] = useState<'all' | 'favorites'>('all');

  const on_refresh = useCallback(async () => {
    set_refreshing(true);
    if (user_info?.manv) await fetch_reports(user_info.manv);
    set_refreshing(false);
  }, [user_info, fetch_reports]);

  const filtered_reports = useMemo(() => {
    let list = reports;
    if (active_tab === 'favorites') {
      list = list.filter(r => r.yeu_thich && String(r.yeu_thich) !== '0');
    }
    if (search_query) {
      const q = remove_accents_with_case(search_query.toLowerCase());
      list = list.filter(r => remove_accents_with_case(r.tenreport.toLowerCase()).includes(q));
    }
    return list;
  }, [reports, search_query, active_tab]);

  const handle_open_report = (report: Report) => {
    clear_filter_report();
    if (report.link_report?.startsWith('/realtime')) {
      router.push(`/realtime/${report.stt}` as any);
    } else {
      router.push(`/report/${report.stt}` as any);
    }
  };

  const user_initial = user_info?.manv ? user_info.manv.charAt(0).toUpperCase() : 'U';

  const render_item = ({ item, index }: { item: Report, index: number }) => {
    const isFav = item.yeu_thich && String(item.yeu_thich) !== '0';
    const colorTheme = REPORT_COLORS[index % REPORT_COLORS.length];
    const iconName = REPORT_ICONS[index % REPORT_ICONS.length] as any;

    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => handle_open_report(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatarBox, { backgroundColor: colorTheme.bg }]}>
          <Ionicons name={iconName} size={28} color={colorTheme.icon} />
        </View>
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={1}>{item.tenreport}</Text>
        </View>
        <TouchableOpacity 
          style={styles.listRight} 
          onPress={() => toggle_favorite(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={isFav ? "star" : "star-outline"} 
            size={22} 
            color={isFav ? colors.warning : '#bdbdbd'} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header (Zalo Style) */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <Ionicons name="search" size={24} color="#ffffff" style={styles.headerIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          placeholderTextColor="rgba(255,255,255,0.7)"
          value={search_query}
          onChangeText={set_search_query}
        />
        {search_query ? (
          <TouchableOpacity onPress={() => set_search_query('')} style={styles.headerIconRight}>
            <Ionicons name="close-circle" size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : null}
        
        <View style={styles.userPill}>
          <Ionicons name="person-circle" size={20} color="#ffffff" />
          <Text style={styles.userPillText}>{user_info?.manv || 'USER'}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerIconRight} 
          onPress={() => router.push('/(tabs)/notifications' as any)}
        >
          <Ionicons name="notifications-outline" size={26} color="#ffffff" />
          {unread_count > 0 && (
            <View style={{
              position: 'absolute',
              top: 0,
              right: 6,
              backgroundColor: colors.error,
              borderRadius: 10,
              minWidth: 16,
              height: 16,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4,
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                {unread_count > 99 ? '99+' : unread_count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerIconRight} onPress={logout_user}>
          <Ionicons name="log-out-outline" size={26} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Tabs Row like Zalo */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tabButton, active_tab === 'all' && styles.tabButtonActive]} 
          onPress={() => set_active_tab('all')}
        >
          <Ionicons name="grid-outline" size={18} color={active_tab === 'all' ? '#000000' : '#757575'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, active_tab === 'all' && styles.tabTextActive]}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, active_tab === 'favorites' && styles.tabButtonActive]} 
          onPress={() => set_active_tab('favorites')}
        >
          <Ionicons name="star" size={18} color={active_tab === 'favorites' ? '#000000' : '#757575'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, active_tab === 'favorites' && styles.tabTextActive]}>Yêu thích</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      {/* List */}
      <FlatList
        data={filtered_reports}
        keyExtractor={item => item.stt}
        renderItem={render_item}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={on_refresh} colors={[colors.primary]} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy báo cáo nào</Text>
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
    backgroundColor: colors.primary, // Merap color
    paddingHorizontal: spacing.md,
  },
  headerIcon: { marginRight: spacing.md },
  headerIconRight: { paddingHorizontal: spacing.sm, marginLeft: spacing.xs },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: spacing.sm,
  },
  userPillText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#ffffff',
    height: '100%',
  },
  
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  tabText: {
    fontSize: 15,
    color: '#757575',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#000000',
    fontWeight: '600',
  },
  
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  avatarBox: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16,
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
  },
  listRight: {
    marginLeft: 12,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    height: 40, // align star to top right
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 84, // Align with text (16 + 52 + 16)
  },
  emptyContainer: {
    padding: 40, alignItems: 'center'
  },
  emptyText: {
    color: '#757575', fontSize: 15
  }
});
