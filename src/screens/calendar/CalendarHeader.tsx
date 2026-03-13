/**
 * CalendarHeader component
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { calendarStyles } from './calendarStyles';

interface CalendarHeaderProps {
  currentMonthName: string;
  currentYear: number;
  days: string[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonthName,
  currentYear,
  days,
  onPrevMonth,
  onNextMonth,
}) => {
  const { variant, t } = useTheme();
  const styles = calendarStyles(variant, t);

  return (
    <>
      <View style={styles.header}>
        <Pressable
          onPress={onPrevMonth}
          accessibilityLabel="Go to previous month"
          accessibilityHint="Navigates to the previous month"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.navButton,
            pressed && styles.navButtonPressed,
          ]}
        >
          <Text style={styles.navButtonText}>{'<'}</Text>
        </Pressable>
        <Text style={styles.monthText}>
          {currentMonthName.toUpperCase()} {currentYear}
        </Text>
        <Pressable
          onPress={onNextMonth}
          accessibilityHint="Navigates to the next month"
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.navButton,
            pressed && styles.navButtonPressed,
          ]}
        >
          <Text style={styles.navButtonText}>{'>'}</Text>
        </Pressable>
      </View>

      <View style={styles.weekdays}>
        {days.map((day) => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>
    </>
  );
};
