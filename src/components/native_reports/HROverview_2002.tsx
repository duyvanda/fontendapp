import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, globalStyles } from '@/styles/global';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Real Data from data_hr.csv ──────────────────────────────────────────────
const OVERALL_DATA = {
  kpis: [
    { label: 'Tổng nhân sự', value: '648', kpi: 'Tỷ lệ Nữ: 38.7%', percent: 100, color: colors.primary, icon: 'people-outline' },
    { label: 'Tuổi trung bình', value: '35.5', kpi: 'Độ tuổi lao động vàng', percent: 71, color: colors.info, icon: 'calendar-outline' },
    { label: 'Đã lập gia đình', value: '74%', kpi: '479 nhân sự đã kết hôn', percent: 74, color: colors.warning, icon: 'heart-outline' }
  ],
  chart: [
    { label: '2020', value: 25 },
    { label: '2021', value: 28 },
    { label: '2022', value: 39 },
    { label: '2023', value: 74 },
    { label: '2024', value: 57 },
    { label: '2025', value: 50 },
    { label: '2026', value: 77 }
  ],
  departments: [
    { name: 'MDS (Medical Device Specialists)', count: 116, ratio: 0.179 },
    { name: 'TP (Trình dược viên)', count: 100, ratio: 0.154 },
    { name: 'HCP (Healthcare Partners)', count: 97, ratio: 0.150 },
    { name: 'Production (Nhà máy)', count: 87, ratio: 0.134 },
    { name: 'WPS (Warehouse & Logistics)', count: 40, ratio: 0.062 },
    { name: 'Bộ phận khác', count: 208, ratio: 0.321 }
  ],
  educations: [
    { name: 'Đại học', count: 285, ratio: 0.440 },
    { name: 'Cao đẳng', count: 129, ratio: 0.199 },
    { name: 'Trung cấp', count: 119, ratio: 0.184 },
    { name: 'Lao động phổ thông', count: 79, ratio: 0.122 },
    { name: 'Sau đại học / Khác', count: 36, ratio: 0.055 }
  ],
  locations: [
    { name: 'Hưng Yên', count: 198, ratio: 0.306 },
    { name: 'Hồ Chí Minh / HCM', count: 160, ratio: 0.247 },
    { name: 'Hà Nội', count: 27, ratio: 0.042 },
    { name: 'Đà Nẵng', count: 20, ratio: 0.031 },
    { name: 'Địa bàn khác', count: 243, ratio: 0.375 }
  ]
};

const NEW_HIRES_2026_DATA = {
  kpis: [
    { label: 'Tổng nhân sự mới', value: '77', kpi: 'Tỷ lệ Nữ: 41.6%', percent: 100, color: colors.primary, icon: 'person-add-outline' },
    { label: 'Tuổi trung bình', value: '31.4', kpi: 'Trẻ trung, năng động', percent: 63, color: colors.info, icon: 'calendar-outline' },
    { label: 'Đã lập gia đình', value: '56%', kpi: '43 nhân sự đã kết hôn', percent: 56, color: colors.warning, icon: 'heart-outline' }
  ],
  chart: [
    { label: 'T1', value: 13 },
    { label: 'T2', value: 4 },
    { label: 'T3', value: 11 },
    { label: 'T4', value: 19 },
    { label: 'T5', value: 10 },
    { label: 'T6', value: 11 },
    { label: 'T7', value: 9 }
  ],
  departments: [
    { name: 'TP (Trình dược viên)', count: 22, ratio: 0.286 },
    { name: 'HCP (Healthcare Partners)', count: 12, ratio: 0.156 },
    { name: 'MDS (Medical Device Specialists)', count: 8, ratio: 0.104 },
    { name: 'Production (Nhà máy)', count: 7, ratio: 0.091 },
    { name: 'Bộ phận khác', count: 28, ratio: 0.363 }
  ],
  educations: [
    { name: 'Đại học', count: 41, ratio: 0.532 },
    { name: 'Cao đẳng', count: 13, ratio: 0.169 },
    { name: 'Trung cấp', count: 9, ratio: 0.117 },
    { name: 'Lao động phổ thông', count: 11, ratio: 0.143 },
    { name: 'Trình độ khác', count: 3, ratio: 0.039 }
  ],
  locations: [
    { name: 'Hồ Chí Minh / HCM', count: 29, ratio: 0.377 },
    { name: 'Hưng Yên', count: 15, ratio: 0.195 },
    { name: 'Hà Nội', count: 4, ratio: 0.052 },
    { name: 'Địa bàn khác', count: 29, ratio: 0.377 }
  ]
};

export default function HROverview_2002({ scrollEnabled = true }: { scrollEnabled?: boolean }) {
  const [time_tab, set_time_tab] = useState<'overall' | 'new_hires'>('overall');
  const [selected_bar, set_selected_bar] = useState<number | null>(null);

  const data = time_tab === 'overall' ? OVERALL_DATA : NEW_HIRES_2026_DATA;
  const max_chart_value = Math.max(...data.chart.map(d => d.value));

  // Animating values
  const tooltip_opacity = useRef(new Animated.Value(0)).current;
  const tooltip_translate_x = useRef(new Animated.Value(0)).current;

  const handle_bar_press = (val: number, index: number, total_bars: number) => {
    set_selected_bar(index);

    const containerWidth = SCREEN_WIDTH - spacing.md * 2 - 32;
    const barWidth = containerWidth / total_bars;
    const targetX = (index * barWidth) + (barWidth / 2) - 40; // 40 is half of tooltip width (80)

    Animated.parallel([
      Animated.timing(tooltip_opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.spring(tooltip_translate_x, { toValue: targetX, friction: 6, useNativeDriver: true })
    ]).start();
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: spacing.xl }} 
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
    >
      {/* ── Time Tab Filter ── */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tabBtn, time_tab === 'overall' && styles.tabBtnActive]} 
          onPress={() => {
            set_time_tab('overall');
            set_selected_bar(null);
            tooltip_opacity.setValue(0);
          }}
        >
          <Text style={[styles.tabText, time_tab === 'overall' && styles.tabTextActive]}>Tổng thể</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, time_tab === 'new_hires' && styles.tabBtnActive]} 
          onPress={() => {
            set_time_tab('new_hires');
            set_selected_bar(null);
            tooltip_opacity.setValue(0);
          }}
        >
          <Text style={[styles.tabText, time_tab === 'new_hires' && styles.tabTextActive]}>Tuyển mới 2026</Text>
        </TouchableOpacity>
      </View>

      {/* ── KPIs Section ── */}
      <View style={styles.kpiContainer}>
        {data.kpis.map((kpi, index) => (
          <View key={index} style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <View style={[styles.iconBox, { backgroundColor: kpi.color + '15' }]}>
                <Ionicons name={kpi.icon as any} size={20} color={kpi.color} />
              </View>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(kpi.percent, 100)}%`, 
                    backgroundColor: kpi.color 
                  }
                ]} 
              />
            </View>
            <View style={styles.kpiFooter}>
              <Text style={styles.kpiSubText}>{kpi.kpi}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Onboard Chart (Bar) ── */}
      <View style={styles.chartCard}>
        <View style={globalStyles.rowBetween}>
          <Text style={styles.cardTitle}>
            {time_tab === 'overall' ? 'Nhân sự onboard theo năm' : 'Nhân sự onboard theo tháng (2026)'}
          </Text>
          <Text style={styles.cardSubtitle}>(Nhân sự)</Text>
        </View>

        {/* Dynamic Tooltip */}
        <View style={{ height: 30, justifyContent: 'center' }}>
          <Animated.View 
            style={[
              styles.tooltip, 
              { 
                opacity: tooltip_opacity,
                transform: [{ translateX: tooltip_translate_x }]
              }
            ]}
          >
            <Text style={styles.tooltipText}>
              {selected_bar !== null ? `Onboard: ${data.chart[selected_bar].value} ns` : ''}
            </Text>
          </Animated.View>
        </View>

        {/* Chart Bars */}
        <View style={styles.chartArea}>
          {data.chart.map((item, index) => {
            const barHeight = max_chart_value > 0 ? (item.value / max_chart_value) * 130 : 0;
            const isSelected = selected_bar === index;
            
            return (
              <TouchableOpacity 
                key={index} 
                activeOpacity={0.8}
                style={styles.chartColumn}
                onPress={() => handle_bar_press(item.value, index, data.chart.length)}
              >
                <View style={styles.barTrack}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: barHeight,
                        backgroundColor: isSelected ? colors.primaryDark : colors.primary
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.barLabel, isSelected && styles.barLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Departments Card ── */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Phân bố theo Bộ phận/Phòng ban</Text>
        <View style={[styles.productList, { marginTop: spacing.md }]}>
          {data.departments.map((item, index) => {
            const colorsArray = [colors.primary, colors.success, colors.warning, colors.info, '#8b5cf6'];
            const itemColor = colorsArray[index % colorsArray.length];
            
            return (
              <View key={index} style={styles.productItem}>
                <View style={globalStyles.row}>
                  <View style={[styles.bullet, { backgroundColor: itemColor }]} />
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.productValue}>{item.count} ns</Text>
                  <Text style={styles.productPercent}>{Math.round(item.ratio * 100)}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Educations Card ── */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Trình độ học vấn</Text>
        <View style={[styles.productList, { marginTop: spacing.md }]}>
          {data.educations.map((item, index) => {
            const colorsArray = [colors.primary, colors.success, colors.warning, colors.info, '#10b981'];
            const itemColor = colorsArray[index % colorsArray.length];
            
            return (
              <View key={index} style={styles.productItem}>
                <View style={globalStyles.row}>
                  <View style={[styles.bullet, { backgroundColor: itemColor }]} />
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.productValue}>{item.count} ns</Text>
                  <Text style={styles.productPercent}>{Math.round(item.ratio * 100)}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Locations Card ── */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Nhân sự theo Địa bàn làm việc</Text>
        <View style={[styles.productList, { marginTop: spacing.md }]}>
          {data.locations.map((item, index) => {
            const colorsArray = [colors.primary, colors.success, colors.warning, colors.info, '#ec4899'];
            const itemColor = colorsArray[index % colorsArray.length];
            
            return (
              <View key={index} style={styles.productItem}>
                <View style={globalStyles.row}>
                  <View style={[styles.bullet, { backgroundColor: itemColor }]} />
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.productValue}>{item.count} ns</Text>
                  <Text style={styles.productPercent}>{Math.round(item.ratio * 100)}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  kpiContainer: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  kpiLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  kpiFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiSubText: {
    fontSize: 12,
    color: colors.textCaption,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textCaption,
  },
  tooltip: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 80,
    backgroundColor: '#334155',
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  chartArea: {
    flexDirection: 'row',
    height: 160,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    height: 130,
    width: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 11,
    color: colors.textCaption,
    marginTop: 6,
  },
  barLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  productList: {
    gap: spacing.sm + 2,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  productName: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
    maxWidth: SCREEN_WIDTH * 0.55,
  },
  productValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  productPercent: {
    fontSize: 11,
    color: colors.textCaption,
    marginTop: 2,
  }
});
