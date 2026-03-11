import React, { useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ROUTES } from '../navigation/routes';
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
import { useTaskStore } from '../store/useTaskStore';
import useBrainDumpTutorial from './brain-dump/useBrainDumpTutorial';
import { getBrainDumpStyles } from './brain-dump/brainDumpStyles';
import { BrainDumpSortedSection } from './brain-dump/BrainDumpSortedSection';

type BrainDumpRouteParams = {
  autoRecord?: boolean;
};

type BrainDumpRoute = RouteProp<
  Record<typeof ROUTES.BRAIN_DUMP, BrainDumpRouteParams>,
  typeof ROUTES.BRAIN_DUMP
>;

const BrainDumpScreen = () => {
  const { isCosmic, t } = useTheme();
  const styles = getBrainDumpStyles(isCosmic, t);
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

  return (
    <SafeAreaView
      style={styles.container}
      accessibilityLabel="Brain dump screen"
      accessibilityRole="summary"
    >
      {isCosmic && (
        <CosmicBackground variant="nebula">
          <View style={StyleSheet.absoluteFillObject} />
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
                totalSteps={totalSteps}
                isFirstStep={currentStepIndex === 0}
                isLastStep={currentStepIndex === totalSteps - 1}
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

          {activeTasks.length > 0 && (
            <View style={styles.sortedSection}>
              <Text style={styles.sortedHeader}>ACTIVE_TASKS</Text>
              {activeTasks.map((taskItem) => (
                <View key={taskItem.id} style={styles.sortedItemRow}>
                  <Text style={styles.sortedItemText}>{taskItem.title}</Text>
                </View>
              ))}
            </View>
          )}

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
                  styles={{
                    sortedSection: styles.sortedSection,
                    sortedHeader: styles.sortedHeader,
                    categorySection: styles.categorySection,
                    categoryTitle: styles.categoryTitle,
                    sortedItemRow: styles.sortedItemRow,
                    sortedItemText: styles.sortedItemText,
                    priorityBadge: styles.priorityBadge,
                    priorityText: styles.priorityText,
                  }}
                  getPriorityStyle={getPriorityStyle}
                />
              ) : null
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BrainDumpScreen;
