import { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import StorageService from '../services/StorageService';
import UXMetricsService from '../services/UXMetricsService';
import { LoggerService } from '../services/LoggerService';
import HapticsService from '../services/HapticsService';
import { generateId } from '../utils/helpers';
import {
  MicroStep,
  advanceTaskProgress,
  normalizeMicroSteps,
} from '../utils/fogCutter';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  microSteps: MicroStep[];
}

interface UseFogCutterReturn {
  // State
  task: string;
  microSteps: string[];
  newStep: string;
  tasks: Task[];
  focusedInput: string | null;
  isLoading: boolean;
  showGuide: boolean;
  guideDismissed: boolean;
  latestSavedTaskId: string | null;

  // Setters
  setTask: (task: string) => void;
  setMicroSteps: (steps: string[]) => void;
  setNewStep: (step: string) => void;
  setFocusedInput: (input: string | null) => void;

  // Actions
  addMicroStep: () => void;
  addTask: () => void;
  toggleTask: (id: string) => void;
  dismissGuide: () => Promise<void>;
  loadTasks: () => Promise<void>;
}

export const useFogCutter = (
  onTaskSaved?: (taskId: string) => void,
): UseFogCutterReturn => {
  const [task, setTask] = useState('');
  const [microSteps, setMicroSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(true);
  const [latestSavedTaskId, setLatestSavedTaskId] = useState<string | null>(
    null,
  );

  const hasTrackedFirstTask = useRef(false);

  // Initialize layout animation on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  // Load tasks and guide state on mount
  const loadTasks = useCallback(async () => {
    try {
      const [storedTasks, guideState] = await Promise.all([
        StorageService.getJSON<Task[]>(StorageService.STORAGE_KEYS.tasks),
        StorageService.getJSON<{ fogCutterDismissed?: boolean }>(
          StorageService.STORAGE_KEYS.firstSuccessGuideState,
        ),
      ]);

      if (guideState) {
        setGuideDismissed(!!guideState.fogCutterDismissed);
      } else {
        setGuideDismissed(false);
      }

      if (storedTasks && Array.isArray(storedTasks)) {
        const normalized = storedTasks
          .filter((item) => {
            return Boolean(
              item?.id && item?.text && Array.isArray(item?.microSteps),
            );
          })
          .map((item) => ({
            ...item,
            microSteps: normalizeMicroSteps(item.microSteps),
          }));
        setTasks(normalized);
      }
    } catch (error) {
      LoggerService.error({
        service: 'FogCutter',
        operation: 'loadTasks',
        message: 'Failed to load tasks',
        error,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Persist tasks when they change
  useEffect(() => {
    if (!isLoading) {
      StorageService.setJSON(StorageService.STORAGE_KEYS.tasks, tasks);
    }
  }, [tasks, isLoading]);

  const addMicroStep = useCallback(() => {
    if (newStep.trim()) {
      HapticsService.tap({ intensity: 'light' });
      setMicroSteps((prev) => [...prev, newStep.trim()]);
      setNewStep('');
    }
  }, [newStep]);

  const addTask = useCallback(() => {
    if (task.trim() && microSteps.length > 0) {
      HapticsService.mediumTap();
      const microStepModels = normalizeMicroSteps(microSteps);
      const newTask: Task = {
        id: generateId(),
        text: task,
        completed: false,
        microSteps: microStepModels,
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setLatestSavedTaskId(newTask.id);

      if (!guideDismissed && !showGuide && !hasTrackedFirstTask.current) {
        UXMetricsService.track('fog_cutter_first_task_saved');
        hasTrackedFirstTask.current = true;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowGuide(true);
      }

      setTask('');
      setMicroSteps([]);

      onTaskSaved?.(newTask.id);
    }
  }, [task, microSteps, guideDismissed, showGuide, onTaskSaved]);

  const dismissGuide = useCallback(async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowGuide(false);
    setGuideDismissed(true);
    const currentState =
      (await StorageService.getJSON<Record<string, boolean>>(
        StorageService.STORAGE_KEYS.firstSuccessGuideState,
      )) ?? {};
    await StorageService.setJSON(
      StorageService.STORAGE_KEYS.firstSuccessGuideState,
      { ...currentState, fogCutterDismissed: true },
    );
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prevTasks) => {
      const task = prevTasks.find((t) => t.id === id);
      if (task) {
        const wasCompleted = task.completed;
        const updatedTask = advanceTaskProgress(task);

        // Provide haptic feedback based on progress
        if (!wasCompleted && updatedTask.completed) {
          // Task just completed - heavy success feedback
          HapticsService.success();
        } else if (!wasCompleted) {
          // Step completed but task not done yet
          HapticsService.mediumTap();
        }

        return prevTasks.map((t) => (t.id === id ? updatedTask : t));
      }
      return prevTasks;
    });
  }, []);

  return {
    task,
    microSteps,
    newStep,
    tasks,
    focusedInput,
    isLoading,
    showGuide,
    guideDismissed,
    latestSavedTaskId,
    setTask,
    setMicroSteps,
    setNewStep,
    setFocusedInput,
    addMicroStep,
    addTask,
    toggleTask,
    dismissGuide,
    loadTasks,
  };
};

export default useFogCutter;
