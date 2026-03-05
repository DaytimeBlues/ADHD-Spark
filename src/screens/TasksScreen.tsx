import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeIn,
  SlideInRight,
  Layout,
} from 'react-native-reanimated';
import { CosmicBackground, GlowCard, RuneButton } from '../ui/cosmic';
import { useTaskStore } from '../store/useTaskStore';
import type { Task, TaskPriority } from '../types/task';
import { CosmicTokens } from '../theme/cosmicTokens';

// Cosmic priority colors - using semantic tokens
const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: CosmicTokens.colors.semantic.error,
  important: CosmicTokens.colors.semantic.warning,
  normal: CosmicTokens.colors.semantic.primary,
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: 'URGENT',
  important: 'IMPORTANT',
  normal: 'STABLE',
};

/**
 * TasksScreen
 *
 * Task manager with Cosmic UI aesthetic.
 * Focuses on soft glows, nebula colors, and rounded corners.
 */
export const TasksScreen = memo(function TasksScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Store
  const tasks = useTaskStore((state) => state.tasks);
  const addTaskStore = useTaskStore((state) => state.addTask);
  const toggleTaskStore = useTaskStore((state) => state.toggleTask);
  const deleteTaskStore = useTaskStore((state) => state.deleteTask);

  // Local UI State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter((t) => !t.completed);
      case 'completed':
        return tasks.filter((t) => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  // Actions
  const handleToggle = useCallback(
    (taskId: string) => {
      toggleTaskStore(taskId);
    },
    [toggleTaskStore],
  );

  const handleAdd = useCallback(() => {
    if (!newTaskTitle.trim()) {
      return;
    }
    addTaskStore({
      title: newTaskTitle.trim(),
      priority: 'normal',
      source: 'manual',
    });
    setNewTaskTitle('');
  }, [newTaskTitle, addTaskStore]);

  const handleDelete = useCallback(
    (taskId: string) => {
      deleteTaskStore(taskId);
    },
    [deleteTaskStore],
  );

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    // Placeholder for actual sync logic in Phase 5
    setTimeout(() => setIsSyncing(false), 1500);
  }, []);

  // Stats
  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      urgent: tasks.filter((t) => t.priority === 'urgent' && !t.completed)
        .length,
    }),
    [tasks],
  );

  return (
    <CosmicBackground variant="ridge">
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Navigates to the previous screen"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>TASKS</Text>
            <Text style={styles.headerSubtitle}>NEBULA QUEUE</Text>
          </View>
        </View>

        <RuneButton
          variant="secondary"
          size="sm"
          onPress={handleSync}
          loading={isSyncing}
          style={styles.syncButton}
        >
          {isSyncing ? 'SYNCING' : 'SYNC'}
        </RuneButton>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Dashboard */}
        <Animated.View entering={FadeIn.delay(100).duration(300)}>
          <View style={styles.statsRow}>
            <GlowCard
              tone="raised"
              glow="soft"
              padding="sm"
              style={styles.statCard}
            >
              <Text
                style={[styles.statValue, { color: PRIORITY_COLORS.urgent }]}
              >
                {stats.urgent}
              </Text>
              <Text style={styles.statLabel}>URGENT</Text>
            </GlowCard>

            <GlowCard
              tone="raised"
              glow="none"
              padding="sm"
              style={styles.statCard}
            >
              <Text
                style={[styles.statValue, { color: PRIORITY_COLORS.normal }]}
              >
                {stats.total - stats.completed}
              </Text>
              <Text style={styles.statLabel}>ACTIVE</Text>
            </GlowCard>

            <GlowCard
              tone="raised"
              glow="none"
              padding="sm"
              style={styles.statCard}
            >
              <Text style={[styles.statValue, { color: '#EEF2FF' }]}>
                {stats.completed}
              </Text>
              <Text style={styles.statLabel}>DONE</Text>
            </GlowCard>
          </View>
        </Animated.View>

        {/* Add Task */}
        <Animated.View entering={FadeIn.delay(200).duration(300)}>
          <GlowCard tone="sunken" padding="none" style={styles.addTaskCard}>
            <View style={styles.addTaskContent}>
              <TextInput
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="New objective..."
                placeholderTextColor="rgba(238, 242, 255, 0.4)"
                onSubmitEditing={handleAdd}
                returnKeyType="done"
                style={styles.addTaskInput}
              />
              <RuneButton
                variant="primary"
                size="sm"
                onPress={handleAdd}
                disabled={!newTaskTitle.trim()}
                style={styles.addTaskButton}
              >
                +
              </RuneButton>
            </View>
          </GlowCard>
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View entering={FadeIn.delay(300).duration(300)}>
          <View style={styles.filterTabs}>
            <FilterTab
              label="ALL"
              active={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            <FilterTab
              label="ACTIVE"
              active={filter === 'active'}
              onPress={() => setFilter('active')}
            />
            <FilterTab
              label="DONE"
              active={filter === 'completed'}
              onPress={() => setFilter('completed')}
            />
          </View>
        </Animated.View>

        {/* Task List */}
        <Animated.View layout={Layout.springify()}>
          {filteredTasks.map((task, index) => (
            <Animated.View
              key={task.id}
              entering={SlideInRight.delay(index * 50).duration(300)}
            >
              <TaskItem
                task={task}
                onToggle={() => handleToggle(task.id)}
                onDelete={() => handleDelete(task.id)}
              />
            </Animated.View>
          ))}

          {filteredTasks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyText}>Celestial Clear</Text>
              <Text style={styles.emptySubtext}>
                The nebula is waiting for its next mission
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </CosmicBackground>
  );
});

// Filter tab component
interface FilterTabProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterTab = memo(function FilterTab({
  label,
  active,
  onPress,
}: FilterTabProps) {
  return (
    <RuneButton
      variant={active ? 'primary' : 'ghost'}
      size="sm"
      onPress={onPress}
      style={styles.filterTab}
    >
      {label}
    </RuneButton>
  );
});

// Task item component
interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const TaskItem = memo(function TaskItem({
  task,
  onToggle,
  onDelete,
}: TaskItemProps) {
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

  return (
    <GlowCard
      tone="base"
      glow={task.priority === 'urgent' && !task.completed ? 'soft' : 'none'}
      onPress={handleToggle}
      style={styles.taskCard}
    >
      <View style={styles.taskContent}>
        {/* Checkbox */}
        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.7}
          accessibilityLabel={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.completed }}
          accessibilityHint={`Toggle completion status for ${task.title}`}
        >
          <Animated.View
            style={[
              styles.checkbox,
              task.completed && {
                backgroundColor: PRIORITY_COLORS[task.priority],
                borderColor: PRIORITY_COLORS[task.priority],
              },
              { borderColor: 'rgba(185, 194, 217, 0.3)' },
              animatedCheckboxStyle,
            ]}
          >
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </Animated.View>
        </TouchableOpacity>

        {/* Task info */}
        <View style={styles.taskInfo}>
          <Text
            style={[
              styles.taskTitle,
              task.completed && styles.taskTitleCompleted,
            ]}
          >
            {task.title}
          </Text>
          <View style={styles.taskMeta}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: `${PRIORITY_COLORS[task.priority]}15` },
              ]}
            >
              <Text
                style={[
                  styles.priorityLabel,
                  { color: PRIORITY_COLORS[task.priority] },
                ]}
              >
                {PRIORITY_LABELS[task.priority]}
              </Text>
            </View>
            {task.dueDate && (
              <Text style={styles.dueDate}>• {task.dueDate}</Text>
            )}
          </View>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
          accessibilityLabel="Delete task"
          accessibilityRole="button"
          accessibilityHint={`Removes ${task.title} from your task list`}
        >
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </GlowCard>
  );
});

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EEF2FF', // starlight
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: CosmicTokens.colors.semantic.primary,
    letterSpacing: 3,
    marginTop: -2,
  },
  backButton: {
    marginRight: 16,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#EEF2FF',
    fontSize: 24,
  },
  syncButton: {
    paddingHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(238, 242, 255, 0.5)',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  addTaskCard: {
    marginTop: 24,
    borderRadius: 16,
  },
  addTaskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
  },
  addTaskInput: {
    flex: 1,
    color: '#EEF2FF',
    fontSize: 16,
    paddingVertical: 8,
  },
  addTaskButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  filterTabs: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
    marginBottom: 8,
  },
  filterTab: {
    flex: 1,
  },
  taskCard: {
    marginTop: 12,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EEF2FF',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(238, 242, 255, 0.4)',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dueDate: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(238, 242, 255, 0.4)',
    marginLeft: 8,
  },
  deleteButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    color: 'rgba(238, 242, 255, 0.3)',
    fontSize: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EEF2FF',
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(238, 242, 255, 0.5)',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default TasksScreen;
