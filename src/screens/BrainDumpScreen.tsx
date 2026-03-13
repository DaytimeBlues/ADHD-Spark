import React, { useMemo } from 'react';
import { SafeAreaView, FlatList, StyleSheet, Text, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ROUTES } from '../navigation/routes';
import { useTheme } from '../theme/useTheme';
import { CosmicBackground } from '../ui/cosmic';
import { NightAweBackground } from '../ui/nightAwe';
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
import { useTaskStore } from '../store/useTaskStore';
import useBrainDumpTutorial from './brain-dump/useBrainDumpTutorial';
import { getBrainDumpStyles } from './brain-dump/brainDumpStyles';
import { BrainDumpSortedSection } from './brain-dump/BrainDumpSortedSection';
import { BrainDumpHeader } from './brain-dump/BrainDumpHeader';
import { BrainDumpStatusSection } from './brain-dump/BrainDumpStatusSection';
import { BrainDumpActiveTasksSection } from './brain-dump/BrainDumpActiveTasksSection';

type BrainDumpRouteParams = {
  autoRecord?: boolean;
};

type BrainDumpRoute = RouteProp<
  Record<typeof ROUTES.BRAIN_DUMP, BrainDumpRouteParams>,
  typeof ROUTES.BRAIN_DUMP
>;

const BrainDumpScreen = () => {
  const { isCosmic, isNightAwe, t, variant } = useTheme();
  const styles = useMemo(() => getBrainDumpStyles(variant, t), [t, variant]);
  const loadingSpinnerColor = isNightAwe
    ? t.colors.nightAwe?.feature?.brainDump || t.colors.semantic.primary
    : t.colors.brand[500];
  const route = useRoute<BrainDumpRoute>();
  const storeTasks = useTaskStore((state) => state.tasks);
  const activeTasks = useMemo(
    () => storeTasks.filter((task) => !task.completed),
    [storeTasks],
  );
  const {
    brainDumpOnboardingFlow,
    currentTutorialStep,
    currentStepIndex,
    totalSteps,
    nextStep,
    previousStep,
    skipTutorial,
    startTutorial,
  } = useBrainDumpTutorial();

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
  const canConnectGoogle = googleAuthRequired && !isWeb;
  const sortedSectionStyles = {
    sortedSection: styles.sortedSection,
    sortedHeader: styles.sortedHeader,
    categorySection: styles.categorySection,
    categoryTitle: styles.categoryTitle,
    sortedItemRow: styles.sortedItemRow,
    sortedItemText: styles.sortedItemText,
    priorityBadge: styles.priorityBadge,
    priorityText: styles.priorityText,
  };

  const content = (
    <SafeAreaView
      style={styles.container}
      accessibilityLabel="Brain dump screen"
      accessibilityRole="summary"
    >
      <View style={styles.centerContainer}>
        <View style={styles.contentWrapper}>
          <BrainDumpHeader
            styles={{
              header: styles.header,
              title: styles.title,
              headerLine: styles.headerLine,
              tourButton: styles.tourButton,
              tourButtonPressed: styles.tourButtonPressed,
              tourButtonText: styles.tourButtonText,
              tutorialOverlay: styles.tutorialOverlay,
            }}
            currentTutorialStep={currentTutorialStep}
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            brainDumpOnboardingFlow={brainDumpOnboardingFlow}
            startTutorial={startTutorial}
            nextStep={nextStep}
            previousStep={previousStep}
            skipTutorial={skipTutorial}
          />

          <BrainDumpRationale />

          <BrainDumpInput onAdd={addItem} />

          <BrainDumpGuide showGuide={showGuide} onDismiss={dismissGuide} />

          <BrainDumpVoiceRecord
            recordingState={recordingState}
            recordingError={recordingError}
            onRecordPress={handleRecordPress}
          />

          <BrainDumpStatusSection
            styles={{
              loadingContainer: styles.loadingContainer,
              loadingText: styles.loadingText,
              errorContainer: styles.errorContainer,
              errorText: styles.errorText,
              connectButton: styles.connectButton,
              connectButtonDisabled: styles.connectButtonDisabled,
              connectButtonPressed: styles.connectButtonPressed,
              connectButtonText: styles.connectButtonText,
            }}
            isLoading={isLoading}
            isSorting={isSorting}
            itemCount={items.length}
            sortingError={sortingError}
            googleAuthRequired={googleAuthRequired}
            isConnectingGoogle={isConnectingGoogle}
            canConnectGoogle={canConnectGoogle}
            loadingSpinnerColor={loadingSpinnerColor}
            onSort={handleAISort}
            onClear={clearAll}
            onConnectGoogle={handleConnectGoogle}
          />

          <IntegrationPanel />

          <BrainDumpActiveTasksSection
            tasks={activeTasks}
            styles={{
              sortedSection: styles.sortedSection,
              sortedHeader: styles.sortedHeader,
              sortedItemRow: styles.sortedItemRow,
              sortedItemText: styles.sortedItemText,
            }}
          />

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
                <BrainDumpSortedSection
                  groupedSortedItems={groupedSortedItems}
                  styles={sortedSectionStyles}
                  getPriorityStyle={getPriorityStyle}
                />
              ) : null
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );

  if (isNightAwe) {
    return (
      <NightAweBackground
        variant="focus"
        activeFeature="brainDump"
        motionMode="idle"
        dimmer={false}
      >
        {content}
      </NightAweBackground>
    );
  }

  if (isCosmic) {
    return (
      <View style={styles.container}>
        <CosmicBackground variant="nebula">
          <View style={StyleSheet.absoluteFillObject} />
        </CosmicBackground>
        <View style={StyleSheet.absoluteFillObject}>{content}</View>
      </View>
    );
  }

  return content;
};

export default BrainDumpScreen;
