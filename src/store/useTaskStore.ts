import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../services/StorageService';
import type { Task, TaskPriority, TaskSource } from '../types/task';

interface TaskState {
    tasks: Task[];
    _hasHydrated: boolean;

    // Actions
    addTask: (input: { title: string; description?: string; priority?: TaskPriority; source?: TaskSource; googleTaskId?: string }) => void;
    toggleTask: (id: string) => void;
    deleteTask: (id: string) => void;
    updateTask: (id: string, patch: Partial<Task>) => void;
    importFromGoogle: (googleTasks: any[]) => void;
    setHasHydrated: (state: boolean) => void;

    // Selectors
    getActiveTasks: () => Task[];
    getActiveCount: () => number;
}

export const useTaskStore = create<TaskState>()(
    persist(
        (set, get) => ({
            tasks: [],
            _hasHydrated: false,

            addTask: (input) =>
                set((state) => {
                    const now = Date.now();
                    const newTask: Task = {
                        id: `task_${now}_${Math.random().toString(36).slice(2, 7)}`,
                        title: input.title,
                        description: input.description,
                        priority: input.priority || 'normal',
                        completed: false,
                        source: input.source || 'manual',
                        googleTaskId: input.googleTaskId,
                        createdAt: now,
                        updatedAt: now,
                    };
                    return { tasks: [newTask, ...state.tasks] };
                }),

            toggleTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id
                            ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined, updatedAt: Date.now() }
                            : t
                    ),
                })),

            deleteTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                })),

            updateTask: (id, patch) =>
                set((state) => ({
                    tasks: state.tasks.map((t) =>
                        t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t
                    ),
                })),

            importFromGoogle: (googleTasks) =>
                set((state) => {
                    const existingGoogleIds = new Set(
                        state.tasks.filter((t) => t.googleTaskId).map((t) => t.googleTaskId)
                    );

                    const newTasks: Task[] = googleTasks
                        .filter((gt) => !existingGoogleIds.has(gt.id))
                        .map((gt) => ({
                            id: `task_gt_${gt.id}`,
                            title: gt.title,
                            description: gt.notes,
                            priority: 'normal',
                            completed: gt.status === 'completed',
                            source: 'google',
                            googleTaskId: gt.id,
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                        }));

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
                    state.setHasHydrated(true);
                }
            },
        }
    )
);
