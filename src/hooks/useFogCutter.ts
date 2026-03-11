import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutAnimation, UIManager } from 'react-native';
import StorageService from '../services/StorageService';
import UXMetricsService from '../services/UXMetricsService';
import { LoggerService } from '../services/LoggerService';
import HapticsService from '../services/HapticsService';
import { isAndroid } from '../utils/PlatformUtils';
import { useTaskStore } from '../store/useTaskStore';
import type { Task as CanonicalTask } from '../types/task';
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
  task: string;
  microSteps: string[];
  newStep: string;
  tasks: Task[];
  focusedInput: string | null;
  isLoading: boolean;
  showGuide: boolean;
  guideDismissed: boolean;
  latestSavedTaskId: string | null;
  setTask: (task: string) => void;
  setMicroSteps: (steps: string[]) => void;
  setNewStep: (step: string) => void;
  setFocusedInput: (input: string | null) => void;
  addMicroStep: () => void;
  addTask: () => void;
  toggleTask: (id: string) => void;
  dismissGuide: () => Promise<void>;
  loadTasks: () => Promise<void>;
}

const enableAndroidLayoutAnimation = () => {
  if (isAndroid && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
};

const normalizeStoredTasks = (storedTasks: Task[] | null): Task[] => {
  if (!storedTasks || !Array.isArray(storedTasks)) {
    return [];
  }

  return storedTasks
    .filter((item) => {
      return Boolean(item?.id && item?.text && Array.isArray(item?.microSteps));
    })
    .map((item) => ({
      ...item,
      microSteps: normalizeMicroSteps(item.microSteps),
    }));
};

const loadGuideDismissedState = async (): Promise<boolean> => {
  const guideState = await StorageService.getJSON<{
    fogCutterDismissed?: boolean;
  }>(StorageService.STORAGE_KEYS.firstSuccessGuideState);

  return guideState ? !!guideState.fogCutterDismissed : false;
};

const shouldShowGuide = ({
  guideDismissed,
  showGuide,
  hasTrackedFirstTask,
}: {
  guideDismissed: boolean;
  showGuide: boolean;
  hasTrackedFirstTask: boolean;
}) => {
  return !guideDismissed && !showGuide && !hasTrackedFirstTask;
};

const saveGuideDismissedState = async () => {
  const currentState =
    (await StorageService.getJSON<Record<string, boolean>>(
      StorageService.STORAGE_KEYS.firstSuccessGuideState,
    )) ?? {};

  await StorageService.setJSON(
    StorageService.STORAGE_KEYS.firstSuccessGuideState,
    { ...currentState, fogCutterDismissed: true },
  );
};

export const useFogCutter = (
  onTaskSaved?: (taskId: string) => void,
): UseFogCutterReturn => {
  const [task, setTask] = useState('');
  const [microSteps, setMicroSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isGuideLoading, setIsGuideLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(true);
  const [latestSavedTaskId, setLatestSavedTaskId] = useState<string | null>(
    null,
  );
  const hasTrackedFirstTask = useRef(false);
  const storeTasks = useTaskStore((state) => state.tasks);
  const addTaskStore = useTaskStore((state) => state.addTask);
  const updateTaskStore = useTaskStore((state) => state.updateTask);
  const hasHydrated = useTaskStore((state) => state._hasHydrated);

  const tasks = normalizeStoredTasks(
    storeTasks
      .filter(
        (item) => Array.isArray(item.microSteps) && item.microSteps.length > 0,
      )
      .map(
        (item): Task => ({
          id: item.id,
          text: item.title,
          completed: item.completed,
          microSteps: item.microSteps ?? [],
        }),
      ),
  );
  const isLoading = !hasHydrated || isGuideLoading;

  useEffect(() => {
    enableAndroidLayoutAnimation();
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      setGuideDismissed(await loadGuideDismissedState());
    } catch (error) {
      LoggerService.error({
        service: 'FogCutter',
        operation: 'loadTasks',
        message: 'Failed to load tasks',
        error,
      });
    } finally {
      setIsGuideLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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
      const newTask = addTaskStore({
        title: task.trim(),
        priority: 'normal',
        source: 'manual',
        microSteps: normalizeMicroSteps(microSteps),
      });
      setLatestSavedTaskId(newTask.id);

      if (
        shouldShowGuide({
          guideDismissed,
          showGuide,
          hasTrackedFirstTask: hasTrackedFirstTask.current,
        })
      ) {
        UXMetricsService.track('fog_cutter_first_task_saved');
        hasTrackedFirstTask.current = true;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowGuide(true);
      }

      setTask('');
      setMicroSteps([]);
      onTaskSaved?.(newTask.id);
    }
  }, [addTaskStore, guideDismissed, microSteps, onTaskSaved, showGuide, task]);

  const dismissGuide = useCallback(async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowGuide(false);
    setGuideDismissed(true);
    await saveGuideDismissedState();
  }, []);

  const toggleTask = useCallback(
    (id: string) => {
      const targetTask = storeTasks.find(
        (item): item is CanonicalTask & { microSteps: MicroStep[] } =>
          item.id === id &&
          Array.isArray(item.microSteps) &&
          item.microSteps.length > 0,
      );

      if (!targetTask) {
        return;
      }

      const updatedTask = advanceTaskProgress(targetTask);

      if (updatedTask.completed && !targetTask.completed) {
        HapticsService.success();
      } else if (!updatedTask.completed) {
        HapticsService.mediumTap();
      }

      updateTaskStore(id, {
        completed: updatedTask.completed,
        completedAt: updatedTask.completed ? Date.now() : undefined,
        microSteps: updatedTask.microSteps,
      });
    },
    [storeTasks, updateTaskStore],
  );

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
