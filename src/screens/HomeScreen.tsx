import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  AccessibilityInfo,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useOverlayEvents } from '../hooks/useOverlayEvents';
import { useShareAction } from '../hooks/useShareAction';
import StorageService from '../services/StorageService';
import { LoggerService } from '../services/LoggerService';
import ActivationService, {
  ActivationSummary,
  ActivationDailyTrendPoint,
} from '../services/ActivationService';
import RetentionService, {
  ReentryPromptLevel,
} from '../services/RetentionService';
import useReducedMotion from '../hooks/useReducedMotion';
import useEntranceAnimation from '../hooks/useEntranceAnimation';
import { useTheme } from '../theme/useTheme';
import { Tokens } from '../theme/tokens';
import { ModeCardMode } from './ModeCard';
import { ROUTES } from '../navigation/routes';
import { CosmicBackground } from '../ui/cosmic';
import { NightAweBackground } from '../ui/nightAwe';
import AppIcon from '../components/AppIcon';
import { getStyles } from './HomeScreen.styles';
import { isAndroid } from '../utils/PlatformUtils';
import { useHomeMetrics } from './home/useHomeMetrics';
import { HomeActivationCard } from './home/HomeActivationCard';
import { HomeOverlayCard } from './home/HomeOverlayCard';
import { HomeDebugPanel } from './home/HomeDebugPanel';
import { HomeModesGrid } from './home/HomeModesGrid';

type NavigatorState = {
  routeNames?: string[];
};

type Mode = { id: string } & ModeCardMode;

type NavigationNode = {
  navigate: (routeName: string) => void;
  getState?: () => NavigatorState | undefined;
  getParent?: () => NavigationNode | undefined;
};

const HomeScreen = ({ navigation }: { navigation: NavigationNode }) => {
  const { isNightAwe, t, variant } = useTheme();
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

  const { trendMetrics, hasActivationData, showReentryPrompt } = useHomeMetrics(
    activationSummary,
    activationTrend,
    reentryPromptLevel,
  );

  const cardWidth = '49%';

  const modes = useMemo<Mode[]>(
    () => [
      {
        id: 'resume',
        name: 'Resume',
        icon: 'play-circle',
        desc: 'CONTINUE',
        accent: isNightAwe
          ? t.colors.nightAwe?.feature?.home || t.colors.semantic.primary
          : '#8B5CF6',
      },
      {
        id: 'ignite',
        name: 'Ignite',
        icon: 'fire',
        desc: 'START TASKS',
        accent: isNightAwe
          ? t.colors.nightAwe?.feature?.ignite ||
            t.colors.semantic.secondary ||
            Tokens.colors.indigo.primary
          : '#8B5CF6',
      },
      {
        id: 'fogcutter',
        name: 'Fog Cutter',
        icon: 'weather-windy',
        desc: 'BREAK IT DOWN',
        accent: isNightAwe
          ? t.colors.nightAwe?.feature?.fogCutter || t.colors.semantic.primary
          : '#8B5CF6',
      },
      {
        id: 'pomodoro',
        name: 'Pomodoro',
        icon: 'timer-sand',
        desc: 'STAY ON TRACK',
        accent: isNightAwe ? t.colors.semantic.info : '#2DD4BF',
      },
      {
        id: 'anchor',
        name: 'Anchor',
        icon: 'anchor',
        desc: 'REGULATE',
        accent: isNightAwe
          ? t.colors.semantic.secondary || Tokens.colors.indigo.primary
          : '#243BFF',
      },
      {
        id: 'checkin',
        name: 'Check In',
        icon: 'chart-bar',
        desc: 'TRACK MOOD',
        accent: isNightAwe
          ? t.colors.nightAwe?.feature?.checkIn || t.colors.semantic.info
          : '#2DD4BF',
      },
      {
        id: 'cbtguide',
        name: 'CBT Guide',
        icon: 'brain',
        desc: 'LEARN',
        accent: isNightAwe ? t.colors.semantic.primary : '#8B5CF6',
      },
    ],
    [isNightAwe, t.colors.nightAwe, t.colors.semantic],
  );

  const { fadeAnims, slideAnims } = useEntranceAnimation(
    modes.length,
    prefersReducedMotion,
  );

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

  const styles = useMemo(() => getStyles(variant, t), [t, variant]);

  const content = (
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
                <AppIcon
                  name="cog-outline"
                  size={18}
                  color={styles.settingsButtonText.color}
                />
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

          {hasActivationData && activationSummary && (
            <HomeActivationCard
              activationSummary={activationSummary}
              trendMetrics={trendMetrics}
              reentryPromptLevel={reentryPromptLevel}
              showReentryPrompt={showReentryPrompt}
              styles={{
                activationCard: styles.activationCard,
                activationHeader: styles.activationHeader,
                activationTitle: styles.activationTitle,
                activationRate: styles.activationRate,
                activationGrid: styles.activationGrid,
                statBox: styles.statBox,
                statLabel: styles.statLabel,
                statValue: styles.statValue,
                textSuccess: styles.textSuccess,
                textError: styles.textError,
                textNeutral: styles.textNeutral,
              }}
              onPrimaryAction={() => navigateByRouteName(ROUTES.FOCUS)}
            />
          )}

          {isAndroid && (
            <HomeOverlayCard
              isOverlayEnabled={isOverlayEnabled}
              isOverlayPermissionRequesting={isOverlayPermissionRequesting}
              styles={{
                overlayCard: styles.overlayCard,
                overlayCardActive: styles.overlayCardActive,
                overlayTextGroup: styles.overlayTextGroup,
                overlayTitle: styles.overlayTitle,
                overlayStatus: styles.overlayStatus,
                overlayStatusActive: styles.overlayStatusActive,
              }}
              onToggle={toggleOverlay}
            />
          )}

          {isAndroid && __DEV__ && (
            <HomeDebugPanel
              overlayEvents={overlayEvents.map((e) => ({
                id: e.id,
                timestamp: e.timestamp,
                label: e.label,
              }))}
              styles={{
                debugPanel: styles.debugPanel,
                debugTitle: styles.debugTitle,
                debugText: styles.debugText,
                debugButtonRow: styles.debugButtonRow,
                debugButton: styles.debugButton,
                debugButtonText: styles.debugButtonText,
              }}
              onCopyDiagnostics={handleCopyDiagnostics}
              onNavigateDiagnostics={() =>
                navigateByRouteName(ROUTES.DIAGNOSTICS)
              }
            />
          )}

          <HomeModesGrid
            modes={modes}
            fadeAnims={fadeAnims}
            slideAnims={slideAnims}
            cardWidth={cardWidth}
            styles={{
              modesGrid: styles.modesGrid,
              negativeMarginTop24: styles.negativeMarginTop24,
              zIndex10: styles.zIndex10,
            }}
            onModePress={handlePress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  if (isNightAwe) {
    return (
      <NightAweBackground
        variant="home"
        activeFeature="home"
        motionMode="idle"
        style={StyleSheet.absoluteFillObject}
      >
        {content}
      </NightAweBackground>
    );
  }

  return (
    <CosmicBackground variant="ridge" style={StyleSheet.absoluteFillObject}>
      {content}
    </CosmicBackground>
  );
};

export default HomeScreen;
