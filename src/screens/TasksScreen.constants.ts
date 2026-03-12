import type { TaskPriority } from '../types/task';
import type { ThemeTokens } from '../theme/types';
import type { ThemeVariant } from '../theme/themeVariant';

export const getTaskPriorityColors = (
  t: ThemeTokens,
  variant: ThemeVariant,
): Record<TaskPriority, string> => ({
  urgent: t.colors.semantic.error,
  important:
    variant === 'nightAwe'
      ? t.colors.nightAwe?.feature?.tasks || t.colors.semantic.warning
      : t.colors.semantic.warning,
  normal:
    variant === 'nightAwe'
      ? t.colors.nightAwe?.feature?.tasks || t.colors.semantic.primary
      : t.colors.semantic.primary,
});

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: 'URGENT',
  important: 'IMPORTANT',
  normal: 'STABLE',
};
