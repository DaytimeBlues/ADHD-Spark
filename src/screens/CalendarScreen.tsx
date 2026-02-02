import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Tokens } from '../theme/tokens';

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysArray = Array(daysInMonth).fill(0).map((_, i) => i + 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Calendar</Text>

          <View style={styles.header}>
            <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekdays}>
            {days.map(day => (
              <Text key={day} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {Array(firstDay).fill(0).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
            {daysArray.map(day => {
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayCell, isToday && styles.todayCell]}>
                  <Text style={[styles.dayText, isToday && styles.todayText]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.todayDot]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral[900],
  },
  webContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.content,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    padding: Tokens.spacing[16],
  },
  title: {
    fontSize: Tokens.type['3xl'],
    fontWeight: 'bold',
    color: Tokens.colors.neutral[0],
    marginBottom: Tokens.spacing[24],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing[24],
  },
  navButton: {
    padding: Tokens.spacing[8],
    minWidth: Tokens.layout.minTapTarget,
    minHeight: Tokens.layout.minTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type['4xl'],
    lineHeight: Tokens.type['4xl'], 
  },
  monthText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.xl,
    fontWeight: '600',
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing[8],
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    color: Tokens.colors.neutral[200],
    fontSize: Tokens.type.xs,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Tokens.layout.minTapTarget,
  },
  dayText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.sm,
  },
  todayCell: {
    backgroundColor: Tokens.colors.brand[600],
    borderRadius: Tokens.radii.xl,
  },
  todayText: {
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    marginTop: Tokens.spacing[24],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Tokens.spacing[24],
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: Tokens.radii.pill,
    marginRight: Tokens.spacing[8],
  },
  todayDot: {
    backgroundColor: Tokens.colors.brand[600],
  },
  legendText: {
    color: Tokens.colors.neutral[200],
    fontSize: Tokens.type.sm,
  },
});

export default CalendarScreen;
