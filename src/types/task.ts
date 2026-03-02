export type TaskPriority = 'urgent' | 'important' | 'normal';
export type TaskSource = 'manual' | 'capture' | 'google';

export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: string;
    completed: boolean;
    completedAt?: number;
    category?: string;
    source: TaskSource;
    googleTaskId?: string;
    createdAt: number;
    updatedAt: number;
}
