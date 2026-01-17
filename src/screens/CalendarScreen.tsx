import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Screen from "../components/ui/Screen";
import ScreenHeader from "../components/ui/ScreenHeader";
import Card from "../components/ui/Card";
import AppText from "../components/ui/AppText";
import Button from "../components/ui/Button";
import { colors, spacing, radius } from "../theme";

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysArray = Array(daysInMonth)
    .fill(0)
    .map((_, i) => i + 1);

  return (
    <Screen>
      <ScreenHeader title="Calendar" />

      <Card style={styles.calendarCard}>
        <View style={styles.header}>
          <Button
            label="‹"
            variant="ghost"
            size="md"
            onPress={prevMonth}
            style={styles.navButton}
          />
          <AppText variant="sectionTitle" style={styles.monthText}>
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </AppText>
          <Button
            label="›"
            variant="ghost"
            size="md"
            onPress={nextMonth}
            style={styles.navButton}
          />
        </View>

        <View style={styles.weekdays}>
          {days.map((day) => (
            <AppText key={day} variant="smallMuted" style={styles.weekdayText}>
              {day}
            </AppText>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {Array(firstDay)
            .fill(0)
            .map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}
          {daysArray.map((day) => {
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();
            return (
              <TouchableOpacity
                key={day}
                activeOpacity={0.7}
                style={[styles.dayCell, isToday && styles.todayCell]}
              >
                <AppText
                  style={[styles.dayText, isToday && styles.todayText]}
                >
                  {day}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.todayDot]} />
          <AppText variant="smallMuted">Today</AppText>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  calendarCard: {
    padding: spacing[12],
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[24],
  },
  navButton: {
    width: 44,
    height: 44,
  },
  monthText: {
    fontSize: 18,
  },
  weekdays: {
    flexDirection: "row",
    marginBottom: spacing[12],
    paddingHorizontal: spacing[4],
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius.md,
  },
  dayText: {
    fontSize: 14,
  },
  todayCell: {
    backgroundColor: colors.accent,
  },
  todayText: {
    fontWeight: "bold",
  },
  legend: {
    flexDirection: "row",
    marginTop: spacing[24],
    paddingHorizontal: spacing[8],
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing[8],
  },
  todayDot: {
    backgroundColor: colors.accent,
  },
});

export default CalendarScreen;
