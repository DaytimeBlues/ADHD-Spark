import { generateId } from './helpers';

export type MicroStepStatus = 'new' | 'next' | 'in_progress' | 'done';

export type MicroStep = {
  id: string;
  text: string;
  status: MicroStepStatus;
};

export const ensureSingleNext = (steps: MicroStep[]): MicroStep[] => {
  let seenNext = false;
  let hasInProgress = false;

  const normalized: MicroStep[] = steps.map((step) => {
    if (step.status === 'in_progress') {
      hasInProgress = true;
    }

    if (step.status === 'next') {
      if (seenNext) {
        return { ...step, status: 'new' };
      }
      seenNext = true;
    }

    return step;
  });

  if (!seenNext && !hasInProgress && normalized.length > 0) {
    const firstNewIndex = normalized.findIndex((step) => step.status === 'new');
    const fallbackIndex =
      firstNewIndex >= 0
        ? firstNewIndex
        : normalized.findIndex((step) => step.status !== 'done');

    if (fallbackIndex >= 0) {
      normalized[fallbackIndex] = {
        ...normalized[fallbackIndex],
        status: 'next',
      };
    }
  }

  return normalized;
};

export const advanceTaskProgress = <
  T extends { microSteps: MicroStep[]; completed: boolean },
>(task: T): T => {
  if (task.completed || task.microSteps.length === 0) {
    return task;
  }

  const steps = [...task.microSteps];
  const inProgressIndex = steps.findIndex((step) => step.status === 'in_progress');

  if (inProgressIndex >= 0) {
    steps[inProgressIndex] = {
      ...steps[inProgressIndex],
      status: 'done',
    };
  } else {
    const nextIndex = steps.findIndex((step) => step.status === 'next');
    const fallbackIndex =
      nextIndex >= 0 ? nextIndex : steps.findIndex((step) => step.status === 'new');

    if (fallbackIndex >= 0) {
      steps[fallbackIndex] = {
        ...steps[fallbackIndex],
        status: 'in_progress',
      };
    }
  }

  const normalized = ensureSingleNext(steps);
  const isCompleted = normalized.every((step) => step.status === 'done');

  return {
    ...task,
    microSteps: normalized,
    completed: isCompleted,
  };
};

export const getTaskProgressSummary = (steps: MicroStep[]): string => {
  const done = steps.filter((step) => step.status === 'done').length;
  return `${done}/${steps.length} DONE`;
};

export const normalizeMicroSteps = (
  steps: string[] | MicroStep[] | undefined,
): MicroStep[] => {
  if (!Array.isArray(steps) || steps.length === 0) {
    return [];
  }

  const converted: MicroStep[] = steps.map((item, index) => {
    if (typeof item === 'string') {
      return {
        id: generateId(),
        text: item,
        status: index === 0 ? 'next' : 'new',
      };
    }

    const status: MicroStepStatus =
      item.status === 'new' ||
      item.status === 'next' ||
      item.status === 'in_progress' ||
      item.status === 'done'
        ? item.status
        : index === 0
          ? 'next'
          : 'new';

    return {
      id: item.id || generateId(),
      text: item.text,
      status,
    };
  });

  return ensureSingleNext(converted);
};
