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
import { Tokens } from '../theme/tokens';
import { GoogleTasksSyncService } from '../services/PlaudService';

type CalendarConnectionStatus =
  | 'checking'
  | 'connected'
  | 'disconnected'
  | 'unsupported';

const CalendarScreen = () => {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.webContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>CALENDAR</Text>

            <View style={styles.calendarCard}>
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
                    hovered && styles.navButtonHovered,
                    pressed && styles.navButtonPressed,
                  ]}
                >
                  <Text style={styles.navButtonText}>‹</Text>
                </Pressable>
                <Text style={styles.monthText}>
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
                    hovered && styles.navButtonHovered,
                    pressed && styles.navButtonPressed,
                  ]}
                >
                  <Text style={styles.navButtonText}>›</Text>
                </Pressable>
              </View>

              <View style={styles.weekdays}>
                {days.map((day) => (
                  <Text key={day} style={styles.weekdayText}>
                    {day}
                  </Text>
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
                        isToday && styles.todayCell,
                        hovered && !isToday && styles.dayCellHovered,
                        pressed && !isToday && styles.dayCellPressed,
                      ]}
                    >
                      <Text
                        style={[styles.dayText, isToday && styles.todayText]}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.todayDot]} />
                <Text style={styles.legendText}>TODAY</Text>
              </View>
            </View>

            <View style={styles.googleCalendarCard}>
              <Text style={styles.googleCalendarTitle}>GOOGLE CALENDAR</Text>
              <Text style={styles.googleCalendarStatus}>
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
                  hovered &&
                    !isConnectButtonDisabled &&
                    styles.googleCalendarButtonHovered,
                  pressed &&
                    !isConnectButtonDisabled &&
                    styles.googleCalendarButtonPressed,
                  isConnectButtonDisabled &&
                    styles.googleCalendarButtonDisabled,
                ]}
              >
                <Text style={styles.googleCalendarButtonText}>
                  {buttonTextByConnectionStatus[connectionStatus]}
                </Text>
              </Pressable>
            </View>
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
    marginBottom: Tokens.spacing[6],
    letterSpacing: 2,
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
});

export default CalendarScreen;
