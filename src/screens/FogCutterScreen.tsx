import React, { useCallback, useMemo, useRef } from 'react';
import { SafeAreaView, Text, TextInput, View } from 'react-native';
import ActivationService from '../services/ActivationService';
import { ROUTES } from '../navigation/routes';
import { useTheme } from '../theme/useTheme';
import { CosmicBackground } from '../ui/cosmic';
import { NightAweBackground } from '../ui/nightAwe';
import { useFogCutter } from '../hooks/useFogCutter';
import { useFogCutterAI } from '../hooks/useFogCutterAI';
import { getFogCutterScreenStyles } from './FogCutterScreen.styles';
import { FogCutterTaskComposer } from './fog-cutter/FogCutterTaskComposer';
import { FogCutterTaskList } from './fog-cutter/FogCutterTaskList';

type FogCutterNavigation = {
  navigate: (route: string) => void;
};

interface FogCutterScreenProps {
  navigation?: FogCutterNavigation;
}

const FogCutterScreen = ({ navigation }: FogCutterScreenProps) => {
  const { isCosmic, isNightAwe, t, variant } = useTheme();
  const styles = useMemo(
    () => getFogCutterScreenStyles(variant, t),
    [t, variant],
  );
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

  const content = (
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

          <FogCutterTaskComposer
            focusedInput={focusedInput}
            isAiLoading={isAiLoading}
            isCosmic={isCosmic}
            isNightAwe={isNightAwe}
            microSteps={microSteps}
            newStep={newStep}
            onAddMicroStep={addMicroStep}
            onAddTask={addTask}
            onAiBreakdownPress={() => handleAiBreakdown(task)}
            onFocusInput={setFocusedInput}
            onNewStepChange={setNewStep}
            onTaskChange={setTask}
            saveDisabled={microSteps.length === 0}
            setTaskInputRef={taskInputRef}
            task={task}
          />

          <FogCutterTaskList
            isCosmic={isCosmic}
            isLoading={isLoading}
            isNightAwe={isNightAwe}
            onDismissGuide={handleDismissGuide}
            onExamplePress={(example) => {
              setTask(example);
              taskInputRef.current?.focus();
            }}
            onFocusTaskInput={() => taskInputRef.current?.focus()}
            onToggleTask={toggleTask}
            showGuide={showGuide}
            tasks={tasks}
          />
        </View>
      </View>
    </SafeAreaView>
  );

  if (isNightAwe) {
    return (
      <NightAweBackground
        variant="focus"
        activeFeature="fogCutter"
        motionMode="transition"
      >
        {content}
      </NightAweBackground>
    );
  }

  return (
    <CosmicBackground variant="ridge" dimmer>
      {content}
    </CosmicBackground>
  );
};

export default FogCutterScreen;
