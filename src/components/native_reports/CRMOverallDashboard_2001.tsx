import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, globalStyles } from '@/styles/global';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Mock Data ───────────────────────────────────────────────────────────────
const WEEKLY_DATA = {
  kpis: [
    { label: 'Doanh thu', value: '185.4M', kpi: 'Mục tiêu: 200M', percent: 92.7, color: colors.primary, icon: 'cash-outline' },
    { label: 'Khách hàng mới', value: '42', kpi: 'Tăng 12% vs tuần trước', percent: 112, color: colors.success, icon: 'people-outline' },
    { label: 'Tỉ lệ viếng thăm', value: '88%', kpi: 'Chỉ tiêu: 90%', percent: 97.7, color: colors.warning, icon: 'footsteps-outline' }
  ],
  chart: [
    { label: 'Th 2', value: 24.5 },
    { label: 'Th 3', value: 42.1 },
    { label: 'Th 4', value: 31.8 },
    { label: 'Th 5', value: 55.4 },
    { label: 'Th 6', value: 21.2 },
    { label: 'Th 7', value: 10.4 }
  ],
  products: [
    { name: 'Kháng sinh Amoxicillin 500mg', sales: '82.4M', ratio: 0.44 },
    { name: 'Siro Ho thảo dược Merap', sales: '55.1M', ratio: 0.30 },
    { name: 'Xịt mũi Sea Alga', sales: '31.2M', ratio: 0.17 },
    { name: 'Vitamin C Zinc', sales: '16.7M', ratio: 0.09 }
  ]
};

const MONTHLY_DATA = {
  kpis: [
    { label: 'Doanh thu', value: '812.9M', kpi: 'Mục tiêu: 850M', percent: 95.6, color: colors.primary, icon: 'cash-outline' },
    { label: 'Khách hàng mới', value: '168', kpi: 'Tăng 18% vs tháng trước', percent: 118, color: colors.success, icon: 'people-outline' },
    { label: 'Tỉ lệ viếng thăm', value: '92%', kpi: 'Chỉ tiêu: 90%', percent: 102.2, color: colors.warning, icon: 'footsteps-outline' }
  ],
  chart: [
    { label: 'T1', value: 120 },
    { label: 'T2', value: 145 },
    { label: 'T3', value: 135 },
    { label: 'T4', value: 180 },
    { label: 'T5', value: 155 },
    { label: 'T6', value: 177 }
  ],
  products: [
    { name: 'Kháng sinh Amoxicillin 500mg', sales: '357.6M', ratio: 0.44 },
    { name: 'Siro Ho thảo dược Merap', sales: '243.8M', ratio: 0.30 },
    { name: 'Xịt mũi Sea Alga', sales: '138.2M', ratio: 0.17 },
    { name: 'Vitamin C Zinc', sales: '73.3M', ratio: 0.09 }
  ]
};

export default function CRMOverallDashboard_2001() {
  const [time_tab, set_time_tab] = useState<'week' | 'month'>('week');
  const [selected_bar, set_selected_bar] = useState<number | null>(null);
  
  const data = time_tab === 'week' ? WEEKLY_DATA : MONTHLY_DATA;
  const max_chart_value = Math.max(...data.chart.map(d => d.value));

  // Animating values
  const tooltip_opacity = useRef(new Animated.Value(0)).current;
  const tooltip_translate_x = useRef(new Animated.Value(0)).current;

  const handle_bar_press = (val: number, index: number, total_bars: number) => {
    set_selected_bar(index);
    
    // Calculate approximate position of the tooltip
    const containerWidth = SCREEN_WIDTH - spacing.md * 2 - 32; // total chart container width minus padding
    const barWidth = containerWidth / total_bars;
    const targetX = (index * barWidth) + (barWidth / 2) - 40; // 40 is half of tooltip width (80)

    Animated.parallel([
      Animated.timing(tooltip_opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.spring(tooltip_translate_x, { toValue: targetX, friction: 6, useNativeDriver: true })
    ]).start();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
      {/* ── Time Tab Filter ── */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tabBtn, time_tab === 'week' && styles.tabBtnActive]} 
          onPress={() => {
            set_time_tab('week');
            set_selected_bar(null);
            tooltip_opacity.setValue(0);
          }}
        >
          <Text style={[styles.tabText, time_tab === 'week' && styles.tabTextActive]}>Tuần này</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, time_tab === 'month' && styles.tabBtnActive]} 
          onPress={() => {
            set_time_tab('month');
            set_selected_bar(null);
            tooltip_opacity.setValue(0);
          }}
        >
          <Text style={[styles.tabText, time_tab === 'month' && styles.tabTextActive]}>Tháng này</Text>
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
            
            {/* Custom Horizontal Progress Bar */}
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
              <Text style={[styles.kpiPercentText, { color: kpi.color }]}>{kpi.percent}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Custom Native Chart (Bar) ── */}
      <View style={styles.chartCard}>
        <View style={globalStyles.rowBetween}>
          <Text style={styles.cardTitle}>Xu hướng doanh số</Text>
          <Text style={styles.cardSubtitle}>(VND triệu)</Text>
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
              {selected_bar !== null ? `${data.chart[selected_bar].value}M` : ''}
            </Text>
          </Animated.View>
        </View>

        {/* Chart Bars */}
        <View style={styles.chartArea}>
          {data.chart.map((item, index) => {
            const barHeight = (item.value / max_chart_value) * 130;
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

      {/* ── Product Share (Horizontal Stacked Bars) ── */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Cơ cấu sản phẩm chính</Text>
        <View style={styles.productTrack}>
          {data.products.map((item, index) => {
            const colorsArray = [colors.primary, colors.success, colors.warning, colors.info];
            const itemColor = colorsArray[index % colorsArray.length];
            return (
              <View 
                key={index}
                style={{ 
                  height: 12, 
                  flex: item.ratio,
                  backgroundColor: itemColor,
                  borderTopLeftRadius: index === 0 ? 6 : 0,
                  borderBottomLeftRadius: index === 0 ? 6 : 0,
                  borderTopRightRadius: index === data.products.length - 1 ? 6 : 0,
                  borderBottomRightRadius: index === data.products.length - 1 ? 6 : 0,
                  marginRight: index === data.products.length - 1 ? 0 : 2
                }}
              />
            );
          })}
        </View>

        {/* Product Details List */}
        <View style={styles.productList}>
          {data.products.map((item, index) => {
            const colorsArray = [colors.primary, colors.success, colors.warning, colors.info];
            const itemColor = colorsArray[index % colorsArray.length];
            
            return (
              <View key={index} style={styles.productItem}>
                <View style={globalStyles.row}>
                  <View style={[styles.bullet, { backgroundColor: itemColor }]} />
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.productValue}>{item.sales}</Text>
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
  kpiPercentText: {
    fontSize: 12,
    fontWeight: '700',
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
  },
  tooltipText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
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
  productTrack: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  productList: {
    gap: spacing.sm,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
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
    fontWeight: '600',
    color: colors.textPrimary,
  },
  productPercent: {
    fontSize: 11,
    color: colors.textCaption,
  }
});
