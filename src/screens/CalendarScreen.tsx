import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native';
import { Tokens, useTheme } from '../theme/tokens';
import { CosmicBackground, GlowCard } from '../ui/cosmic';
import { GoogleTasksSyncService } from '../services/PlaudService';

type CalendarConnectionStatus =
  | 'checking'
  | 'connected'
  | 'disconnected'
  | 'unsupported';

const CalendarScreen = () => {
  const { isCosmic } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [connectionStatus, setConnectionStatus] =
    useState<CalendarConnectionStatus>('checking');
  const [isConnecting, setIsConnecting] = useState(false);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysArray = Array(daysInMonth)
    .fill(0)
    .map((_, i) => i + 1);

  const refreshCalendarConnectionStatus = useCallback(async () => {
    if (Platform.OS === 'web') {
      setConnectionStatus('unsupported');
      return;
    }

    try {
      const googleModule =
        require('@react-native-google-signin/google-signin') as {
          GoogleSignin?: {
            getCurrentUser?: () => Promise<{ scopes?: string[] } | null>;
          };
        };

      const user = await googleModule.GoogleSignin?.getCurrentUser?.();
      const hasCalendarScope = Boolean(
        user?.scopes?.includes(
          'https://www.googleapis.com/auth/calendar.events',
        ),
      );

      setConnectionStatus(hasCalendarScope ? 'connected' : 'disconnected');
    } catch {
      setConnectionStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    refreshCalendarConnectionStatus();
  }, [refreshCalendarConnectionStatus]);

  const handleConnectGoogleCalendar = useCallback(async () => {
    if (
      connectionStatus === 'unsupported' ||
      connectionStatus === 'checking' ||
      isConnecting
    ) {
      return;
    }

    setIsConnecting(true);
    try {
      await GoogleTasksSyncService.signInInteractive();
    } finally {
      await refreshCalendarConnectionStatus();
      setIsConnecting(false);
    }
  }, [connectionStatus, isConnecting, refreshCalendarConnectionStatus]);

  const statusTextByConnectionStatus: Record<CalendarConnectionStatus, string> =
    {
      checking: 'STATUS: CHECKING...',
      connected: 'STATUS: CONNECTED',
      disconnected: 'STATUS: NOT CONNECTED',
      unsupported: 'STATUS: NOT AVAILABLE ON WEB',
    };

  const buttonTextByConnectionStatus: Record<CalendarConnectionStatus, string> =
    {
      checking: 'CHECKING...',
      connected: 'CONNECTED',
      disconnected: 'CONNECT GOOGLE CALENDAR',
      unsupported: 'WEB UNSUPPORTED',
    };

  const isConnectButtonDisabled =
    connectionStatus === 'connected' ||
    connectionStatus === 'unsupported' ||
    connectionStatus === 'checking' ||
    isConnecting;

  return (
    <SafeAreaView style={[styles.container, isCosmic && styles.containerCosmic]}>
      <CosmicBackground variant="moon" dimmer style={StyleSheet.absoluteFill} />
      <View style={styles.webContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={[styles.title, isCosmic && styles.titleCosmic]}>CALENDAR</Text>

            <GlowCard glow="none" style={styles.rationaleCard}>
              <Text style={[styles.rationaleTitle, isCosmic && styles.rationaleTitleCosmic]}>WHY THIS WORKS</Text>
              <Text style={[styles.rationaleText, isCosmic && styles.rationaleTextCosmic]}>
                Externalizing time through visual calendars reduces ADHD time-blindness and improves prospective memory. Seeing commitments spatially helps with planning, transitions, and preventing double-booking. CBT emphasizes external structure as cognitive support.
              </Text>
            </GlowCard>

            <GlowCard glow="none" style={styles.calendarCard}>
              <View style={styles.header}>
                <Pressable
                  onPress={prevMonth}
                  style={({
                    pressed,
                    hovered,
                  }: {
                    pressed: boolean;
                    hovered?: boolean;
                  }) => [
                    styles.navButton,
                    isCosmic && styles.navButtonCosmic,
                    hovered && styles.navButtonHovered,
                    hovered && isCosmic && styles.navButtonHoveredCosmic,
                    pressed && styles.navButtonPressed,
                    pressed && isCosmic && styles.navButtonPressedCosmic,
                  ]}
                >
                  <Text style={[styles.navButtonText, isCosmic && styles.navButtonTextCosmic]}>‹</Text>
                </Pressable>
                <Text style={[styles.monthText, isCosmic && styles.monthTextCosmic]}>
                  {months[currentDate.getMonth()].toUpperCase()}{' '}
                  {currentDate.getFullYear()}
                </Text>
                <Pressable
                  onPress={nextMonth}
                  style={({
                    pressed,
                    hovered,
                  }: {
                    pressed: boolean;
                    hovered?: boolean;
                  }) => [
                    styles.navButton,
                    isCosmic && styles.navButtonCosmic,
                    hovered && styles.navButtonHovered,
                    hovered && isCosmic && styles.navButtonHoveredCosmic,
                    pressed && styles.navButtonPressed,
                    pressed && isCosmic && styles.navButtonPressedCosmic,
                  ]}
                >
                  <Text style={[styles.navButtonText, isCosmic && styles.navButtonTextCosmic]}>›</Text>
                </Pressable>
              </View>

              <View style={styles.weekdays}>
                {days.map((day) => (
                  <Text key={day} style={[styles.weekdayText, isCosmic && styles.weekdayTextCosmic]}>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.daysGrid}>
                {Array(firstDay)
                  .fill(0)
                  .map((_, i) => (
                    <View key={`empty-${i}`} style={[styles.dayCell, isCosmic && styles.dayCellCosmic]} />
                  ))}
                {daysArray.map((day) => {
                  const isToday =
                    day === new Date().getDate() &&
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear();
                  return (
                    <Pressable
                      key={day}
                      style={({
                        pressed,
                        hovered,
                      }: {
                        pressed: boolean;
                        hovered?: boolean;
                      }) => [
                        styles.dayCell,
                        isCosmic && styles.dayCellCosmic,
                        isToday && styles.todayCell,
                        isToday && isCosmic && styles.todayCellCosmic,
                        hovered && !isToday && styles.dayCellHovered,
                        hovered && !isToday && isCosmic && styles.dayCellHoveredCosmic,
                        pressed && !isToday && styles.dayCellPressed,
                        pressed && !isToday && isCosmic && styles.dayCellPressedCosmic,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isCosmic && styles.dayTextCosmic,
                          isToday && styles.todayText,
                          isToday && isCosmic && styles.todayTextCosmic,
                        ]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </GlowCard>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[
                  styles.legendDot,
                  styles.todayDot,
                  isCosmic && styles.todayDotCosmic,
                ]} />
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
                style={({
                  pressed,
                  hovered,
                }: {
                  pressed: boolean;
                  hovered?: boolean;
                }) => [
                  styles.googleCalendarButton,
                  isCosmic && styles.googleCalendarButtonCosmic,
                  hovered &&
                    !isConnectButtonDisabled &&
                    styles.googleCalendarButtonHovered,
                  hovered &&
                    !isConnectButtonDisabled &&
                    isCosmic &&
                    styles.googleCalendarButtonHoveredCosmic,
                  pressed &&
                    !isConnectButtonDisabled &&
                    styles.googleCalendarButtonPressed,
                  pressed &&
                    !isConnectButtonDisabled &&
                    isCosmic &&
                    styles.googleCalendarButtonPressedCosmic,
                  isConnectButtonDisabled &&
                    styles.googleCalendarButtonDisabled,
                  isConnectButtonDisabled &&
                    isCosmic &&
                    styles.googleCalendarButtonDisabledCosmic,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  webContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.content,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Tokens.spacing[8],
  },
  content: {
    padding: Tokens.spacing[6],
  },
  title: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.h1,
    fontWeight: '800',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[4],
    letterSpacing: 2,
  },
  rationaleCard: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    padding: Tokens.spacing[4],
    marginBottom: Tokens.spacing[6],
  },
  rationaleTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    color: Tokens.colors.brand[500],
    letterSpacing: 1,
    marginBottom: Tokens.spacing[2],
    textTransform: 'uppercase',
  },
  rationaleText: {
    fontFamily: Tokens.type.fontFamily.body,
    fontSize: Tokens.type.sm,
    color: Tokens.colors.text.secondary,
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  calendarCard: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.none, // Sharp
    padding: Tokens.spacing[6],
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Tokens.elevation.none,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing[8],
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: Tokens.radii.none, // Sharp
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Tokens.colors.neutral.dark,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: {
        transition: Tokens.motion.transitions.base,
        cursor: 'pointer',
      },
    }),
  },
  navButtonHovered: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderColor: Tokens.colors.text.tertiary,
    transform: [{ scale: 1.05 }],
  },
  navButtonPressed: {
    transform: [{ scale: Tokens.motion.scales.press }],
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  navButtonText: {
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.h2,
    lineHeight: Tokens.type.h2 * 1.2,
    fontWeight: '300',
    marginTop: -2,
  },
  monthText: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.xl,
    fontWeight: '700',
    letterSpacing: 1,
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing[4],
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    borderRadius: Tokens.radii.none, // Sharp
    borderWidth: 1,
    borderColor: 'transparent',
    ...Platform.select({
      web: {
        transition: Tokens.motion.transitions.fast,
      },
    }),
  },
  dayCellHovered: {
    backgroundColor: Tokens.colors.neutral.dark,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  dayCellPressed: {
    backgroundColor: Tokens.colors.neutral.darkest,
    transform: [{ scale: Tokens.motion.scales.press }],
  },
  dayText: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.secondary,
    fontSize: Tokens.type.base,
    fontWeight: '500',
  },
  todayCell: {
    backgroundColor: Tokens.colors.brand[600],
    ...Tokens.elevation.none,
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 0',
      },
    }),
  },
  todayText: {
    color: Tokens.colors.neutral[0],
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    marginTop: Tokens.spacing[6],
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 0, // Sharp
    marginRight: Tokens.spacing[2],
  },
  todayDot: {
    backgroundColor: Tokens.colors.brand[600],
  },
  legendText: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  googleCalendarCard: {
    marginTop: Tokens.spacing[6],
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.none,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    padding: Tokens.spacing[6],
    ...Tokens.elevation.none,
  },
  googleCalendarTitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Tokens.spacing[3],
  },
  googleCalendarStatus: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Tokens.spacing[4],
  },
  googleCalendarButton: {
    minHeight: Tokens.layout.minTapTarget,
    paddingHorizontal: Tokens.spacing[4],
    backgroundColor: Tokens.colors.neutral.dark,
    borderRadius: Tokens.radii.none,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        transition: Tokens.motion.transitions.base,
        cursor: 'pointer',
      },
    }),
  },
  googleCalendarButtonHovered: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderColor: Tokens.colors.text.tertiary,
  },
  googleCalendarButtonPressed: {
    transform: [{ scale: Tokens.motion.scales.press }],
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  googleCalendarButtonDisabled: {
    backgroundColor: Tokens.colors.neutral.darkest,
    borderColor: Tokens.colors.neutral.borderSubtle,
    opacity: 0.5,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
    }),
  },
  googleCalendarButtonText: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  // Cosmic theme overrides
  containerCosmic: {
    backgroundColor: 'transparent',
  },
  titleCosmic: {
    color: '#EEF2FF',
  },
  rationaleTitleCosmic: {
    color: '#8B5CF6',
  },
  rationaleTextCosmic: {
    color: '#EEF2FF',
  },
  navButtonCosmic: {
    backgroundColor: 'rgba(42, 53, 82, 0.3)',
    borderColor: 'rgba(42, 53, 82, 0.5)',
    borderRadius: 8,
  },
  navButtonHoveredCosmic: {
    backgroundColor: 'rgba(42, 53, 82, 0.5)',
    borderColor: '#8B5CF6',
  },
  navButtonPressedCosmic: {
    backgroundColor: 'rgba(42, 53, 82, 0.7)',
  },
  navButtonTextCosmic: {
    color: '#EEF2FF',
  },
  monthTextCosmic: {
    color: '#EEF2FF',
  },
  weekdayTextCosmic: {
    color: '#8B5CF6',
  },
  dayCellCosmic: {
    borderColor: 'rgba(42, 53, 82, 0.3)',
  },
  dayCellHoveredCosmic: {
    backgroundColor: 'rgba(42, 53, 82, 0.3)',
    borderColor: '#8B5CF6',
  },
  dayCellPressedCosmic: {
    backgroundColor: 'rgba(42, 53, 82, 0.5)',
  },
  dayTextCosmic: {
    color: '#EEF2FF',
  },
  todayCellCosmic: {
    backgroundColor: '#F6C177',
    borderColor: '#F6C177',
  },
  todayTextCosmic: {
    color: '#0F172A',
  },
  todayDotCosmic: {
    backgroundColor: '#F6C177',
  },
  legendTextCosmic: {
    color: '#EEF2FF',
  },
  googleCalendarTitleCosmic: {
    color: '#EEF2FF',
  },
  googleCalendarStatusCosmic: {
    color: '#8B5CF6',
  },
  googleCalendarButtonCosmic: {
    backgroundColor: 'rgba(42, 53, 82, 0.3)',
    borderColor: 'rgba(42, 53, 82, 0.5)',
    borderRadius: 8,
  },
  googleCalendarButtonHoveredCosmic: {
    backgroundColor: 'rgba(42, 53, 82, 0.5)',
    borderColor: '#8B5CF6',
  },
  googleCalendarButtonPressedCosmic: {
    backgroundColor: 'rgba(42, 53, 82, 0.7)',
  },
  googleCalendarButtonDisabledCosmic: {
    backgroundColor: 'rgba(42, 53, 82, 0.2)',
    borderColor: 'rgba(42, 53, 82, 0.3)',
  },
  googleCalendarButtonTextCosmic: {
    color: '#EEF2FF',
  },
});

export default CalendarScreen;
