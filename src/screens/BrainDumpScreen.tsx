import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/useTheme';
import { CosmicBackground } from '../ui/cosmic';
import { isWeb } from '../utils/PlatformUtils';
import {
  BrainDumpItem,
  BrainDumpInput,
  BrainDumpActionBar,
  BrainDumpRationale,
  BrainDumpGuide,
  BrainDumpVoiceRecord,
  IntegrationPanel,
} from '../components/brain-dump';
import { TutorialBubble } from '../components/tutorial/TutorialBubble';
import useBrainDump from '../hooks/useBrainDump';
import type { SortedItem } from '../services/AISortService';
import {
  brainDumpOnboardingFlow,
  useTutorialStore,
} from '../store/useTutorialStore';

// --- Constants ---
const LIST_PADDING_BOTTOM = 120;
const HEADER_LETTER_SPACING = 2;
const SUBHEADER_LETTER_SPACING = 1;
const EMPTY_STATE_OPACITY = 0.3;
const ITEM_VERTICAL_PADDING = 4;
const BADGE_HORIZONTAL_PADDING = 6;
const BADGE_MIN_WIDTH = 40;
const CATEGORY_TITLE_HORIZONTAL_PADDING = 8;
const CATEGORY_TITLE_VERTICAL_PADDING = 4;
const CATEGORY_TITLE_BORDER_RADIUS = 4;

type BrainDumpRouteParams = {
  autoRecord?: boolean;
};

type BrainDumpRoute = RouteProp<Record<'Tasks', BrainDumpRouteParams>, 'Tasks'>;

const BrainDumpScreen = () => {
  const { isCosmic, t } = useTheme();
  const styles = getStyles(isCosmic, t);
  const route = useRoute<BrainDumpRoute>();
  const hasAutoStartedTutorial = useRef(false);
  const activeFlow = useTutorialStore((state) => state.activeFlow);
  const currentStepIndex = useTutorialStore((state) => state.currentStepIndex);
  const isTutorialVisible = useTutorialStore((state) => state.isVisible);
  const onboardingCompleted = useTutorialStore(
    (state) => state.onboardingCompleted,
  );
  const startTutorial = useTutorialStore((state) => state.startTutorial);
  const nextStep = useTutorialStore((state) => state.nextStep);
  const previousStep = useTutorialStore((state) => state.previousStep);
  const skipTutorial = useTutorialStore((state) => state.skipTutorial);

  const {
    items,
    recordingState,
    recordingError,
    isSorting,
    isLoading,
    sortingError,
    sortedItems,
    googleAuthRequired,
    isConnectingGoogle,
    showGuide,
    groupedSortedItems,
    addItem,
    deleteItem,
    clearAll,
    handleRecordPress,
    handleAISort,
    handleConnectGoogle,
    dismissGuide,
    getPriorityStyle,
  } = useBrainDump(route.params?.autoRecord);

  useEffect(() => {
    if (hasAutoStartedTutorial.current || onboardingCompleted) {
      return;
    }

    if (!isTutorialVisible && activeFlow === null) {
      hasAutoStartedTutorial.current = true;
      startTutorial(brainDumpOnboardingFlow);
    }
  }, [activeFlow, isTutorialVisible, onboardingCompleted, startTutorial]);

  const currentTutorialStep =
    isTutorialVisible && activeFlow
      ? activeFlow.steps[currentStepIndex] ?? null
      : null;

  return (
    <SafeAreaView
      style={styles.container}
      accessibilityLabel="Brain dump screen"
      accessibilityRole="summary"
    >
      {isCosmic && (
        <CosmicBackground variant="nebula">
          <View style={StyleSheet.absoluteFill} />
        </CosmicBackground>
      )}
      <View style={styles.centerContainer}>
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <Text style={styles.title}>BRAIN_DUMP</Text>
            <View style={styles.headerLine} />
            <Pressable
              onPress={() => startTutorial(brainDumpOnboardingFlow)}
              accessibilityRole="button"
              accessibilityLabel="Start brain dump tutorial"
              testID="brain-dump-tour-button"
              style={({ pressed }) => [
                styles.tourButton,
                pressed && styles.tourButtonPressed,
              ]}
            >
              <Text style={styles.tourButtonText}>TOUR</Text>
            </Pressable>
          </View>

          {currentTutorialStep && (
            <View style={styles.tutorialOverlay} testID="tutorial-overlay">
              <TutorialBubble
                step={currentTutorialStep}
                stepIndex={currentStepIndex}
                totalSteps={activeFlow?.steps.length ?? 0}
                isFirstStep={currentStepIndex === 0}
                isLastStep={
                  currentStepIndex === (activeFlow?.steps.length ?? 1) - 1
                }
                onNext={nextStep}
                onPrevious={previousStep}
                onSkip={skipTutorial}
              />
            </View>
          )}

          <BrainDumpRationale />

          <BrainDumpInput onAdd={addItem} />

          <BrainDumpGuide showGuide={showGuide} onDismiss={dismissGuide} />

          <BrainDumpVoiceRecord
            recordingState={recordingState}
            recordingError={recordingError}
            onRecordPress={handleRecordPress}
          />

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={t.colors.brand[500]} />
              <Text style={styles.loadingText}>LOADING...</Text>
            </View>
          ) : (
            <BrainDumpActionBar
              itemCount={items.length}
              isSorting={isSorting}
              onSort={handleAISort}
              onClear={clearAll}
            />
          )}

          {sortingError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{sortingError}</Text>
              {googleAuthRequired && !isWeb && (
                <Pressable
                  onPress={handleConnectGoogle}
                  disabled={isConnectingGoogle}
                  style={({ pressed }) => [
                    styles.connectButton,
                    isConnectingGoogle && styles.connectButtonDisabled,
                    pressed && styles.connectButtonPressed,
                  ]}
                >
                  <Text style={styles.connectButtonText}>
                    {isConnectingGoogle ? 'CONNECTING...' : 'CONNECT GOOGLE'}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Integration Panel */}
          <IntegrationPanel />

          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BrainDumpItem item={item} onDelete={deleteItem} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !isLoading ? (
                <Text style={[styles.title, styles.emptyState]}>
                  _AWAITING_INPUT
                </Text>
              ) : null
            }
            ListFooterComponent={
              sortedItems.length > 0 ? (
                <View style={styles.sortedSection}>
                  <Text style={styles.sortedHeader}>AI_SUGGESTIONS</Text>
                  {groupedSortedItems.map(({ category, items: catItems }) => (
                    <View key={category} style={styles.categorySection}>
                      <Text style={styles.categoryTitle}>{category}</Text>
                      {catItems.map((item: SortedItem, idx: number) => (
                        <View key={idx} style={styles.sortedItemRow}>
                          <Text style={styles.sortedItemText}>
                            {item.duration ? `[${item.duration}] ` : ''}
                            {item.text}
                          </Text>
                          <View
                            style={[
                              styles.priorityBadge,
                              getPriorityStyle(item.priority),
                            ]}
                          >
                            <Text style={styles.priorityText}>
                              {item.priority}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              ) : null
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (isCosmic: boolean, t: ReturnType<typeof useTheme>['t']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isCosmic
        ? t.colors.cosmic?.obsidian || '#070712'
        : t.colors.neutral.darkest,
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      zIndex: 1,
    },
    contentWrapper: {
      flex: 1,
      width: '100%',
      maxWidth: t.layout?.maxWidth?.content || 960,
      padding: t.spacing[4],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: isCosmic ? 16 : t.spacing[5],
      marginTop: t.spacing[4],
    },
    title: {
      fontFamily:
        t.type?.fontFamily?.mono ||
        t.typography?.mono?.fontFamily ||
        'monospace',
      fontSize: t.type?.sm || t.fontSizes?.[14] || 14,
      color: isCosmic
        ? t.colors.cosmic?.starlight || '#EEF2FF'
        : t.colors.text?.primary || '#ffffff',
      fontWeight: '700',
      letterSpacing: HEADER_LETTER_SPACING,
    },
    headerLine: {
      flex: 1,
      height: 1,
      backgroundColor: isCosmic
        ? 'rgba(139, 92, 246, 0.3)'
        : t.colors.neutral.border,
      marginLeft: t.spacing[4],
    },
    tourButton: {
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.45)'
        : t.colors.neutral.border,
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.72)'
        : t.colors.neutral.dark,
      paddingHorizontal: t.spacing[3],
      paddingVertical: t.spacing[2],
      borderRadius: isCosmic ? 999 : t.radii.md,
      marginLeft: t.spacing[3],
    },
    tourButtonPressed: {
      opacity: 0.82,
    },
    tourButtonText: {
      fontFamily:
        t.type?.fontFamily?.mono ||
        t.typography?.mono?.fontFamily ||
        'monospace',
      fontSize: t.type?.xs || t.fontSizes?.[12] || 12,
      color: isCosmic
        ? t.colors.cosmic?.nebulaViolet || '#8B5CF6'
        : t.colors.text?.primary || '#ffffff',
      fontWeight: '700',
      letterSpacing: SUBHEADER_LETTER_SPACING,
    },
    tutorialOverlay: {
      marginBottom: t.spacing[4],
      zIndex: 2,
    },
    loadingContainer: {
      padding: t.spacing[8],
      alignItems: 'center',
      gap: t.spacing[4],
    },
    loadingText: {
      fontFamily:
        t.type?.fontFamily?.mono ||
        t.typography?.mono?.fontFamily ||
        'monospace',
      fontSize: t.type?.sm || t.fontSizes?.[14] || 14,
      color: isCosmic
        ? t.colors.cosmic?.mist || '#B9C2D9'
        : t.colors.text?.secondary || '#888888',
      letterSpacing: SUBHEADER_LETTER_SPACING,
      textTransform: 'uppercase',
    },
    errorContainer: {
      marginTop: t.spacing[2],
      marginBottom: t.spacing[4],
      alignItems: 'center',
    },
    errorText: {
      fontFamily:
        t.type?.fontFamily?.mono ||
        t.typography?.mono?.fontFamily ||
        'monospace',
      fontSize: t.type?.xs || t.fontSizes?.[12] || 12,
      color: t.colors.brand[500],
      textAlign: 'center',
    },
    connectButton: {
      marginTop: t.spacing[3],
      backgroundColor: t.colors.indigo?.primary || t.colors.semantic.secondary,
      paddingHorizontal: t.spacing[4],
      paddingVertical: t.spacing[2],
      borderRadius: t.radii.md,
    },
    connectButtonPressed: {
      opacity: 0.8,
    },
    connectButtonDisabled: {
      opacity: 0.6,
    },
    connectButtonText: {
      fontFamily:
        t.type?.fontFamily?.mono ||
        t.typography?.mono?.fontFamily ||
        'monospace',
      fontSize: t.type?.xs || t.fontSizes?.[12] || 12,
      color: t.colors.text?.primary || '#ffffff',
      fontWeight: '700',
    },
    emptyState: {
      marginTop: t.spacing[12],
      opacity: EMPTY_STATE_OPACITY,
    },
    listContent: {
      paddingBottom: LIST_PADDING_BOTTOM,
    },
    sortedSection: {
      marginTop: t.spacing[6],
      paddingTop: t.spacing[4],
      borderTopWidth: 1,
      borderTopColor: isCosmic
        ? 'rgba(139, 92, 246, 0.2)'
        : t.colors.neutral.border,
    },
    sortedHeader: {
      fontFamily:
        t.type?.fontFamily?.mono ||
        t.typography?.mono?.fontFamily ||
        'monospace',
      fontSize: t.type?.sm || t.fontSizes?.[14] || 14,
      color: isCosmic
        ? t.colors.cosmic?.nebulaViolet || '#8B5CF6'
        : t.colors.brand[500],
      marginBottom: t.spacing[4],
      letterSpacing: SUBHEADER_LETTER_SPACING,
    },
    categorySection: {
      marginBottom: t.spacing[4],
    },
    categoryTitle: {
      fontFamily:
        t.type?.fontFamily?.mono ||
        t.typography?.mono?.fontFamily ||
        'monospace',
      fontSize: t.type?.xs || t.fontSizes?.[12] || 12,
      fontWeight: '700',
      color: isCosmic
        ? t.colors.cosmic?.starlight || '#EEF2FF'
        : t.colors.text?.primary || '#ffffff',
      textTransform: 'uppercase',
      marginBottom: t.spacing[2],
      backgroundColor: isCosmic
        ? 'rgba(139, 92, 246, 0.1)'
        : t.colors.neutral.dark,
      paddingHorizontal: CATEGORY_TITLE_HORIZONTAL_PADDING,
      paddingVertical: CATEGORY_TITLE_VERTICAL_PADDING,
      borderRadius: CATEGORY_TITLE_BORDER_RADIUS,
      alignSelf: 'flex-start',
    },
    sortedItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: ITEM_VERTICAL_PADDING,
      marginBottom: 0,
    },
    sortedItemText: {
      flex: 1,
      fontFamily:
        t.type?.fontFamily?.mono ||
        t.typography?.mono?.fontFamily ||
        'monospace',
      fontSize: t.type?.xs || t.fontSizes?.[12] || 12,
      color: isCosmic
        ? t.colors.cosmic?.mist || '#B9C2D9'
        : t.colors.text?.secondary || '#888888',
      lineHeight: (t.type?.sm || 14) * 1.5,
      marginRight: t.spacing[3],
    },
    priorityBadge: {
      paddingHorizontal: BADGE_HORIZONTAL_PADDING,
      paddingVertical: 0,
      borderRadius: isCosmic ? 4 : t.radii.none,
      minWidth: BADGE_MIN_WIDTH,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : t.colors.neutral.border,
    },
    priorityText: {
      fontFamily:
        t.type?.fontFamily?.mono ||
        t.typography?.mono?.fontFamily ||
        'monospace',
      fontSize: t.fontSizes?.[10] || 10,
      fontWeight: '700',
      textTransform: 'uppercase',
      color: isCosmic
        ? t.colors.cosmic?.starlight || '#EEF2FF'
        : t.colors.text?.primary || '#ffffff',
    },
  });

export default BrainDumpScreen;
