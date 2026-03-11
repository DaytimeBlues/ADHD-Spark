import { useState, useCallback, useMemo } from 'react';
import { AccessibilityInfo } from 'react-native';
import AISortService, {
  SortedItem as AISortServiceSortedItem,
} from '../services/AISortService';

export type SortedItem = AISortServiceSortedItem;
import { GoogleTasksSyncService } from '../services/GoogleTasksSyncService';
import { useTaskStore } from '../store/useTaskStore';
import type { MicroStep } from '../utils/fogCutter';
import { normalizeMicroSteps } from '../utils/fogCutter';
import { isWeb } from '../utils/PlatformUtils';
import type { TaskPriority } from '../types/task';

export const CATEGORY_ORDER: Array<AISortServiceSortedItem['category']> = [
  'task',
  'event',
  'reminder',
  'worry',
  'thought',
  'idea',
];

interface UseBrainDumpSortingReturn {
  sortedItems: AISortServiceSortedItem[];
  isSorting: boolean;
  sortingError: string | null;
  googleAuthRequired: boolean;
  isConnectingGoogle: boolean;
  groupedSortedItems: Array<{
    category: string;
    items: AISortServiceSortedItem[];
  }>;
  handleAISort: (items: string[]) => Promise<void>;
  handleConnectGoogle: () => Promise<void>;
  clearSortedItems: () => void;
  clearSortingError: () => void;
  getPriorityStyle: (priority: AISortServiceSortedItem['priority']) => object;
}

const toCanonicalTaskInput = (
  item: AISortServiceSortedItem,
): {
  title: string;
  dueDate?: string;
  category: string;
  priority: TaskPriority;
  microSteps: MicroStep[];
} | null => {
  if (
    item.category !== 'task' &&
    item.category !== 'reminder' &&
    item.category !== 'event'
  ) {
    return null;
  }

  const title = item.text.trim();
  if (!title) {
    return null;
  }

  const stepHints: string[] = [
    'Open this task and start with a 2-minute first step',
  ];
  if (item.dueDate) {
    stepHints.push(`Check due date: ${item.dueDate}`);
  }
  if (item.start) {
    stepHints.push(`Schedule window starts: ${item.start}`);
  }

  return {
    title,
    dueDate: item.dueDate,
    category: item.category,
    priority: item.priority === 'high' ? 'important' : 'normal',
    microSteps: normalizeMicroSteps(stepHints),
  };
};

export const useBrainDumpSorting = (): UseBrainDumpSortingReturn => {
  const [sortedItems, setSortedItems] = useState<AISortServiceSortedItem[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [sortingError, setSortingError] = useState<string | null>(null);
  const [googleAuthRequired, setGoogleAuthRequired] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  const clearSortedItems = useCallback(() => {
    setSortedItems([]);
  }, []);

  const clearSortingError = useCallback(() => {
    setSortingError(null);
  }, []);

  const saveSortedItemsToTaskStore = useCallback(
    async (nextSortedItems: AISortServiceSortedItem[]): Promise<number> => {
      const taskStore = useTaskStore.getState();
      const existingTasks = taskStore.tasks;

      const existingTextSet = new Set(
        existingTasks.map((task) => task.title.trim().toLowerCase()),
      );

      let createdCount = 0;
      nextSortedItems.forEach((item) => {
        const task = toCanonicalTaskInput(item);
        if (!task) {
          return;
        }
        const key = task.title.trim().toLowerCase();
        if (existingTextSet.has(key)) {
          return;
        }

        existingTextSet.add(key);
        taskStore.addTask({
          title: task.title,
          dueDate: task.dueDate,
          category: task.category,
          priority: task.priority,
          source: 'manual',
          microSteps: task.microSteps,
        });
        createdCount += 1;
      });

      return createdCount;
    },
    [],
  );

  const runSortAndSyncPipeline = useCallback(
    async (sourceItems: string[]) => {
      if (sourceItems.length === 0) {
        return;
      }

      const sorted = await AISortService.sortItems(sourceItems);
      setSortedItems(sorted);

      const [createdTaskCount, exportResult] = await Promise.all([
        saveSortedItemsToTaskStore(sorted),
        GoogleTasksSyncService.syncSortedItemsToGoogle(sorted),
      ]);

      if (exportResult.authRequired) {
        setGoogleAuthRequired(true);
        if (isWeb) {
          setSortingError(
            'Google sign-in is not available on web yet. Please use the mobile app to sync with Google Tasks.',
          );
        } else {
          setSortingError(
            exportResult.errorMessage ||
              'Google sign-in required to sync Tasks and Calendar exports.',
          );
        }
      } else if (exportResult.errorMessage) {
        setGoogleAuthRequired(false);
        setSortingError(exportResult.errorMessage);
      } else if (
        createdTaskCount > 0 ||
        exportResult.createdTasks > 0 ||
        exportResult.createdEvents > 0
      ) {
        setSortingError(null);
        setGoogleAuthRequired(false);
        AccessibilityInfo.announceForAccessibility(
          'Tasks synced and suggestions saved.',
        );
      }
    },
    [saveSortedItemsToTaskStore],
  );

  const handleConnectGoogle = useCallback(async () => {
    if (isWeb) {
      setSortingError('Google sign-in is not available on web yet.');
      return;
    }

    setIsConnectingGoogle(true);
    try {
      const success = await GoogleTasksSyncService.signInInteractive();
      if (!success) {
        setSortingError('Google sign-in failed. Please try again.');
        return;
      }

      if (sortedItems.length === 0) {
        setGoogleAuthRequired(false);
        setSortingError(null);
        return;
      }

      const exportResult =
        await GoogleTasksSyncService.syncSortedItemsToGoogle(sortedItems);

      if (exportResult.authRequired) {
        setGoogleAuthRequired(true);
        setSortingError(
          exportResult.errorMessage || 'Google sign-in required.',
        );
        return;
      }

      if (exportResult.errorMessage) {
        setGoogleAuthRequired(false);
        setSortingError(exportResult.errorMessage);
        return;
      }

      setGoogleAuthRequired(false);
      setSortingError(null);
      AccessibilityInfo.announceForAccessibility(
        'Tasks synced and suggestions saved.',
      );
    } finally {
      setIsConnectingGoogle(false);
    }
  }, [sortedItems]);

  const handleAISort = useCallback(
    async (items: string[]) => {
      setSortingError(null);
      setIsSorting(true);

      try {
        await runSortAndSyncPipeline(items);
        AccessibilityInfo.announceForAccessibility('AI suggestions updated.');
      } catch (error) {
        setSortingError(
          error instanceof Error
            ? error.message
            : 'AI sort is currently unavailable.',
        );
        setSortedItems([]);
      } finally {
        setIsSorting(false);
      }
    },
    [runSortAndSyncPipeline],
  );

  const groupedSortedItems = useMemo(() => {
    const grouped = new Map<string, AISortServiceSortedItem[]>();
    sortedItems.forEach((item) => {
      const existing = grouped.get(item.category) ?? [];
      existing.push(item);
      grouped.set(item.category, existing);
    });

    return CATEGORY_ORDER.map((category) => ({
      category,
      items: grouped.get(category) ?? [],
    })).filter((entry) => entry.items.length > 0);
  }, [sortedItems]);

  const getPriorityStyle = useCallback(
    (priority: AISortServiceSortedItem['priority']) => {
      switch (priority) {
        case 'high':
          return { backgroundColor: '#FF4444', borderColor: '#FF4444' };
        case 'medium':
          return { backgroundColor: '#666666', borderColor: '#666666' };
        default:
          return { backgroundColor: '#333333', borderColor: '#333333' };
      }
    },
    [],
  );

  return {
    sortedItems,
    isSorting,
    sortingError,
    googleAuthRequired,
    isConnectingGoogle,
    groupedSortedItems,
    handleAISort,
    handleConnectGoogle,
    clearSortedItems,
    clearSortingError,
    getPriorityStyle,
  };
};

export default useBrainDumpSorting;
