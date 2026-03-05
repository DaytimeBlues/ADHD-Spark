import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { CosmicBackground, GlowCard } from '../ui/cosmic';
import { useCalendar } from '../hooks/useCalendar';
import {
  RationaleCard,
  CalendarHeader,
  WeekdaysHeader,
  DaysGrid,
} from '../components/calendar/CalendarComponents';
import { styles } from './CalendarStyles';

const CalendarScreen = () => {
  const { isCosmic } = useTheme();
  const {
    currentDate,
    connectionStatus,
    daysArray,
    firstDay,
    prevMonth,
    nextMonth,
    handleConnectGoogleCalendar,
    statusTextByConnectionStatus,
    buttonTextByConnectionStatus,
    isConnectButtonDisabled,
  } = useCalendar();

  return (
    <SafeAreaView style={[styles.container, isCosmic && styles.containerCosmic]}>
      <CosmicBackground variant="moon" dimmer style={StyleSheet.absoluteFill}>{null}</CosmicBackground>
      <View style={styles.webContainer}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={[styles.title, isCosmic && styles.titleCosmic]}>CALENDAR</Text>

            <RationaleCard isCosmic={isCosmic} styles={styles} />

            <GlowCard glow="none" style={styles.calendarCard}>
              <CalendarHeader
                currentDate={currentDate}
                prevMonth={prevMonth}
                nextMonth={nextMonth}
                isCosmic={isCosmic}
                styles={styles}
              />
              <WeekdaysHeader isCosmic={isCosmic} styles={styles} />
              <DaysGrid
                firstDay={firstDay}
                daysArray={daysArray}
                currentDate={currentDate}
                isCosmic={isCosmic}
                styles={styles}
              />
            </GlowCard>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.todayDot, isCosmic && styles.todayDotCosmic]} />
                <Text style={[styles.legendText, isCosmic && styles.legendTextCosmic]}>TODAY</Text>
              </View>
            </View>

            <GlowCard glow="none" style={styles.googleCalendarCard}>
              <Text style={[styles.googleCalendarTitle, isCosmic && styles.googleCalendarTitleCosmic]}>GOOGLE CALENDAR</Text>
              <Text style={[styles.googleCalendarStatus, isCosmic && styles.googleCalendarStatusCosmic]}>
                {statusTextByConnectionStatus[connectionStatus]}
              </Text>
              <Pressable
                onPress={handleConnectGoogleCalendar}
                disabled={isConnectButtonDisabled}
                style={({ pressed, hovered }: any) => [
                  styles.googleCalendarButton,
                  isCosmic && styles.googleCalendarButtonCosmic,
                  hovered && !isConnectButtonDisabled && styles.googleCalendarButtonHovered,
                  hovered && !isConnectButtonDisabled && isCosmic && styles.googleCalendarButtonHoveredCosmic,
                  pressed && !isConnectButtonDisabled && styles.googleCalendarButtonPressed,
                  pressed && !isConnectButtonDisabled && isCosmic && styles.googleCalendarButtonPressedCosmic,
                  isConnectButtonDisabled && styles.googleCalendarButtonDisabled,
                  isConnectButtonDisabled && isCosmic && styles.googleCalendarButtonDisabledCosmic,
                ]}
              >
                <Text style={[styles.googleCalendarButtonText, isCosmic && styles.googleCalendarButtonTextCosmic]}>
                  {buttonTextByConnectionStatus[connectionStatus]}
                </Text>
              </Pressable>
            </GlowCard>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CalendarScreen;
