import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SafeAreaView,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import ActivationService from '../services/ActivationService';
import { getTaskProgressSummary } from '../utils/fogCutter';
import { LinearButton } from '../components/ui/LinearButton';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AnimatedMicroStep } from '../components/ui/AnimatedMicroStep';
import { Shimmer } from '../components/ui/Shimmer';
import { EmptyStateExamples } from '../components/ui/EmptyStateExamples';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { ROUTES } from '../navigation/routes';
import { CosmicBackground, GlowCard, RuneButton } from '../ui/cosmic';
import { useFogCutter, Task } from '../hooks/useFogCutter';
import { useFogCutterAI } from '../hooks/useFogCutterAI';

type FogCutterNavigation = {
  navigate: (route: string) => void;
};

interface FogCutterScreenProps {
  navigation?: FogCutterNavigation;
}

const FogCutterScreen = ({ navigation }: FogCutterScreenProps) => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);
  const taskInputRef = useRef<TextInput>(null);

  const handleTaskSaved = useCallback(
    async (taskId: string) => {
      await ActivationService.requestPendingStart({
        source: 'fogcutter_handoff',
        requestedAt: new Date().toISOString(),
        context: {
          taskId,
          reason: 'user_completed_fog_cutter_decomposition',
        },
      });

      navigation?.navigate(ROUTES.FOCUS);
    },
    [navigation],
  );

  const {
    task,
    microSteps,
    newStep,
    tasks,
    focusedInput,
    isLoading,
    showGuide,
    latestSavedTaskId,
    setTask,
    setMicroSteps,
    setNewStep,
    setFocusedInput,
    addMicroStep,
    addTask,
    toggleTask,
    dismissGuide,
  } = useFogCutter(handleTaskSaved);

  const { isAiLoading, handleAiBreakdown } = useFogCutterAI({
    onStepsGenerated: useCallback(
      (steps: string[]) => {
        setMicroSteps(steps);
      },
      [setMicroSteps],
    ),
  });

  const handleDismissGuide = useCallback(async () => {
    await dismissGuide();

    await ActivationService.requestPendingStart({
      source: 'fogcutter_handoff',
      requestedAt: new Date().toISOString(),
      context: {
        taskId: latestSavedTaskId ?? undefined,
        reason: 'user_completed_fog_cutter_decomposition',
      },
    });

    navigation?.navigate(ROUTES.FOCUS);
  }, [dismissGuide, latestSavedTaskId, navigation]);

  const handleAiBreakdownPress = useCallback(() => {
    handleAiBreakdown(task);
  }, [handleAiBreakdown, task]);

  const renderMicroStep = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <AnimatedMicroStep
      item={item}
      index={index}
      testID={`microstep-number-${index + 1}`}
    />
  );

  const renderTask = ({ item }: { item: Task }) => (
    <Pressable
      style={({
        pressed,
        hovered,
      }: {
        pressed: boolean;
        hovered?: boolean;
      }) => [
        styles.taskCard,
        item.completed && styles.taskCardCompleted,
        hovered && !item.completed && styles.taskCardHovered,
        pressed && !item.completed && styles.taskCardPressed,
      ]}
      onPress={() => toggleTask(item.id)}
    >
      <View style={styles.taskHeader}>
        <Text style={[styles.taskText, item.completed && styles.completed]}>
          {item.text}
        </Text>
        {item.completed ? (
          <Text style={styles.doneBadge}>CMPLTD</Text>
        ) : (
          <Text style={styles.stepCountText}>
            {getTaskProgressSummary(item.microSteps)}
          </Text>
        )}
      </View>

      {!item.completed && (
        <View style={styles.progressContainer}>
          <ProgressBar
            current={item.microSteps.filter((s) => s.status === 'done').length}
            total={item.microSteps.length}
            size="sm"
            color="brand"
            style={styles.progressBar}
          />
          <View style={styles.activeStepContainer}>
            <Text style={styles.activeStepLabel}>
              {item.microSteps.find((s) => s.status === 'in_progress')
                ? 'CURRENT_STEP >>'
                : 'NEXT_STEP >>'}
            </Text>
            <Text style={styles.activeStepText} numberOfLines={1}>
              {
                (
                  item.microSteps.find((s) => s.status === 'in_progress') ||
                  item.microSteps.find((s) => s.status === 'next') || {
                    text: '...',
                  }
                ).text
              }
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );

  return (
    <CosmicBackground variant="ridge" dimmer>
      <SafeAreaView
        style={styles.container}
        accessibilityLabel="Fog cutter screen"
        accessibilityRole="summary"
      >
        <View style={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>FOG_CUTTER</Text>
              <View style={styles.headerLine} />
            </View>

            <GlowCard
              glow="soft"
              tone="base"
              padding="md"
              style={styles.rationaleCard}
            >
              <Text style={styles.rationaleTitle}>WHY THIS WORKS</Text>
              <Text style={styles.rationaleText}>
                CBT/CADDI research shows ADHD paralysis comes from seeing tasks
                as monolithic. Breaking tasks into micro-steps (2-5 minutes
                each) reduces cognitive load and creates multiple completion
                wins that build dopamine and momentum.
              </Text>
            </GlowCard>

            <GlowCard
              glow="medium"
              tone="raised"
              padding="md"
              style={styles.creationCard}
            >
              <View style={styles.creationHeader}>
                <Text style={styles.cardTitle}>DECOMPOSE_TASK</Text>
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  ref={taskInputRef}
                  style={[
                    styles.input,
                    focusedInput === 'main' && styles.inputFocused,
                    styles.marginBottom8,
                  ]}
                  placeholder="> INPUT_OVERWHELMING_TASK"
                  placeholderTextColor={Tokens.colors.text.placeholder}
                  value={task}
                  onChangeText={setTask}
                  onFocus={() => setFocusedInput('main')}
                  onBlur={() => setFocusedInput(null)}
                />
                <View style={styles.aiButtonContainer}>
                  <RuneButton
                    variant="secondary"
                    size="sm"
                    onPress={handleAiBreakdownPress}
                    disabled={!task.trim() || isAiLoading}
                    loading={isAiLoading}
                  >
                    {isAiLoading ? 'ANALYSING...' : 'AI_BREAKDOWN'}
                  </RuneButton>
                </View>
              </View>

              <View style={styles.addStepRow}>
                <TextInput
                  style={[
                    styles.stepInput,
                    focusedInput === 'step' && styles.inputFocused,
                  ]}
                  placeholder="> ADD_MICRO_STEP"
                  placeholderTextColor={Tokens.colors.text.placeholder}
                  value={newStep}
                  onChangeText={setNewStep}
                  onSubmitEditing={addMicroStep}
                  onFocus={() => setFocusedInput('step')}
                  onBlur={() => setFocusedInput(null)}
                />
                <LinearButton
                  title="+"
                  testID="add-micro-step-btn"
                  onPress={addMicroStep}
                  variant="secondary"
                  style={styles.addButton}
                />
              </View>

              {isAiLoading && (
                <View style={styles.previewContainer}>
                  <Text style={styles.previewTitle}>ANALYSING...</Text>
                  <Shimmer width="100%" height={60} style={styles.shimmer} />
                </View>
              )}

              {microSteps.length > 0 && !isAiLoading && (
                <View style={styles.previewContainer}>
                  <Text style={styles.previewTitle}>SEQUENCE:</Text>
                  <FlatList
                    data={microSteps}
                    renderItem={renderMicroStep}
                    keyExtractor={(_, index) => index.toString()}
                    scrollEnabled={false}
                  />
                </View>
              )}

              {isCosmic ? (
                <RuneButton
                  variant="primary"
                  size="lg"
                  glow="medium"
                  onPress={addTask}
                  disabled={microSteps.length === 0}
                  style={styles.saveButton}
                >
                  EXECUTE_SAVE
                </RuneButton>
              ) : (
                <LinearButton
                  title="EXECUTE_SAVE"
                  onPress={addTask}
                  disabled={microSteps.length === 0}
                  size="lg"
                  style={styles.saveButton}
                />
              )}
            </GlowCard>

            <View style={styles.divider} />

            {showGuide && (
              <View style={styles.guideBanner}>
                <View style={styles.guideContent}>
                  <Text style={styles.guideTitle}>CLARITY_ACHIEVED</Text>
                  <Text style={styles.guideText}>
                    READY. INITIATE_IGNITE_PROTOCOL.
                  </Text>
                </View>
                <Pressable
                  onPress={handleDismissGuide}
                  style={({ pressed }) => [
                    styles.guideButton,
                    pressed && styles.guideButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss guidance"
                >
                  <Text style={styles.guideButtonText}>ACK</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.sectionHeader}>ACTIVE_OPERATIONS</Text>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color={Tokens.colors.text.primary}
                />
                <Text style={styles.loadingText}>LOADING...</Text>
              </View>
            ) : (
              <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={renderTask}
                style={styles.taskList}
                ListEmptyComponent={
                  <View>
                    <EmptyState
                      icon="◈"
                      title="NO_ACTIVE_TASKS."
                      primaryActionLabel="CREATE FIRST TASK"
                      onPrimaryAction={() => taskInputRef.current?.focus()}
                      primaryVariant="secondary"
                      style={styles.emptyState}
                    />
                    <EmptyStateExamples
                      onExamplePress={(example) => {
                        setTask(example);
                        taskInputRef.current?.focus();
                      }}
                    />
                  </View>
                }
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </CosmicBackground>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isCosmic ? 'transparent' : Tokens.colors.neutral.darkest,
    },
    scrollContent: {
      flex: 1,
      alignItems: 'center',
    },
    content: {
      flex: 1,
      width: '100%',
      maxWidth: Tokens.layout.maxWidth.prose,
      padding: Tokens.spacing[4],
    },
    header: {
      marginBottom: Tokens.spacing[6],
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      paddingBottom: Tokens.spacing[2],
      justifyContent: 'space-between',
    },
    title: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.lg,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    headerLine: {
      flex: 1,
      height: 1,
      backgroundColor: isCosmic ? '#0B1022' : Tokens.colors.neutral.dark,
      marginLeft: Tokens.spacing[4],
    },
    rationaleCard: {
      marginBottom: Tokens.spacing[4],
    },
    rationaleTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      letterSpacing: 1,
      marginBottom: Tokens.spacing[2],
      textTransform: 'uppercase',
    },
    rationaleText: {
      fontFamily: Tokens.type.fontFamily.body,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      lineHeight: 22,
      flexWrap: 'wrap',
    },
    creationCard: {
      marginBottom: Tokens.spacing[6],
    },
    creationHeader: {
      marginBottom: Tokens.spacing[4],
    },
    cardTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    inputGroup: {
      marginBottom: Tokens.spacing[4],
    },
    aiButtonContainer: {
      alignItems: 'flex-end',
    },
    input: {
      backgroundColor: isCosmic ? '#0B1022' : Tokens.colors.neutral.darker,
      borderRadius: isCosmic ? 8 : 0,
      paddingHorizontal: Tokens.spacing[3],
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      marginBottom: Tokens.spacing[3],
      height: 48,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(42, 53, 82, 0.3)'
        : Tokens.colors.neutral.border,
      ...Platform.select({
        web: { outlineStyle: 'none', transition: 'border-color 0.2s ease' },
      }),
    },
    marginBottom8: {
      marginBottom: 8,
    },
    inputFocused: {
      borderColor: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      backgroundColor: isCosmic ? '#111A33' : Tokens.colors.neutral.darkest,
      ...Platform.select({
        web: isCosmic
          ? {
              boxShadow:
                '0 0 0 2px rgba(139,92,246,0.3), 0 0 30px rgba(139,92,246,0.25)',
            }
          : {},
      }),
    },
    addStepRow: {
      flexDirection: 'row',
      marginBottom: Tokens.spacing[3],
      gap: Tokens.spacing[2],
    },
    stepInput: {
      flex: 1,
      backgroundColor: isCosmic ? '#0B1022' : Tokens.colors.neutral.darker,
      borderRadius: isCosmic ? 8 : 0,
      paddingHorizontal: Tokens.spacing[3],
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      height: 48,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(42, 53, 82, 0.3)'
        : Tokens.colors.neutral.border,
      ...Platform.select({
        web: { outlineStyle: 'none', transition: 'border-color 0.2s ease' },
      }),
    },
    addButton: {
      width: 48,
      height: 48,
      paddingHorizontal: 0,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: isCosmic ? 8 : 0,
    },
    previewContainer: {
      backgroundColor: isCosmic ? '#111A33' : Tokens.colors.neutral.darkest,
      borderRadius: isCosmic ? 8 : 0,
      padding: Tokens.spacing[4],
      marginBottom: Tokens.spacing[3],
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: isCosmic
        ? 'rgba(42, 53, 82, 0.3)'
        : Tokens.colors.neutral.border,
    },
    previewTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: Tokens.colors.text.tertiary,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      marginBottom: Tokens.spacing[2],
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    microStep: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 2,
    },
    stepNumber: {
      color: Tokens.colors.text.tertiary,
      width: Tokens.spacing[6],
      fontSize: Tokens.type.xs,
      fontWeight: 'bold',
      marginRight: Tokens.spacing[2],
      fontFamily: Tokens.type.fontFamily.mono,
    },
    stepText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
    },
    shimmer: {
      marginTop: Tokens.spacing[2],
    },
    saveButton: {
      marginTop: Tokens.spacing[2],
    },
    divider: {
      height: 1,
      backgroundColor: isCosmic
        ? 'rgba(42, 53, 82, 0.3)'
        : Tokens.colors.neutral.border,
      width: '100%',
      marginBottom: Tokens.spacing[6],
    },
    sectionHeader: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: Tokens.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: Tokens.spacing[3],
    },
    taskList: {
      flex: 1,
    },
    listContent: {
      paddingBottom: Tokens.spacing[20],
    },
    taskCard: {
      backgroundColor: isCosmic ? '#111A33' : Tokens.colors.neutral.darkest,
      borderRadius: isCosmic ? 12 : 0,
      padding: Tokens.spacing[4],
      marginBottom: Tokens.spacing[2],
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(42, 53, 82, 0.3)'
        : Tokens.colors.neutral.border,
      minHeight: 64,
      justifyContent: 'center',
      ...Platform.select({
        web: {
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        },
      }),
    },
    taskCardHovered: {
      borderColor: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      zIndex: 1,
      ...Platform.select({
        web: isCosmic
          ? {
              boxShadow:
                '0 0 0 1px rgba(139,92,246,0.3), 0 0 20px rgba(139,92,246,0.2)',
            }
          : {},
      }),
    },
    taskCardPressed: {
      backgroundColor: isCosmic ? '#0B1022' : Tokens.colors.neutral.darker,
    },
    taskCardCompleted: {
      opacity: 0.5,
      backgroundColor: isCosmic ? '#111A33' : Tokens.colors.neutral.darker,
    },
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Tokens.spacing[1],
    },
    taskText: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontSize: Tokens.type.base,
      fontWeight: '700',
      flex: 1,
      marginRight: Tokens.spacing[2],
    },
    completed: {
      textDecorationLine: 'line-through',
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
    },
    doneBadge: {
      backgroundColor: isCosmic ? '#0B1022' : Tokens.colors.neutral.dark,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: isCosmic ? 8 : 0,
      overflow: 'hidden',
      fontFamily: Tokens.type.fontFamily.mono,
    },
    activeStepContainer: {
      marginTop: Tokens.spacing[2],
      paddingLeft: Tokens.spacing[2],
      borderLeftWidth: 1,
      borderLeftColor: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
    },
    activeStepLabel: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      color: Tokens.colors.text.tertiary,
      marginBottom: 1,
      letterSpacing: 0.5,
    },
    activeStepText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
    },
    stepCountText: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: Tokens.colors.text.tertiary,
      fontSize: Tokens.type.xs,
      letterSpacing: 1,
    },
    progressContainer: {
      marginTop: Tokens.spacing[2],
    },
    progressBar: {
      marginBottom: Tokens.spacing[2],
    },
    loadingContainer: {
      padding: Tokens.spacing[8],
      alignItems: 'center',
      gap: Tokens.spacing[4],
    },
    loadingText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    emptyState: {
      marginTop: Tokens.spacing[8],
      opacity: 0.5,
    },
    guideBanner: {
      backgroundColor: isCosmic ? '#0B1022' : Tokens.colors.neutral.dark,
      borderWidth: 1,
      borderColor: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      padding: Tokens.spacing[3],
      marginBottom: Tokens.spacing[6],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Tokens.spacing[4],
      borderRadius: isCosmic ? 12 : 0,
    },
    guideContent: {
      flex: 1,
    },
    guideTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      marginBottom: Tokens.spacing[1],
      letterSpacing: 1,
    },
    guideText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
    },
    guideButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(42, 53, 82, 0.3)'
        : Tokens.colors.neutral.border,
      backgroundColor: isCosmic ? '#111A33' : Tokens.colors.neutral.darkest,
      borderRadius: isCosmic ? 8 : 0,
    },
    guideButtonPressed: {
      backgroundColor: isCosmic ? '#0B1022' : Tokens.colors.neutral.darker,
    },
    guideButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      textTransform: 'uppercase',
    },
  });

export default FogCutterScreen;
