import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles, colors, spacing, radius } from '@/styles/global';
import { useFeedback, Report } from '@/context/FeedbackContext';
import { Ionicons } from '@expo/vector-icons';
import { remove_accents } from '@/utils/string';

const { width } = Dimensions.get('window');

const REPORT_ICONS = ['analytics', 'pie-chart', 'stats-chart', 'bar-chart', 'trending-up'];
const REPORT_COLORS = [
  { bg: 'rgba(0, 167, 157, 0.1)', icon: '#00A79D' },
  { bg: 'rgba(14, 165, 233, 0.1)', icon: '#0ea5e9' },
  { bg: 'rgba(220, 123, 83, 0.2)', icon: '#984623' },
  { bg: 'rgba(16, 185, 129, 0.1)', icon: '#10b981' },
  { bg: 'rgba(245, 158, 11, 0.1)', icon: '#f59e0b' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user_info, reports, fetch_reports, clear_filter_report } = useFeedback();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user_info?.manv) {
      await fetch_reports(user_info.manv);
    }
    setRefreshing(false);
  }, [user_info, fetch_reports]);

  const filteredReports = useMemo(() => {
    let list = reports;
    if (activeTab === 'favorites') {
      list = list.filter(r => r.yeu_thich && String(r.yeu_thich) !== '0');
    }
    
    if (searchQuery) {
      const q = remove_accents(searchQuery.toLowerCase());
      list = list.filter(r => remove_accents(r.tenreport.toLowerCase()).includes(q));
    }
    return list;
  }, [reports, searchQuery, activeTab]);

  const handleOpenReport = (report: Report) => {
    clear_filter_report();
    if (report.link_report?.startsWith('/realtime')) {
      router.push(`/report/realtime-${report.stt}`);
    } else {
      router.push(`/report/${report.stt}`);
    }
  };

  const userInitial = user_info?.manv ? user_info.manv.charAt(0).toUpperCase() : 'U';

  return (
    <View style={styles.screen}>
      {/* TopAppBar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
        <Text style={styles.headerTitle}>BIRA</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={24} color="#006a64" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00A79D']} />}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.textCaption} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm báo cáo, chỉ số..."
            placeholderTextColor={colors.textCaption}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={20} color={colors.textCaption} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'all' ? styles.tabButtonActive : null]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' ? styles.tabTextActive : null]}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'favorites' ? styles.tabButtonActive : null]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[styles.tabText, activeTab === 'favorites' ? styles.tabTextActive : null]}>Yêu thích</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dashedDivider} />

        {/* Reports Grid */}
        <View style={styles.gridContainer}>
          {filteredReports.length > 0 ? (
            filteredReports.map((report, index) => {
              const isFav = report.yeu_thich && String(report.yeu_thich) !== '0';
              const colorTheme = REPORT_COLORS[index % REPORT_COLORS.length];
              const iconName = REPORT_ICONS[index % REPORT_ICONS.length] as any;

              return (
                <TouchableOpacity 
                  key={report.stt}
                  style={styles.card}
                  onPress={() => handleOpenReport(report)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleContainer}>
                      <View style={[styles.iconBox, { backgroundColor: colorTheme.bg }]}>
                        <Ionicons name={iconName} size={20} color={colorTheme.icon} />
                      </View>
                      <Text style={styles.cardTitle} numberOfLines={2}>{report.tenreport}</Text>
                    </View>
                    <TouchableOpacity style={styles.starButton}>
                      <Ionicons 
                        name={isFav ? "star" : "star-outline"} 
                        size={22} 
                        color={isFav ? colors.warning : colors.textCaption} 
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={globalStyles.emptyContainer}>
              <Text style={globalStyles.emptyText}>Không tìm thấy báo cáo nào</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 64,
    backgroundColor: '#f7f9fb',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
      }
    }),
    zIndex: 50,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 167, 157, 0.2)',
    backgroundColor: '#96f0e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#006f67',
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#006a64',
    letterSpacing: -0.5,
  },
  iconButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100, // Leave space for bottom nav
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 52,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  clearIcon: {
    padding: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    height: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tabButton: {
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginRight: spacing.sm,
    backgroundColor: '#eceef0',
  },
  tabButtonActive: {
    backgroundColor: '#96f0e5',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3c4947',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#006f67',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  gridContainer: {
    flexDirection: width > 600 ? 'row' : 'column',
    flexWrap: width > 600 ? 'wrap' : 'nowrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
    width: width > 600 ? '48%' : '100%',
    marginBottom: width > 600 ? 0 : spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#191c1e',
    flex: 1,
  },
  starButton: {
    padding: spacing.xs,
  },
});
