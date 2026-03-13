/**
 * CalendarScreen - Main calendar screen component
 */

import React from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { CosmicBackground, GlowCard } from '../ui/cosmic';
import { NightAweBackground } from '../ui/nightAwe';
import { calendarStyles } from './calendar/calendarStyles';
import { useCalendarMonth } from './calendar/useCalendarMonth';
import { useCalendarConnection } from './calendar/useCalendarConnection';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarGrid } from './calendar/CalendarGrid';
import { CalendarRationale } from './calendar/CalendarRationale';
import { GoogleCalendarConnection } from './calendar/GoogleCalendarConnection';

const CalendarScreen = () => {
  const { isCosmic, isNightAwe, variant, t } = useTheme();
  const styles = calendarStyles(variant, t);

  const {
    currentMonthName,
    currentYear,
    days,
    monthDays,
    emptyDays,
    prevMonth,
    nextMonth,
    getDateInfo,
  } = useCalendarMonth();

  const { statusText, buttonText, isButtonDisabled, handleConnect } =
    useCalendarConnection();

  const content = (
    <SafeAreaView
      style={styles.container}
      accessibilityLabel="Calendar screen"
      accessibilityRole="summary"
    >
      {isCosmic && (
        <CosmicBackground variant="moon" dimmer style={StyleSheet.absoluteFill}>
          {null}
        </CosmicBackground>
      )}
      <View style={styles.webContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>CALENDAR</Text>

            <CalendarRationale />

            <GlowCard glow="none" style={styles.calendarCard}>
              <CalendarHeader
                currentMonthName={currentMonthName}
                currentYear={currentYear}
                days={days}
                onPrevMonth={prevMonth}
                onNextMonth={nextMonth}
              />
              <CalendarGrid
                emptyDays={emptyDays}
                monthDays={monthDays}
                getDateInfo={getDateInfo}
              />
            </GlowCard>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>TODAY</Text>
              </View>
            </View>

            <GoogleCalendarConnection
              statusText={statusText}
              buttonText={buttonText}
              isButtonDisabled={isButtonDisabled}
              onConnect={handleConnect}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );

  if (isNightAwe) {
    return (
      <NightAweBackground
        variant="focus"
        activeFeature="calendar"
        motionMode="idle"
      >
        {content}
      </NightAweBackground>
    );
  }

  return content;
};

export default CalendarScreen;
