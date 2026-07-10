import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, globalStyles } from '@/styles/global';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Mock Data ───────────────────────────────────────────────────────────────
const TODAY_DATA = {
  kpis: [
    { label: 'Giao đúng giờ (OTD)', value: '96.2%', kpi: 'Chỉ tiêu: 95.0%', percent: 96.2, color: colors.success, icon: 'time-outline' },
    { label: 'Tổng số đơn giao', value: '348', kpi: 'Trễ hẹn: 13 đơn', percent: 95, color: colors.primary, icon: 'document-text-outline' },
    { label: 'T.gian giao TB', value: '2.4 hrs', kpi: 'Mục tiêu: < 3.0 hrs', percent: 80, color: colors.info, icon: 'speedometer-outline' }
  ],
  steps: [
    { label: 'Xử lý đơn hàng', time: '18 phút', ratio: 0.15, status: 'Đạt' },
    { label: 'Đóng gói & Chuẩn bị', time: '35 phút', ratio: 0.25, status: 'Đạt' },
    { label: 'Vận chuyển nội thành', time: '55 phút', ratio: 0.40, status: 'Đạt' },
    { label: 'Bàn giao khách hàng', time: '20 phút', ratio: 0.20, status: 'Đạt' }
  ],
  regions: [
    { label: 'Miền Bắc', onTime: 120, delayed: 4 },
    { label: 'Miền Trung', onTime: 65, delayed: 3 },
    { label: 'Miền Nam', onTime: 145, delayed: 5 },
    { label: 'Miền Tây', onTime: 38, delayed: 1 }
  ]
};

const MONTHLY_DATA = {
  kpis: [
    { label: 'Giao đúng giờ (OTD)', value: '95.8%', kpi: 'Chỉ tiêu: 95.0%', percent: 95.8, color: colors.success, icon: 'time-outline' },
    { label: 'Tổng số đơn giao', value: '8,450', kpi: 'Trễ hẹn: 355 đơn', percent: 92, color: colors.primary, icon: 'document-text-outline' },
    { label: 'T.gian giao TB', value: '2.6 hrs', kpi: 'Mục tiêu: < 3.0 hrs', percent: 86.6, color: colors.info, icon: 'speedometer-outline' }
  ],
  steps: [
    { label: 'Xử lý đơn hàng', time: '22 phút', ratio: 0.18, status: 'Đạt' },
    { label: 'Đóng gói & Chuẩn bị', time: '42 phút', ratio: 0.28, status: 'Trễ nhẹ' },
    { label: 'Vận chuyển nội thành', time: '58 phút', ratio: 0.38, status: 'Đạt' },
    { label: 'Bàn giao khách hàng', time: '25 phút', ratio: 0.16, status: 'Đạt' }
  ],
  regions: [
    { label: 'Miền Bắc', onTime: 2850, delayed: 120 },
    { label: 'Miền Trung', onTime: 1420, delayed: 70 },
    { label: 'Miền Nam', onTime: 3200, delayed: 145 },
    { label: 'Miền Tây', onTime: 980, delayed: 20 }
  ]
};

export default function DeliveryPerformance_2002() {
  const [time_tab, set_time_tab] = useState<'today' | 'month'>('today');
  const [selected_bar, set_selected_bar] = useState<number | null>(null);

  const data = time_tab === 'today' ? TODAY_DATA : MONTHLY_DATA;
  const max_total_orders = Math.max(...data.regions.map(r => r.onTime + r.delayed));

  // Animating values
  const tooltip_opacity = useRef(new Animated.Value(0)).current;
  const tooltip_translate_x = useRef(new Animated.Value(0)).current;

  const handle_bar_press = (onTime: number, delayed: number, index: number, total_bars: number) => {
    set_selected_bar(index);

    const containerWidth = SCREEN_WIDTH - spacing.md * 2 - 32;
    const barWidth = containerWidth / total_bars;
    const targetX = (index * barWidth) + (barWidth / 2) - 50; // 50 is half of tooltip width (100)

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
          style={[styles.tabBtn, time_tab === 'today' && styles.tabBtnActive]} 
          onPress={() => {
            set_time_tab('today');
            set_selected_bar(null);
            tooltip_opacity.setValue(0);
          }}
        >
          <Text style={[styles.tabText, time_tab === 'today' && styles.tabTextActive]}>Hôm nay</Text>
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

      {/* ── Delivery Steps (Horizontal Timeline Bottleneck Chart) ── */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Thời gian trung bình từng khâu</Text>
        <Text style={[styles.cardSubtitle, { marginBottom: spacing.md }]}>Phân tích chuỗi cung ứng</Text>

        <View style={styles.stepList}>
          {data.steps.map((step, index) => {
            const isDelayed = step.status !== 'Đạt';
            return (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepLabel}>{step.label}</Text>
                  <Text style={[styles.stepValue, isDelayed && { color: colors.error }]}>{step.time}</Text>
                </View>
                
                <View style={styles.progressTrack}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${step.ratio * 100}%`, 
                        backgroundColor: isDelayed ? colors.error : colors.info 
                      }
                    ]} 
                  />
                </View>
                
                <View style={globalStyles.rowBetween}>
                  <Text style={styles.kpiSubText}>Khâu {index + 1}</Text>
                  <Text style={[styles.stepStatus, { color: isDelayed ? colors.error : colors.success }]}>
                    {step.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Region Bar Chart (Stacked Bar Chart) ── */}
      <View style={styles.chartCard}>
        <View style={globalStyles.rowBetween}>
          <Text style={styles.cardTitle}>Giao hàng theo khu vực</Text>
          <Text style={styles.cardSubtitle}>(Số đơn)</Text>
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
              {selected_bar !== null ? `Đúng: ${data.regions[selected_bar].onTime} | Trễ: ${data.regions[selected_bar].delayed}` : ''}
            </Text>
          </Animated.View>
        </View>

        {/* Stacked Chart Bars */}
        <View style={styles.chartArea}>
          {data.regions.map((item, index) => {
            const total = item.onTime + item.delayed;
            const onTimeHeight = (item.onTime / max_total_orders) * 130;
            const delayedHeight = (item.delayed / max_total_orders) * 130;
            const isSelected = selected_bar === index;
            
            return (
              <TouchableOpacity 
                key={index} 
                activeOpacity={0.8}
                style={styles.chartColumn}
                onPress={() => handle_bar_press(item.onTime, item.delayed, index, data.regions.length)}
              >
                <View style={styles.barTrack}>
                  {/* Delayed component on top of Stack */}
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: delayedHeight,
                        backgroundColor: colors.error,
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0
                      }
                    ]} 
                  />
                  {/* OnTime component below */}
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: onTimeHeight,
                        backgroundColor: isSelected ? colors.primaryDark : colors.success,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.barLabel, isSelected && styles.barLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={[globalStyles.row, { justifyContent: 'center', gap: 24, marginTop: spacing.md }]}>
          <View style={globalStyles.row}>
            <View style={[styles.legendBullet, { backgroundColor: colors.success }]} />
            <Text style={styles.kpiSubText}>Đúng hẹn</Text>
          </View>
          <View style={globalStyles.row}>
            <View style={[styles.legendBullet, { backgroundColor: colors.error }]} />
            <Text style={styles.kpiSubText}>Trễ hẹn</Text>
          </View>
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
  stepList: {
    gap: spacing.md,
  },
  stepItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
  },
  stepInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  stepValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.info,
  },
  stepStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  tooltip: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 100,
    backgroundColor: '#334155',
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
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
  legendBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  }
});
