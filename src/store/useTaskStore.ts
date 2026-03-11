import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import StorageService, { zustandStorage } from '../services/StorageService';
import type { Task, TaskPriority, TaskSource } from '../types/task';
import { normalizeMicroSteps } from '../utils/fogCutter';

// Google Tasks API response type
interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'completed' | 'needsAction';
}

interface TaskState {
  tasks: Task[];
  _hasHydrated: boolean;

  // Actions
  addTask: (input: {
    id?: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    source?: TaskSource;
    googleTaskId?: string;
    dueDate?: string;
    category?: string;
    microSteps?: Task['microSteps'];
    completed?: boolean;
    completedAt?: number;
    createdAt?: number;
    updatedAt?: number;
  }) => Task;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  importFromGoogle: (googleTasks: GoogleTask[]) => void;
  setHasHydrated: (state: boolean) => void;

  // Selectors
  getActiveTasks: () => Task[];
  getActiveCount: () => number;
}

type LegacyStoredTask = {
  id: string;
  text: string;
  completed: boolean;
  microSteps?: Task['microSteps'];
};

const normalizeTitle = (value: string) => value.trim().toLowerCase();

const toCanonicalTask = (input: {
  id?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  source?: TaskSource;
  googleTaskId?: string;
  dueDate?: string;
  category?: string;
  microSteps?: Task['microSteps'];
  completed?: boolean;
  completedAt?: number;
  createdAt?: number;
  updatedAt?: number;
}): Task => {
  const now = Date.now();
  const completed = input.completed ?? false;
  return {
    id: input.id || `task_${now}_${Math.random().toString(36).slice(2, 7)}`,
    title: input.title,
    description: input.description,
    priority: input.priority || 'normal',
    dueDate: input.dueDate,
    category: input.category,
    completed,
    completedAt: completed ? input.completedAt ?? now : undefined,
    source: input.source || 'manual',
    googleTaskId: input.googleTaskId,
    microSteps: input.microSteps
      ? normalizeMicroSteps(input.microSteps)
      : undefined,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };
};

const mergeLegacyTasks = async (state: TaskState) => {
  const legacyTasks = await StorageService.getJSON<LegacyStoredTask[]>(
    StorageService.STORAGE_KEYS.tasks,
  );

  if (!legacyTasks || legacyTasks.length === 0) {
    return;
  }

  const existingTasks = state.tasks;
  const existingByTitle = new Map(
    existingTasks.map((task) => [normalizeTitle(task.title), task]),
  );

  legacyTasks.forEach((legacyTask) => {
    const title = legacyTask.text?.trim();
    if (!title) {
      return;
    }

    const existing = existingByTitle.get(normalizeTitle(title));
    const normalizedMicroSteps = legacyTask.microSteps
      ? normalizeMicroSteps(legacyTask.microSteps)
      : undefined;

    if (existing) {
      const patch: Partial<Task> = {};
      if (!existing.microSteps?.length && normalizedMicroSteps?.length) {
        patch.microSteps = normalizedMicroSteps;
      }
      if (!existing.completed && legacyTask.completed) {
        patch.completed = true;
        patch.completedAt = Date.now();
      }
      if (Object.keys(patch).length > 0) {
        state.updateTask(existing.id, patch);
      }
      return;
    }

    const createdTask = state.addTask({
      id: legacyTask.id,
      title,
      priority: 'normal',
      source: 'manual',
      microSteps: normalizedMicroSteps,
      completed: legacyTask.completed,
    });
    existingByTitle.set(normalizeTitle(createdTask.title), createdTask);
  });

  await StorageService.remove(StorageService.STORAGE_KEYS.tasks);
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      _hasHydrated: false,

      addTask: (input) => {
        const newTask = toCanonicalTask(input);
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        return newTask;
      },

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? Date.now() : undefined,
                  updatedAt: Date.now(),
                }
              : t,
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      updateTask: (id, patch) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
          ),
        })),

      importFromGoogle: (googleTasks) =>
        set((state) => {
          const existingGoogleIds = new Set(
            state.tasks
              .filter((t) => t.googleTaskId)
              .map((t) => t.googleTaskId),
          );

          const newTasks: Task[] = googleTasks
            .filter((gt) => !existingGoogleIds.has(gt.id))
            .map((gt) =>
              toCanonicalTask({
                id: `task_gt_${gt.id}`,
                title: gt.title,
                description: gt.notes,
                priority: 'normal',
                completed: gt.status === 'completed',
                source: 'google',
                googleTaskId: gt.id,
              }),
            );

          return { tasks: [...newTasks, ...state.tasks] };
        }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      getActiveTasks: () => {
        return get().tasks.filter((t) => !t.completed);
      },

      getActiveCount: () => {
        return get().tasks.filter((t) => !t.completed).length;
      },
    }),
    {
      name: 'taskStore',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          mergeLegacyTasks(state)
            .catch(() => undefined)
            .finally(() => state.setHasHydrated(true));
        }
      },
    },
  ),
);
