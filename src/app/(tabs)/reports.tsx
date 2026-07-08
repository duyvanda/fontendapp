import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles, colors, spacing } from '@/styles/global';
import CustomHeader from '@/components/CustomHeader';
import { useFeedback, Report } from '@/context/FeedbackContext';
import { remove_accents } from '@/utils/string';

export default function ReportsScreen() {
  const router = useRouter();
  const { reports, clear_filter_report } = useFeedback();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  // Lọc reports dựa trên từ khóa tìm kiếm (chưa xử lý favorites vì API cũ dùng yeu_thich flag, cần check logic)
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
    // Logic xác định URL chuyển đến (realtime hay report tĩnh)
    if (report.link_report?.startsWith('/realtime')) {
      router.push(`/report/realtime-${report.stt}`);
    } else {
      router.push(`/report/${report.stt}`);
    }
  };

  const renderReportItem = ({ item }: { item: Report }) => {
    const isFav = item.yeu_thich && String(item.yeu_thich) !== '0';
    
    return (
      <TouchableOpacity 
        style={[globalStyles.card, { marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center' }]}
        onPress={() => handleOpenReport(item)}
      >
        <Ionicons 
          name={isFav ? "star" : "star-outline"} 
          size={24} 
          color={isFav ? colors.star : colors.textCaption} 
          style={{ marginRight: spacing.md }}
        />
        <View style={{ flex: 1 }}>
          <Text style={[globalStyles.body, { fontWeight: '600' }]} numberOfLines={2}>
            {item.tenreport}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textCaption} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={globalStyles.screen}>
      <CustomHeader title="Danh sách Báo cáo" />
      
      <View style={{ padding: spacing.md, paddingBottom: 0 }}>
        {/* Search Bar */}
        <View style={[globalStyles.row, globalStyles.input, { paddingVertical: spacing.sm, marginBottom: spacing.md }]}>
          <Ionicons name="search" size={20} color={colors.textCaption} style={{ marginRight: spacing.sm }} />
          <TextInput
            style={{ flex: 1, padding: 0, fontSize: 15 }}
            placeholder="Tìm kiếm báo cáo..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textCaption} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* View Tabs */}
        <View style={[globalStyles.row, { marginBottom: spacing.md }]}>
          <TouchableOpacity 
            style={[globalStyles.chip, { marginRight: spacing.sm, backgroundColor: activeTab === 'all' ? colors.primary : colors.surface, borderWidth: activeTab === 'all' ? 0 : 1, borderColor: colors.border }]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[globalStyles.chipText, { color: activeTab === 'all' ? colors.textInverse : colors.textPrimary }]}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[globalStyles.chip, { backgroundColor: activeTab === 'favorites' ? colors.primary : colors.surface, borderWidth: activeTab === 'favorites' ? 0 : 1, borderColor: colors.border }]}
            onPress={() => setActiveTab('favorites')}
          >
            <Text style={[globalStyles.chipText, { color: activeTab === 'favorites' ? colors.textInverse : colors.textPrimary }]}>Yêu thích</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={item => item.stt}
        renderItem={renderReportItem}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
        ListEmptyComponent={
          <View style={globalStyles.emptyContainer}>
            <Text style={globalStyles.emptyText}>Không tìm thấy báo cáo nào</Text>
          </View>
        }
      />
    </View>
  );
}
