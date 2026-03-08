import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutAnimation, UIManager } from 'react-native';
import StorageService from '../services/StorageService';
import UXMetricsService from '../services/UXMetricsService';
import { LoggerService } from '../services/LoggerService';
import HapticsService from '../services/HapticsService';
import { generateId } from '../utils/helpers';
import { isAndroid } from '../utils/PlatformUtils';
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

const loadFogCutterState = async () => {
  const [storedTasks, guideDismissed] = await Promise.all([
    StorageService.getJSON<Task[]>(StorageService.STORAGE_KEYS.tasks),
    loadGuideDismissedState(),
  ]);

  return {
    tasks: normalizeStoredTasks(storedTasks),
    guideDismissed,
  };
};

const persistTasks = async (tasks: Task[]) => {
  await StorageService.setJSON(StorageService.STORAGE_KEYS.tasks, tasks);
};

const createFogCutterTask = (
  taskText: string,
  microStepTexts: string[],
): Task => ({
  id: generateId(),
  text: taskText,
  completed: false,
  microSteps: normalizeMicroSteps(microStepTexts),
});

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

const toggleTaskCollection = (tasks: Task[], id: string) => {
  const targetTask = tasks.find((task) => task.id === id);

  if (!targetTask) {
    return { nextTasks: tasks, status: 'missing' as const };
  }

  const wasCompleted = targetTask.completed;
  const updatedTask = advanceTaskProgress(targetTask);

  return {
    nextTasks: tasks.map((task) => (task.id === id ? updatedTask : task)),
    status: wasCompleted
      ? ('already-complete' as const)
      : updatedTask.completed
        ? ('completed' as const)
        : ('progressed' as const),
  };
};

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

  useEffect(() => {
    enableAndroidLayoutAnimation();
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const loadedState = await loadFogCutterState();
      setGuideDismissed(loadedState.guideDismissed);
      setTasks(loadedState.tasks);
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

  useEffect(() => {
    if (!isLoading) {
      persistTasks(tasks).catch((error) => {
        LoggerService.warn({
          service: 'FogCutter',
          operation: 'persistTasks',
          message: 'Failed to persist tasks',
          error,
        });
      });
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
      const newTask = createFogCutterTask(task, microSteps);

      setTasks((prevTasks) => [...prevTasks, newTask]);
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
  }, [guideDismissed, microSteps, onTaskSaved, showGuide, task]);

  const dismissGuide = useCallback(async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowGuide(false);
    setGuideDismissed(true);
    await saveGuideDismissedState();
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prevTasks) => {
      const { nextTasks, status } = toggleTaskCollection(prevTasks, id);

      if (status === 'completed') {
        HapticsService.success();
      } else if (status === 'progressed') {
        HapticsService.mediumTap();
      }

      return nextTasks;
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
