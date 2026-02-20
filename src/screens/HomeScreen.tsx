import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  Platform,
  Animated,
  Easing,
  AppState,
  AppStateStatus,
  AccessibilityInfo,
  TouchableOpacity,
  NativeModules,
  Share,
} from 'react-native';
import OverlayService from '../services/OverlayService';
import StorageService from '../services/StorageService';
import ActivationService, {
  ActivationDailyTrendPoint,
  ActivationSummary,
} from '../services/ActivationService';
import RetentionService from '../services/RetentionService';
import { ReentryPromptLevel } from '../services/RetentionService';
import useReducedMotion from '../hooks/useReducedMotion';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import ModeCard, { ModeCardMode } from '../components/home/ModeCard';
import { ReEntryPrompt } from '../components/ui/ReEntryPrompt';
import { ROUTES } from '../navigation/routes';
import { CosmicBackground, GlowCard, RuneButton } from '../ui/cosmic';

const ANIMATION_DURATION = 300; // Faster
const ANIMATION_STAGGER = 50; // Faster
const ENTRANCE_OFFSET_Y = 15; // Subtle slide

type NavigatorState = {
  routeNames?: string[];
};

type Mode = { id: string } & ModeCardMode;

type NavigationNode = {
  navigate: (routeName: string) => void;
  getState?: () => NavigatorState | undefined;
  getParent?: () => NavigationNode | undefined;
};

type OverlayEvent = {
  id: string;
  timestamp: number;
  label: string;
};

const HomeScreen = ({ navigation }: { navigation: NavigationNode }) => {
  const { isCosmic, t } = useTheme();
  const [streak, setStreak] = useState(0);
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(false);
  const [isOverlayPermissionRequesting, setIsOverlayPermissionRequesting] =
    useState(false);
  const [overlayEvents, setOverlayEvents] = useState<OverlayEvent[]>([]);
  const [activationSummary, setActivationSummary] =
    useState<ActivationSummary | null>(null);
  const [activationTrend, setActivationTrend] = useState<
    ActivationDailyTrendPoint[]
  >([]);
  const [reentryPromptLevel, setReentryPromptLevel] =
    useState<ReentryPromptLevel>('none');
  const prefersReducedMotion = useReducedMotion();

  const trendMetrics = useMemo(() => {
    if (activationTrend.length === 0) {
      return null;
    }
    const today = activationTrend[activationTrend.length - 1];
    const yesterday =
      activationTrend.length > 1
        ? activationTrend[activationTrend.length - 2]
        : null;
    const maxStarted = Math.max(...activationTrend.map((d) => d.started));

    const todayCount = today.started;
    const yesterdayCount = yesterday ? yesterday.started : 0;
    const delta = todayCount - yesterdayCount;
    const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
    const isPositive = delta > 0;
    const isNeutral = delta === 0;

    return {
      todayCount,
      deltaStr,
      isPositive,
      isNeutral,
      maxStarted,
    };
  }, [activationTrend]);

  const addOverlayEvent = useCallback((label: string) => {
    if (!__DEV__) {
      return;
    }
    setOverlayEvents((prev) => {
      const newEvent = {
        id: Date.now().toString() + Math.random(),
        timestamp: Date.now(),
        label,
      };
      return [newEvent, ...prev].slice(0, 5);
    });
  }, []);

  const handleCopyDiagnostics = useCallback(async () => {
    if (!__DEV__) {
      return;
    }

    const diagnostics = [
      `overlay_enabled=${isOverlayEnabled ? 'yes' : 'no'}`,
      `permission_requesting=${isOverlayPermissionRequesting ? 'yes' : 'no'}`,
      ...overlayEvents.map((event) => {
        return `${new Date(event.timestamp).toISOString()} ${event.label}`;
      }),
    ].join('\n');

    try {
      const clipboardModule = NativeModules.Clipboard as
        | { setString?: (value: string) => void }
        | undefined;

      if (clipboardModule?.setString) {
        clipboardModule.setString(diagnostics);
        addOverlayEvent('Diagnostics copied');
        AccessibilityInfo.announceForAccessibility(
          'Overlay diagnostics copied to clipboard',
        );
        return;
      }

      await Share.share({
        title: 'Overlay diagnostics',
        message: diagnostics,
      });
      addOverlayEvent('Diagnostics shared');
      AccessibilityInfo.announceForAccessibility('Overlay diagnostics shared');
    } catch (error) {
      console.warn('Failed to export diagnostics:', error);
      addOverlayEvent('Diagnostics export failed');
      AccessibilityInfo.announceForAccessibility(
        'Overlay diagnostics export failed',
      );
    }
  }, [
    addOverlayEvent,
    isOverlayEnabled,
    isOverlayPermissionRequesting,
    overlayEvents,
  ]);

  const cardWidth = '49%'; // Tighter grid

  const modes = useMemo<Mode[]>(
    () => [
      {
        id: 'resume',
        name: 'Resume',
        icon: 'play-circle',
        desc: 'CONTINUE',
        accent: Tokens.colors.brand[500],
      },
      {
        id: 'ignite',
        name: 'Ignite',
        icon: 'fire',
        desc: 'START TASKS',
        accent: Tokens.colors.brand[500],
      },
      {
        id: 'fogcutter',
        name: 'Fog Cutter',
        icon: 'weather-windy',
        desc: 'BREAK IT DOWN',
        accent: Tokens.colors.brand[500],
      },
      {
        id: 'pomodoro',
        name: 'Pomodoro',
        icon: 'timer-sand',
        desc: 'STAY ON TRACK',
        accent: Tokens.colors.brand[500],
      },
      {
        id: 'anchor',
        name: 'Anchor',
        icon: 'anchor',
        desc: 'REGULATE',
        accent: Tokens.colors.brand[500],
      },
      {
        id: 'checkin',
        name: 'Check In',
        icon: 'chart-bar',
        desc: 'TRACK MOOD',
        accent: Tokens.colors.brand[500],
      },
      {
        id: 'cbtguide',
        name: 'CBT Guide',
        icon: 'brain',
        desc: 'LEARN',
        accent: Tokens.colors.brand[500],
      },
    ],
    [],
  );

  const fadeAnims = useRef(modes.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(
    modes.map(() => new Animated.Value(ENTRANCE_OFFSET_Y)),
  ).current;

  const checkOverlayPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await OverlayService.canDrawOverlays();
      setIsOverlayEnabled(hasPermission);
    }
  }, []);

  const startOverlayWithLatestCount = useCallback(async () => {
    const taskItems =
      (await StorageService.getJSON<Array<{ id: string }>>(
        StorageService.STORAGE_KEYS.brainDump,
      )) || [];
    OverlayService.updateCount(taskItems.length);
    OverlayService.startOverlay();
    setIsOverlayEnabled(true);
  }, []);

  const loadStreak = useCallback(async () => {
    try {
      const reentryPrompt = await RetentionService.getReentryPromptLevel();
      const summary = await ActivationService.getSummary(7);
      const trend = await ActivationService.getDailyTrend(7);
      await RetentionService.markAppUse();
      const streakCount = await StorageService.get(
        StorageService.STORAGE_KEYS.streakCount,
      );
      const parsed = streakCount ? parseInt(streakCount, 10) : 0;
      setStreak(Number.isNaN(parsed) ? 0 : parsed);
      setActivationSummary(summary);
      setActivationTrend(trend);
      setReentryPromptLevel(reentryPrompt);

      if (reentryPrompt === 'gentle_restart') {
        AccessibilityInfo.announceForAccessibility(
          'Welcome back. Start with one small focus session.',
        );
      } else if (reentryPrompt === 'fresh_restart') {
        AccessibilityInfo.announceForAccessibility(
          'Fresh restart. Begin with a tiny step in Fog Cutter or Ignite.',
        );
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  }, []);

  useEffect(() => {
    loadStreak();
    checkOverlayPermission();

    if (prefersReducedMotion) {
      fadeAnims.forEach((anim) => anim.setValue(1));
      slideAnims.forEach((anim) => anim.setValue(0));
      return;
    }

    const animations = modes.map((_, i) => {
      return Animated.parallel([
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
          easing: Easing.linear, // Linear for industrial feel
        }),
        Animated.timing(slideAnims[i], {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]);
    });

    Animated.stagger(ANIMATION_STAGGER, animations).start();
  }, [
    checkOverlayPermission,
    fadeAnims,
    loadStreak,
    modes,
    prefersReducedMotion,
    slideAnims,
  ]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          checkOverlayPermission();
        }
      },
    );

    return () => {
      appStateSubscription.remove();
    };
  }, [checkOverlayPermission]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const unsubscribePermissionRequested = OverlayService.addEventListener(
      'overlay_permission_requested',
      () => {
        setIsOverlayPermissionRequesting(true);
        addOverlayEvent('Permission requested');
        AccessibilityInfo.announceForAccessibility(
          'Overlay permission request started',
        );
      },
    );

    const unsubscribePermissionResult = OverlayService.addEventListener(
      'overlay_permission_result',
      ({ granted }) => {
        setIsOverlayPermissionRequesting(false);
        addOverlayEvent(`Permission result: ${granted ? 'GRANTED' : 'DENIED'}`);
        AccessibilityInfo.announceForAccessibility(
          granted ? 'Overlay permission granted' : 'Overlay permission denied',
        );
      },
    );

    const unsubscribePermissionTimeout = OverlayService.addEventListener(
      'overlay_permission_timeout',
      () => {
        setIsOverlayPermissionRequesting(false);
        addOverlayEvent('Permission timeout');
        AccessibilityInfo.announceForAccessibility(
          'Overlay permission request timed out',
        );
      },
    );

    const unsubscribePermissionError = OverlayService.addEventListener(
      'overlay_permission_error',
      () => {
        setIsOverlayPermissionRequesting(false);
        addOverlayEvent('Permission error');
        AccessibilityInfo.announceForAccessibility(
          'Overlay permission request failed',
        );
      },
    );

    return () => {
      unsubscribePermissionRequested?.();
      unsubscribePermissionResult?.();
      unsubscribePermissionTimeout?.();
      unsubscribePermissionError?.();
    };
  }, [addOverlayEvent]);

  const toggleOverlay = useCallback(
    async (value: boolean) => {
      if (Platform.OS !== 'android') {
        return;
      }

      try {
        if (value) {
          setIsOverlayPermissionRequesting(true);
          const hasPermission = await OverlayService.canDrawOverlays();
          if (hasPermission) {
            setIsOverlayPermissionRequesting(false);
            await startOverlayWithLatestCount();
            return;
          }

          const granted = await OverlayService.requestOverlayPermission();
          const hasPermissionAfterRequest =
            granted || (await OverlayService.canDrawOverlays());

          if (hasPermissionAfterRequest) {
            setIsOverlayPermissionRequesting(false);
            await startOverlayWithLatestCount();
            return;
          }

          setIsOverlayPermissionRequesting(false);
          setIsOverlayEnabled(false);
          return;
        }

        OverlayService.stopOverlay();
        setIsOverlayEnabled(false);
      } catch (error) {
        console.error('Failed to toggle overlay:', error);
        setIsOverlayPermissionRequesting(false);
        setIsOverlayEnabled(false);
      }
    },
    [startOverlayWithLatestCount],
  );

  const navigateByRouteName = useCallback(
    (routeName: string) => {
      let currentNavigator: NavigationNode | undefined = navigation;

      while (currentNavigator) {
        const routeNames = currentNavigator.getState?.()?.routeNames;
        if (Array.isArray(routeNames) && routeNames.includes(routeName)) {
          currentNavigator.navigate(routeName);
          return;
        }
        currentNavigator = currentNavigator.getParent?.();
      }

      navigation.navigate(routeName);
    },
    [navigation],
  );

  const handlePress = useCallback(
    (modeId: string) => {
      if (modeId === 'checkin') {
        navigateByRouteName(ROUTES.CHECK_IN);
      } else if (modeId === 'cbtguide') {
        navigateByRouteName(ROUTES.CBT_GUIDE);
      } else if (modeId === 'fogcutter') {
        navigateByRouteName(ROUTES.FOG_CUTTER);
      } else if (modeId === 'pomodoro') {
        navigateByRouteName(ROUTES.POMODORO);
      } else if (modeId === 'anchor') {
        navigateByRouteName(ROUTES.ANCHOR);
      } else {
        navigateByRouteName(ROUTES.FOCUS);
      } // ignite -> Focus
    },
    [navigateByRouteName],
  );

  const styles = getStyles(isCosmic);

  return (
    <CosmicBackground variant="ridge" style={StyleSheet.absoluteFill}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.maxWidthWrapper}>
            <View style={styles.header}>
              <View>
                <Text
                  style={styles.title}
                  testID="home-title"
                  accessibilityLabel="home-title"
                >
                  SPARK_PRO
                </Text>
                <View style={styles.systemStatusRow}>
                  <Text style={styles.systemStatusText}>SYS.ONLINE</Text>
                  <View style={styles.statusDot} />
                </View>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  onPress={() => navigateByRouteName(ROUTES.DIAGNOSTICS)}
                  style={styles.settingsButton}
                  accessibilityLabel="Settings and Diagnostics"
                >
                  <Text style={styles.settingsButtonText}>⚙</Text>
                </TouchableOpacity>
                <View
                  style={styles.streakBadge}
                  testID="home-streak-badge"
                  accessibilityRole="text"
                  accessibilityLabel={`Streak: ${streak} ${streak !== 1 ? 'days' : 'day'}`}
                >
                  <Text
                    style={styles.streakText}
                    testID="home-streak"
                    accessibilityLabel="home-streak"
                  >
                    STREAK.{streak.toString().padStart(3, '0')}
                  </Text>
                </View>
              </View>
            </View>

            {activationSummary && activationSummary.started > 0 && (
              <View style={styles.activationCard}>
                <View style={styles.activationHeader}>
                  <Text style={styles.activationTitle}>WEEKLY_METRICS</Text>
                  <Text style={styles.activationRate}>
                    {Math.round(activationSummary.completionRate * 100)}%
                  </Text>
                </View>
                <View style={styles.activationGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>STARTED</Text>
                    <Text style={styles.statValue}>
                      {activationSummary.started}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>COMPLETED</Text>
                    <Text style={styles.statValue}>
                      {activationSummary.completed}
                    </Text>
                  </View>
                  {trendMetrics && (
                    <>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>TODAY</Text>
                        <Text style={styles.statValue}>
                          {trendMetrics.todayCount}
                        </Text>
                      </View>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>DELTA</Text>
                        <Text
                          style={[
                            styles.statValue,
                            trendMetrics.isPositive
                              ? styles.textSuccess
                              : trendMetrics.isNeutral
                                ? styles.textNeutral
                                : styles.textError,
                          ]}
                        >
                          {trendMetrics.deltaStr}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                {(reentryPromptLevel === 'gentle_restart' ||
                  reentryPromptLevel === 'fresh_restart') && (
                    <ReEntryPrompt
                      level={reentryPromptLevel}
                      onPrimaryAction={() => navigateByRouteName(ROUTES.FOCUS)}
                      testID="reentry-prompt"
                    />
                  )}
              </View>
            )}

            {Platform.OS === 'android' && (
              <View
                style={[
                  styles.overlayCard,
                  isOverlayEnabled && styles.overlayCardActive,
                ]}
              >
                <View style={styles.overlayTextGroup}>
                  <Text style={styles.overlayTitle}>FOCUS_OVERLAY</Text>
                  <Text
                    style={[
                      styles.overlayStatus,
                      isOverlayEnabled && styles.overlayStatusActive,
                    ]}
                    accessibilityLiveRegion="polite"
                  >
                    {isOverlayPermissionRequesting
                      ? 'REQ_PERM...'
                      : isOverlayEnabled
                        ? 'ACTIVE'
                        : 'INACTIVE'}
                  </Text>
                </View>
                <Switch
                  testID="home-overlay-toggle"
                  accessibilityRole="switch"
                  accessibilityLabel="home-overlay-toggle"
                  accessibilityState={{
                    checked: isOverlayEnabled,
                    busy: isOverlayPermissionRequesting,
                    disabled: isOverlayPermissionRequesting,
                  }}
                  trackColor={{
                    false: Tokens.colors.neutral[700],
                    true: Tokens.colors.brand[500],
                  }}
                  thumbColor={Tokens.colors.neutral[0]}
                  ios_backgroundColor={Tokens.colors.neutral[700]}
                  onValueChange={toggleOverlay}
                  disabled={isOverlayPermissionRequesting}
                  value={isOverlayEnabled}
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
              </View>
            )}

            {Platform.OS === 'android' && __DEV__ && (
              <View style={styles.debugPanel}>
                <Text style={styles.debugTitle}>LOGS</Text>
                {overlayEvents.length === 0 ? (
                  <Text style={styles.debugText}>NULL</Text>
                ) : (
                  overlayEvents.map((event) => (
                    <Text key={event.id} style={styles.debugText}>
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour12: false,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}{' '}
                      :: {event.label}
                    </Text>
                  ))
                )}
                <View style={styles.debugButtonRow}>
                  <TouchableOpacity
                    onPress={handleCopyDiagnostics}
                    style={styles.debugButton}
                  >
                    <Text style={styles.debugButtonText}>COPY_DIAG</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigateByRouteName(ROUTES.DIAGNOSTICS)}
                    style={styles.debugButton}
                  >
                    <Text style={styles.debugButtonText}>DIAGNOSTICS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.modesGrid}>
              {modes.map((mode, index) => (
                <Animated.View
                  key={mode.id}
                  style={{
                    width: cardWidth,
                    opacity: fadeAnims[index],
                    transform: [{ translateY: slideAnims[index] }],
                  }}
                >
                  <ModeCard
                    mode={mode}
                    onPress={() => handlePress(mode.id)}
                    testID={`mode-${mode.id}`}
                  />
                </Animated.View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </CosmicBackground >
  );
};

// Theme-aware styles function
const getStyles = (isCosmic: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Handled by CosmicBackground
  },
  scrollContent: {
    flexGrow: 1,
    padding: Tokens.spacing[4],
    alignItems: 'center',
  },
  maxWidthWrapper: {
    width: '100%',
    maxWidth: 960,
  },
  header: {
    marginBottom: Tokens.spacing[6],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Tokens.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: isCosmic ? 'rgba(42, 53, 82, 0.3)' : Tokens.colors.neutral.dark,
    paddingBottom: Tokens.spacing[4],
  },
  title: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xl,
    fontWeight: '700',
    color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
    letterSpacing: -1,
  },
  systemStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  systemStatusText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xxs,
    color: isCosmic ? '#B9C2D9' : Tokens.colors.text.tertiary,
    marginRight: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: isCosmic ? '#2DD4BF' : Tokens.colors.success.main,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isCosmic ? '#111A33' : Tokens.colors.neutral.darker,
    paddingHorizontal: Tokens.spacing[3],
    paddingVertical: 4,
    borderRadius: isCosmic ? 8 : Tokens.radii.none,
    borderWidth: 1,
    borderColor: isCosmic ? 'rgba(42, 53, 82, 0.3)' : Tokens.colors.neutral.border,
  },
  streakText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
    letterSpacing: 1,
  },
  activationCard: {
    marginBottom: Tokens.spacing[6],
    padding: Tokens.spacing[4],
    backgroundColor: isCosmic ? '#111A33' : Tokens.colors.neutral.darkest,
    borderWidth: 1,
    borderColor: isCosmic ? 'rgba(42, 53, 82, 0.3)' : Tokens.colors.neutral.border,
    borderRadius: isCosmic ? 12 : Tokens.radii.none,
  },
  activationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Tokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: isCosmic ? 'rgba(42, 53, 82, 0.3)' : Tokens.colors.neutral.dark,
    paddingBottom: Tokens.spacing[2],
  },
  activationTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
    letterSpacing: 1,
  },
  activationRate: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.lg,
    fontWeight: '700',
    color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
  },
  activationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xxs,
    color: isCosmic ? '#B9C2D9' : Tokens.colors.text.tertiary,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.base,
    color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
    fontWeight: '700',
  },
  textSuccess: { color: isCosmic ? '#2DD4BF' : Tokens.colors.success.main },
  textError: { color: isCosmic ? '#FB7185' : Tokens.colors.error.main },
  textNeutral: { color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary },
  overlayCard: {
    marginBottom: Tokens.spacing[6],
    padding: Tokens.spacing[3],
    backgroundColor: isCosmic ? '#111A33' : Tokens.colors.neutral.darkest,
    borderRadius: isCosmic ? 12 : Tokens.radii.none,
    borderWidth: 1,
    borderColor: isCosmic ? 'rgba(42, 53, 82, 0.3)' : Tokens.colors.neutral.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlayCardActive: {
    borderColor: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing[3],
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: isCosmic ? 8 : 0,
    backgroundColor: isCosmic ? '#111A33' : Tokens.colors.neutral.darker,
    borderWidth: 1,
    borderColor: isCosmic ? 'rgba(42, 53, 82, 0.3)' : Tokens.colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButtonText: {
    fontSize: 18,
    color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
    marginTop: Platform.OS === 'web' ? -2 : 0,
  },
  overlayTextGroup: {
    flex: 1,
  },
  overlayTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
    letterSpacing: 1,
  },
  overlayStatus: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xxs,
    color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
    marginTop: 2,
  },
  overlayStatusActive: {
    color: isCosmic ? '#2DD4BF' : Tokens.colors.success.main,
  },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Tokens.spacing[3],
  },
  debugPanel: {
    marginBottom: Tokens.spacing[6],
    padding: Tokens.spacing[3],
    backgroundColor: isCosmic ? '#0B1022' : Tokens.colors.neutral.darker,
    borderWidth: 1,
    borderColor: isCosmic ? 'rgba(42, 53, 82, 0.3)' : Tokens.colors.neutral.border,
    borderStyle: 'dashed',
    borderRadius: isCosmic ? 8 : 0,
  },
  debugTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xxs,
    color: isCosmic ? '#6B7A9C' : Tokens.colors.text.tertiary,
    marginBottom: Tokens.spacing[2],
    textTransform: 'uppercase',
  },
  debugText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xxs,
    color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
    marginBottom: 2,
  },
  debugButtonRow: {
    flexDirection: 'row',
    gap: Tokens.spacing[2],
    marginTop: Tokens.spacing[2],
  },
  debugButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: isCosmic ? '#111A33' : Tokens.colors.neutral.dark,
    borderWidth: 1,
    borderColor: isCosmic ? 'rgba(42, 53, 82, 0.3)' : Tokens.colors.neutral.border,
    borderRadius: isCosmic ? 4 : 0,
  },
  debugButtonText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xxs,
    fontWeight: '700',
    color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
  },
});

export default HomeScreen;
