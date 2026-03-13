/**
 * CalendarGrid component
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { calendarStyles } from './calendarStyles';
import { CalendarDateInfo } from './calendarUtils';

interface CalendarGridProps {
  emptyDays: number[];
  monthDays: number[];
  getDateInfo: (day: number) => CalendarDateInfo;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  emptyDays,
  monthDays,
  getDateInfo,
}) => {
  const { variant, t } = useTheme();
  const styles = calendarStyles(variant, t);

  return (
    <View style={styles.daysGrid}>
      {emptyDays.map((_, i) => (
        <View key={`empty-${i}`} style={styles.dayCell} />
      ))}
      {monthDays.map((day) => {
        const { isToday: isTodayDate, dateLabel } = getDateInfo(day);
        return (
          <Pressable
            key={day}
            accessibilityLabel={`${dateLabel}${isTodayDate ? ', today' : ''}`}
            accessibilityRole="button"
            accessibilityState={{
              selected: false,
              disabled: false,
              checked: isTodayDate,
            }}
            accessibilityHint="Tap to view or add tasks for this date"
            style={({ pressed }) => [
              styles.dayCell,
              isTodayDate && styles.todayCell,
              pressed && !isTodayDate && styles.dayCellPressed,
            ]}
          >
            <Text style={[styles.dayText, isTodayDate && styles.todayText]}>
              {day}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
