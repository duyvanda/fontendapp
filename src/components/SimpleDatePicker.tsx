import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, globalStyles } from '@/styles/global';

interface SimpleDatePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (dateStr: string) => void;
  currentDateStr?: string; // Format: YYYY-MM-DD
}

const MONTH_NAMES = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function SimpleDatePicker({ visible, onClose, onSelect, currentDateStr }: SimpleDatePickerProps) {
  const initialDate = useMemo(() => {
    if (currentDateStr) {
      const parts = currentDateStr.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
    return new Date();
  }, [currentDateStr, visible]);

  const [displayDate, setDisplayDate] = useState<Date>(initialDate);

  // Cập nhật displayDate mỗi khi mở modal
  useEffect(() => {
    if (visible) {
      setDisplayDate(initialDate);
    }
  }, [visible, initialDate]);

  const currentMonth = displayDate.getMonth();
  const currentYear = displayDate.getFullYear();

  const handlePrevMonth = () => {
    setDisplayDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const generateDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    
    const days = [];
    
    // Empty slots for previous month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    
    // Actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const calendarDays = generateDays();

  const handleSelectDay = (day: number) => {
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    onSelect(`${currentYear}-${monthStr}-${dayStr}`);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose} statusBarTranslucent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <Text style={styles.monthText}>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </Text>
            
            <TouchableOpacity onPress={handleNextMonth} style={styles.arrowBtn}>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Days of Week */}
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((day, idx) => (
              <Text key={idx} style={styles.dayOfWeekText}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.grid}>
            {calendarDays.map((day, idx) => {
              const isSelected = day !== null && 
                                 initialDate.getDate() === day && 
                                 initialDate.getMonth() === currentMonth && 
                                 initialDate.getFullYear() === currentYear;
              
              return (
                <View key={idx} style={styles.cellContainer}>
                  {day !== null && (
                    <TouchableOpacity 
                      style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                      onPress={() => handleSelectDay(day)}
                    >
                      <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={globalStyles.btnSecondary} onPress={onClose}>
              <Text style={globalStyles.btnSecondaryText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  arrowBtn: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  daysRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellContainer: {
    width: '14.28%', // 100% / 7
    aspectRatio: 1,
    padding: 2,
  },
  dayCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedDayCell: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
  },
});
