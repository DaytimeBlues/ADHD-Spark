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
import { ROUTES } from '../navigation/routes';
import { CosmicBackground } from '../ui/cosmic';
import { NightAweBackground } from '../ui/nightAwe';
import { getStyles } from './HomeScreen.styles';
import { isAndroid } from '../utils/PlatformUtils';
import { useHomeMetrics } from './home/useHomeMetrics';
import { HomeActivationCard } from './home/HomeActivationCard';
import { HomeOverlayCard } from './home/HomeOverlayCard';
import { HomeDebugPanel } from './home/HomeDebugPanel';
import { HomeModesGrid } from './home/HomeModesGrid';
import { HomeHeader } from './home/HomeHeader';
import { HOME_MODE_CARD_WIDTH } from './home/constants';
import { useHomeModes } from './home/useHomeModes';
import {
  HomeNavigationNode,
  useHomeNavigation,
} from './home/useHomeNavigation';

const HomeScreen = ({ navigation }: { navigation: HomeNavigationNode }) => {
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
  const modes = useHomeModes(variant, t);
  const { navigateByRouteName, handlePress } = useHomeNavigation(navigation);

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

  const styles = useMemo(() => getStyles(variant, t), [t, variant]);

  const content = (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.maxWidthWrapper}>
          <HomeHeader
            streak={streak}
            styles={{
              header: styles.header,
              title: styles.title,
              systemStatusRow: styles.systemStatusRow,
              systemStatusText: styles.systemStatusText,
              statusDot: styles.statusDot,
              headerRight: styles.headerRight,
              settingsButton: styles.settingsButton,
              settingsButtonText: styles.settingsButtonText,
              streakBadge: styles.streakBadge,
              streakText: styles.streakText,
            }}
            onOpenDiagnostics={() => navigateByRouteName(ROUTES.DIAGNOSTICS)}
          />

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
            cardWidth={HOME_MODE_CARD_WIDTH}
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
