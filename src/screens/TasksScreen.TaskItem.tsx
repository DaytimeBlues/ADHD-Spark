import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { GlowCard } from '../ui/cosmic';
import type { Task } from '../types/task';
import {
  getTaskPriorityColors,
  TASK_PRIORITY_LABELS,
} from './TasksScreen.constants';
import { getTasksScreenStyles } from './TasksScreen.styles';
import { useTheme } from '../theme/useTheme';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export const TaskItem = memo(function TaskItem({
  task,
  onToggle,
  onDelete,
}: TaskItemProps) {
  const { isNightAwe, t, variant } = useTheme();
  const styles = useMemo(() => getTasksScreenStyles(variant, t), [t, variant]);
  const priorityColors = useMemo(
    () => getTaskPriorityColors(t, variant),
    [t, variant],
  );
  const checkboxScale = useSharedValue(1);

  const animatedCheckboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));

  const handleToggle = useCallback(() => {
    checkboxScale.value = withSequence(
      withSpring(1.2, { stiffness: 300, damping: 10 }),
      withSpring(1, { stiffness: 300, damping: 10 }),
    );
    onToggle();
  }, [checkboxScale, onToggle]);

  const content = (
    <View style={styles.taskContent}>
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.7}
        accessibilityLabel={
          task.completed ? 'Mark as incomplete' : 'Mark as complete'
        }
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityHint={`Toggle completion status for ${task.title}`}
      >
        <Animated.View
          testID={`task-checkbox-${task.id}`}
          style={[
            styles.checkbox,
            styles.checkboxDefault,
            task.completed && {
              backgroundColor: priorityColors[task.priority],
              borderColor: priorityColors[task.priority],
            },
            animatedCheckboxStyle,
          ]}
        >
          {task.completed && <Text style={styles.checkmark}>+</Text>}
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.taskInfo}>
        <Text
          style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}
        >
          {task.title}
        </Text>
        <View style={styles.taskMeta}>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: `${priorityColors[task.priority]}15` },
            ]}
          >
            <Text
              style={[
                styles.priorityLabel,
                { color: priorityColors[task.priority] },
              ]}
            >
              {TASK_PRIORITY_LABELS[task.priority]}
            </Text>
          </View>
          {task.dueDate && <Text style={styles.dueDate}>* {task.dueDate}</Text>}
        </View>
      </View>

      <TouchableOpacity
        onPress={onDelete}
        style={styles.deleteButton}
        accessibilityLabel="Delete task"
        accessibilityRole="button"
        accessibilityHint={`Removes ${task.title} from your task list`}
      >
        <Text style={styles.deleteIcon}>x</Text>
      </TouchableOpacity>
    </View>
  );

  if (isNightAwe) {
    return (
      <Pressable
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityLabel={task.title}
        style={({ pressed }) => [
          styles.taskCardSurface,
          task.completed && styles.taskCardSurfaceCompleted,
          pressed && { opacity: 0.9 },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <GlowCard
      tone="base"
      glow={task.priority === 'urgent' && !task.completed ? 'soft' : 'none'}
      onPress={handleToggle}
      style={styles.taskCard}
    >
      {content}
    </GlowCard>
  );
});
