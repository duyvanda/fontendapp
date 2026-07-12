import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, RefreshControl, TextInput,
  TouchableOpacity, StyleSheet, Modal, Image, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback, Report } from '@/context/FeedbackContext';
import { Ionicons } from '@expo/vector-icons';
import { remove_accents_with_case } from '@/utils/string';
import { colors, spacing } from '@/styles/global';
import { NATIVE_REPORTS_MAP } from '@/components/native_reports';

const REPORT_ICONS = ['analytics', 'pie-chart', 'stats-chart', 'bar-chart', 'trending-up'];
const REPORT_COLORS = [
  { bg: 'rgba(0, 167, 157, 0.1)', icon: '#00A79D' },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    user_info, reports, fetch_reports, clear_filter_report, toggle_favorite, save_tags
  } = useFeedback();
  const [refreshing, set_refreshing] = useState(false);
  const [search_query, set_search_query] = useState('');
  const [active_tab, set_active_tab] = useState<'all' | 'favorites' | 'tags'>('all');

  // Tag feature states
  const [expanded_folders, set_expanded_folders] = useState<Set<string>>(new Set());
  const [has_initialized_folders, set_has_initialized_folders] = useState(false);
  const [tag_sort, set_tag_sort] = useState<'az' | 'za' | 'count'>('az');

  // Tag Modal states
  const [selected_report, set_selected_report] = useState<Report | null>(null);
  const [modal_tags, set_modal_tags] = useState<string[]>([]);
  const [new_tag_text, set_new_tag_text] = useState('');

  const on_refresh = useCallback(async () => {
    set_refreshing(true);
    if (user_info?.manv) await fetch_reports(user_info.manv);
    set_refreshing(false);
  }, [user_info, fetch_reports]);

  // Compute tag mapping and unique tags list
  const { grouped_reports, all_tags } = useMemo(() => {
    const grouped: Record<string, Report[]> = {};
    reports.forEach(r => {
      const tags = Array.isArray(r.tags) ? r.tags : [];
      tags.forEach(t => {
        if (!grouped[t]) {
          grouped[t] = [];
        }
        grouped[t].push(r);
      });
    });
    const tagsList = Object.keys(grouped);
    return { grouped_reports: grouped, all_tags: tagsList };
  }, [reports]);

  // Expand folders by default when they are loaded for the first time
  useEffect(() => {
    if (all_tags.length > 0 && !has_initialized_folders) {
      set_expanded_folders(new Set(all_tags));
      set_has_initialized_folders(true);
    }
  }, [all_tags, has_initialized_folders]);

  // Filters main reports list & puts favorited ones on top
  const filtered_reports = useMemo(() => {
    let list = [...reports];
    if (active_tab === 'favorites') {
      list = list.filter(r => r.yeu_thich && String(r.yeu_thich) !== '0');
    }
    if (search_query) {
      const q = remove_accents_with_case(search_query.toLowerCase());
      list = list.filter(r => {
        const name_match = remove_accents_with_case(r.tenreport.toLowerCase()).includes(q);
        const tags = Array.isArray(r.tags) ? r.tags : [];
        const tag_match = tags.some(t => remove_accents_with_case(t.toLowerCase()).includes(q));
        return name_match || tag_match;
      });
    }
    // Sort favorited reports to the top
    list.sort((a, b) => {
      const aFav = a.yeu_thich && String(a.yeu_thich) !== '0' ? 1 : 0;
      const bFav = b.yeu_thich && String(b.yeu_thich) !== '0' ? 1 : 0;
      return bFav - aFav;
    });
    return list;
  }, [reports, search_query, active_tab]);

  // Filters tag folders based on folder name or contained reports
  const filtered_tags = useMemo(() => {
    let list = [...all_tags];
    if (search_query) {
      const q = remove_accents_with_case(search_query.toLowerCase());
      list = list.filter(tag => {
        const tag_match = remove_accents_with_case(tag.toLowerCase()).includes(q);
        const reports_in_tag = grouped_reports[tag] || [];
        const report_match = reports_in_tag.some(r =>
          remove_accents_with_case(r.tenreport.toLowerCase()).includes(q)
        );
        return tag_match || report_match;
      });
    }

    // Sort tag folders
    list.sort((a, b) => {
      if (tag_sort === 'az') {
        return a.localeCompare(b, 'vi');
      } else if (tag_sort === 'za') {
        return b.localeCompare(a, 'vi');
      } else if (tag_sort === 'count') {
        const aCount = (grouped_reports[a] || []).length;
        const bCount = (grouped_reports[b] || []).length;
        return bCount - aCount;
      }
      return 0;
    });

    return list;
  }, [all_tags, search_query, tag_sort, grouped_reports]);

  const handle_open_report = (report: Report) => {
    clear_filter_report();
    if (Number(report.type) === 4 || report.stt in NATIVE_REPORTS_MAP) {
      router.push(`/report/native/${report.stt}` as any);
    } else if (report.link_report?.startsWith('/realtime')) {
      router.push(`/realtime/${report.stt}` as any);
    } else {
      router.push(`/report/${report.stt}` as any);
    }
  };

  const handle_open_tag_modal = (report: Report) => {
    set_selected_report(report);
    set_modal_tags(Array.isArray(report.tags) ? [...report.tags] : []);
    set_new_tag_text('');
  };

  const handle_add_tag = async () => {
    const trimmed = new_tag_text.trim().toUpperCase();
    if (!trimmed || !selected_report) return;
    if (modal_tags.includes(trimmed)) return;

    if (modal_tags.length >= 3) {
      Alert.alert("Thông báo", "Chỉ được thêm tối đa 3 tags cho mỗi báo cáo.");
      return;
    }

    const updated = [...modal_tags, trimmed];
    set_modal_tags(updated);
    set_new_tag_text('');
    await save_tags(selected_report, updated);
  };

  const handle_remove_tag = async (tagToRemove: string) => {
    if (!selected_report) return;
    const updated = modal_tags.filter(t => t !== tagToRemove);
    set_modal_tags(updated);
    await save_tags(selected_report, updated);
  };

  const toggle_folder = (tag: string) => {
    set_expanded_folders(prev => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handle_expand_all = () => {
    set_expanded_folders(new Set(all_tags));
  };

  const handle_collapse_all = () => {
    set_expanded_folders(new Set());
  };

  const get_reports_in_folder = (tag: string) => {
    let list = grouped_reports[tag] || [];
    if (search_query) {
      const q = remove_accents_with_case(search_query.toLowerCase());
      list = list.filter(r => 
        remove_accents_with_case(r.tenreport.toLowerCase()).includes(q) || 
        remove_accents_with_case(tag.toLowerCase()).includes(q)
      );
    }
    // Sort favorited reports inside the folder to the top
    return [...list].sort((a, b) => {
      const aFav = a.yeu_thich && String(a.yeu_thich) !== '0' ? 1 : 0;
      const bFav = b.yeu_thich && String(b.yeu_thich) !== '0' ? 1 : 0;
      return bFav - aFav;
    });
  };

  const render_item = ({ item, index }: { item: Report, index: number }) => {
    const isFav = item.yeu_thich && String(item.yeu_thich) !== '0';
    const colorTheme = REPORT_COLORS[index % REPORT_COLORS.length];
    const iconName = REPORT_ICONS[index % REPORT_ICONS.length] as any;
    const tags = Array.isArray(item.tags) ? item.tags : [];

    return (
      <TouchableOpacity 
        style={styles.listItem}
        onPress={() => handle_open_report(item)}
        onLongPress={() => handle_open_tag_modal(item)}
        delayLongPress={400}
        activeOpacity={0.7}
      >
        <View style={[styles.avatarBox, { backgroundColor: colorTheme.bg }]}>
          <Ionicons name={iconName} size={28} color={colorTheme.icon} />
        </View>
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={1}>{item.tenreport}</Text>
          {tags.length > 0 && (
            <View style={styles.tagBadgeContainer}>
              {tags.map(t => (
                <View key={t} style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText} numberOfLines={1} ellipsizeMode="tail">{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.listItemActions}>
          <TouchableOpacity 
            style={styles.listActionBtn} 
            onPress={() => toggle_favorite(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={isFav ? "star" : "star-outline"} 
              size={22} 
              color={isFav ? colors.warning : '#bdbdbd'} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const render_folder_item = ({ item: tag }: { item: string }) => {
    const is_open = expanded_folders.has(tag);
    const reports_in_folder = get_reports_in_folder(tag);

    return (
      <View style={styles.folderWrapper}>
        <TouchableOpacity
          style={styles.folderHeader}
          onPress={() => toggle_folder(tag)}
          activeOpacity={0.7}
        >
          <View style={styles.folderHeaderLeft}>
            <Text style={styles.folderIcon}>{is_open ? '📂' : '📁'}</Text>
            <Text style={styles.folderTitle}>{tag}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{reports_in_folder.length}</Text>
            </View>
          </View>
          <Text style={styles.folderChevron}>{is_open ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        
        {is_open && (
          <View style={styles.folderContent}>
            {reports_in_folder.length === 0 ? (
              <View style={styles.emptyFolderContainer}>
                <Text style={styles.emptyFolderText}>Không có báo cáo nào</Text>
              </View>
            ) : (
              reports_in_folder.map((el, idx) => (
                <View key={el.stt}>
                  {render_item({ item: el, index: idx })}
                  {idx < reports_in_folder.length - 1 && <View style={styles.separator} />}
                </View>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  const render_tags_toolbar = () => {
    const all_expanded = all_tags.length > 0 && all_tags.every(t => expanded_folders.has(t));
    const sort_options = [
      { v: 'az', label: 'A→Z' },
      { v: 'za', label: 'Z→A' },
      { v: 'count', label: 'Số lượng' }
    ] as const;

    return (
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>📶 Sắp xếp:</Text>
        {sort_options.map(opt => (
          <TouchableOpacity
            key={opt.v}
            style={[styles.toolbarBtn, tag_sort === opt.v && styles.toolbarBtnActive]}
            onPress={() => set_tag_sort(opt.v)}
          >
            <Text style={[styles.toolbarBtnText, tag_sort === opt.v && styles.toolbarBtnTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.toolbarDivider} />

        <TouchableOpacity
          style={[styles.toolbarActionBtn, all_expanded && styles.toolbarBtnDisabled]}
          onPress={handle_expand_all}
          disabled={all_expanded}
        >
          <Text style={styles.toolbarActionText}>📂 Mở hết</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toolbarActionBtn, expanded_folders.size === 0 && styles.toolbarBtnDisabled]}
          onPress={handle_collapse_all}
          disabled={expanded_folders.size === 0}
        >
          <Text style={styles.toolbarActionText}>📁 Thu hết</Text>
        </TouchableOpacity>
      </View>
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
        <TouchableOpacity style={styles.userPill} onPress={() => router.push('/account' as any)}>
          <Ionicons name="person-circle" size={20} color="#ffffff" />
          <Text style={styles.userPillText}>{user_info?.manv || 'USER'}</Text>
          <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 2 }} />
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
        <TouchableOpacity 
          style={[styles.tabButton, active_tab === 'tags' && styles.tabButtonActive]} 
          onPress={() => set_active_tab('tags')}
        >
          <Ionicons name="folder-open-outline" size={18} color={active_tab === 'tags' ? '#000000' : '#757575'} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, active_tab === 'tags' && styles.tabTextActive]}>Tags</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
      </View>

      {/* List */}
      {active_tab === 'tags' ? (
        all_tags.length === 0 ? (
          <View style={styles.guideContainer}>
            <Text style={styles.guideText}>Chưa có nhóm tag nào</Text>
            <Text style={styles.guideSubText}>Nhấn và giữ (Long press) vào dòng báo cáo để thêm tags.</Text>
            <Image
              source={{ uri: 'https://bi.meraplion.com/DMS/media/tags.jpg' }}
              style={styles.guideImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <FlatList
            data={filtered_tags}
            keyExtractor={item => item}
            renderItem={render_folder_item}
            ListHeaderComponent={render_tags_toolbar}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không tìm thấy nhóm tag nào</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )
      ) : (
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
      )}

      {/* Modal Quản lý Tags */}
      <Modal
        visible={selected_report !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => set_selected_report(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selected_report?.tenreport}
              </Text>
              <TouchableOpacity onPress={() => set_selected_report(null)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            {/* List of current tags */}
            <Text style={styles.modalLabel}>Tags hiện tại (Nhấp để xóa):</Text>
            {modal_tags.length === 0 ? (
              <Text style={styles.noTagsText}>Chưa có tag nào</Text>
            ) : (
              <View style={styles.modalTagsList}>
                {modal_tags.map(tag => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.modalTagItem}
                    onPress={() => handle_remove_tag(tag)}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.modalTagText}>{tag}</Text>
                    <Ionicons name="close-circle" size={14} color="#dc3545" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Add new tag */}
            <Text style={styles.modalLabel}>Thêm tag mới:</Text>
            <View style={styles.addTagRow}>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập tên tag..."
                placeholderTextColor="#94a3b8"
                value={new_tag_text}
                onChangeText={text => set_new_tag_text(text.toUpperCase())}
                autoCapitalize="characters"
                onSubmitEditing={handle_add_tag}
              />
              <TouchableOpacity style={styles.addTagBtn} onPress={handle_add_tag}>
                <Text style={styles.addTagBtnText}>+ Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary, // Primary color
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
    paddingHorizontal: 15,
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
    flexShrink: 1,
  },
  listSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
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
  },

  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  tagBadgeContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  tagBadge: {
    backgroundColor: 'rgba(0, 167, 157, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    maxWidth: 120,
  },
  tagBadgeText: {
    color: '#00766E',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  listActionBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  
  // Folder layout styles
  folderWrapper: {
    backgroundColor: '#f8fafc', // Light gray background for contrast
    marginBottom: 8,
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Premium white card
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12, // Round corner (12px)
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  folderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  folderIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  folderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginRight: 8,
  },
  countBadge: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  folderChevron: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  folderContent: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  emptyFolderContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyFolderText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
  },

  // Toolbar styles
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    flexWrap: 'wrap',
    gap: 6,
  },
  toolbarTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginRight: 2,
  },
  toolbarBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toolbarBtnActive: {
    backgroundColor: 'rgba(0, 167, 157, 0.08)',
    borderColor: 'rgba(0, 167, 157, 0.2)',
  },
  toolbarBtnText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  toolbarBtnTextActive: {
    color: '#00766E',
    fontWeight: '600',
  },
  toolbarBtnDisabled: {
    opacity: 0.5,
  },
  toolbarDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 2,
  },
  toolbarActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toolbarActionText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 360,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 4,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  modalCloseBtn: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  noTagsText: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  modalTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  modalTagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(220, 53, 69, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    minHeight: 32, // clear touch zone
  },
  modalTagText: {
    color: '#dc3545',
    fontSize: 13,
    fontWeight: '600',
  },
  addTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  modalInput: {
    flex: 1,
    height: 44, // 44px Touch target
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 22, // Pill shape
    paddingHorizontal: 16,
    fontSize: 16, // Anti-zoom iOS fix
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  addTagBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    height: 44, // 44px Touch target
    borderRadius: 22, // Pill shape
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  guideContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  guideText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 6,
  },
  guideSubText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  guideImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
