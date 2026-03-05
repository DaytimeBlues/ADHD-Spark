import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  Animated,
  AccessibilityInfo,
  TouchableOpacity,
} from 'react-native';
import { useOverlayEvents } from '../hooks/useOverlayEvents';
import { useShareAction } from '../hooks/useShareAction';
import StorageService from '../services/StorageService';
import { LoggerService } from '../services/LoggerService';
import ActivationService, {
  ActivationDailyTrendPoint,
  ActivationSummary,
} from '../services/ActivationService';
import RetentionService from '../services/RetentionService';
import { ReentryPromptLevel } from '../services/RetentionService';
import useReducedMotion from '../hooks/useReducedMotion';
import useEntranceAnimation from '../hooks/useEntranceAnimation';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import ModeCard, { ModeCardMode } from './ModeCard';
import { ReEntryPrompt } from '../components/ui/ReEntryPrompt';
import { ROUTES } from '../navigation/routes';
import { CosmicBackground, GlowCard } from '../ui/cosmic';
import { getStyles } from './HomeScreen.styles';
import { isAndroid } from '../utils/PlatformUtils';

type NavigatorState = {
  routeNames?: string[];
};

type Mode = { id: string } & ModeCardMode;

type NavigationNode = {
  navigate: (routeName: string) => void;
  getState?: () => NavigatorState | undefined;
  getParent?: () => NavigationNode | undefined;
};

// Types moved to hooks or handled by consumption

const HomeScreen = ({ navigation }: { navigation: NavigationNode }) => {
  const { isCosmic } = useTheme();
  const [streak, setStreak] = useState(0);

  const {
    isOverlayEnabled,
    isOverlayPermissionRequesting,
    overlayEvents,
    addOverlayEvent,
    toggleOverlay,
  } = useOverlayEvents();

  const { handleCopyDiagnostics } = useShareAction({
    isOverlayEnabled,
    isOverlayPermissionRequesting,
    overlayEvents,
    addOverlayEvent,
  });

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

  // Logic extracted to useOverlayEvents and useShareAction

  const cardWidth = '49%';

  const modes = useMemo<Mode[]>(
    () => [
      {
        id: 'resume',
        name: 'Resume',
        icon: 'play-circle',
        desc: 'CONTINUE',
        accent: '#8B5CF6',
      },
      {
        id: 'ignite',
        name: 'Ignite',
        icon: 'fire',
        desc: 'START TASKS',
        accent: '#8B5CF6',
      },
      {
        id: 'fogcutter',
        name: 'Fog Cutter',
        icon: 'weather-windy',
        desc: 'BREAK IT DOWN',
        accent: '#8B5CF6',
      },
      {
        id: 'pomodoro',
        name: 'Pomodoro',
        icon: 'timer-sand',
        desc: 'STAY ON TRACK',
        accent: '#2DD4BF',
      },
      {
        id: 'anchor',
        name: 'Anchor',
        icon: 'anchor',
        desc: 'REGULATE',
        accent: '#243BFF',
      },
      {
        id: 'checkin',
        name: 'Check In',
        icon: 'chart-bar',
        desc: 'TRACK MOOD',
        accent: '#2DD4BF',
      },
      {
        id: 'cbtguide',
        name: 'CBT Guide',
        icon: 'brain',
        desc: 'LEARN',
        accent: '#8B5CF6',
      },
    ],
    [],
  );

  const { fadeAnims, slideAnims } = useEntranceAnimation(
    modes.length,
    prefersReducedMotion,
  );

  // Logic extracted to useOverlayEvents

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
      LoggerService.error({
        service: 'HomeScreen',
        operation: 'loadStreak',
        message: 'Error loading streak',
        error,
      });
    }
  }, []);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  // Logic extracted to useOverlayEvents and useShareAction

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
      }
    },
    [navigateByRouteName],
  );

  const styles = useMemo(() => getStyles(isCosmic), [isCosmic]);

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
              <GlowCard
                glow="medium"
                tone="raised"
                padding="md"
                style={styles.activationCard}
              >
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
              </GlowCard>
            )}

            {isAndroid && (
              <GlowCard
                glow={isOverlayEnabled ? 'medium' : 'soft'}
                tone={isOverlayEnabled ? 'raised' : 'base'}
                padding="sm"
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
              </GlowCard>
            )}

            {isAndroid && __DEV__ && (
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

            <View style={[styles.modesGrid, styles.negativeMarginTop24]}>
              {modes.map((mode, index) => (
                <Animated.View
                  key={mode.id}
                  style={[
                    {
                      width: cardWidth,
                      opacity: fadeAnims[index],
                      transform: [{ translateY: slideAnims[index] }],
                    },
                    styles.zIndex10,
                  ]}
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
    </CosmicBackground>
  );
};

export default HomeScreen;
