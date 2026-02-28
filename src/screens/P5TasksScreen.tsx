/**
 * P5TasksScreen - Persona 5 Style Task Management
 * 
 * Task list with angular containers, priority indicators,
 * and swipe actions for organization.
 * 
 * @example
 * <P5TasksScreen />
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
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
import {
  P5Screen,
  P5Header,
  P5Button,
  P5Card,
  P5Input,
  P5TabBar,
} from '../ui/p5';
import {
  P5Colors,
  P5Spacing,
  P5Typography,
  P5FontSizes,
  P5Motion,
} from '../theme/p5Tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Task types
type TaskPriority = 'normal' | 'important' | 'urgent';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  completed: boolean;
  category?: string;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: P5Colors.primary,
  important: P5Colors.warning,
  normal: P5Colors.textMuted,
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: 'URGENT',
  important: 'IMPORTANT',
  normal: 'NORMAL',
};

export const P5TasksScreen = memo(function P5TasksScreen() {
  const insets = useSafeAreaInsets();
  
  // State
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete project proposal', priority: 'urgent', dueDate: 'Today', completed: false },
    { id: '2', title: 'Review team deliverables', priority: 'urgent', dueDate: 'Today', completed: false },
    { id: '3', title: 'Update documentation', priority: 'important', dueDate: 'Tomorrow', completed: false },
    { id: '4', title: 'Client meeting prep', priority: 'important', dueDate: 'Fri', completed: false },
    { id: '5', title: 'Weekly report', priority: 'normal', dueDate: 'Fri', completed: false },
    { id: '6', title: 'Email follow-ups', priority: 'normal', completed: true },
    { id: '7', title: 'Code review', priority: 'normal', completed: true },
  ]);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [activeTab, setActiveTab] = useState('tasks');
  
  // Filter tasks
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter(t => !t.completed);
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);
  
  // Toggle task completion
  const toggleTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  }, []);
  
  // Add new task
  const addTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      priority: 'normal',
      completed: false,
    };
    
    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
  }, [newTaskTitle]);
  
  // Delete task
  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);
  
  // Tabs
  const tabs = [
    { key: 'home', icon: 'home', label: 'Home' },
    { key: 'tasks', icon: 'tasks', label: 'Tasks' },
    { key: 'timer', icon: 'timer', label: 'Focus' },
    { key: 'journal', icon: 'journal', label: 'Journal' },
    { key: 'profile', icon: 'profile', label: 'Profile' },
  ];
  
  // Stats
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    urgent: tasks.filter(t => t.priority === 'urgent' && !t.completed).length,
  }), [tasks]);
  
  return (
    <P5Screen>
      <P5Header 
        title="TASKS" 
        subtitle="MISSION QUEUE"
        showBack 
        onBack={() => {}}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Dashboard */}
        <Animated.View entering={FadeIn.delay(100).duration(300)}>
          <View style={styles.statsRow}>
            <P5Card accentPosition="left" intensity="alert" style={styles.statCard}>
              <Text style={styles.statValue}>{stats.urgent}</Text>
              <Text style={styles.statLabel}>URGENT</Text>
            </P5Card>
            
            <P5Card accentPosition="right" intensity="subtle" style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total - stats.completed}</Text>
              <Text style={styles.statLabel}>ACTIVE</Text>
            </P5Card>
            
            <P5Card accentPosition="bottom" intensity="subtle" style={styles.statCard}>
              <Text style={styles.statValue}>{stats.completed}</Text>
              <Text style={styles.statLabel}>DONE</Text>
            </P5Card>
          </View>
        </Animated.View>
        
        {/* Add Task */}
        <Animated.View entering={FadeIn.delay(200).duration(300)}>
          <View style={styles.addTaskContainer}>
            <P5Input
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="New mission..."
              onSubmitEditing={addTask}
              returnKeyType="done"
              style={styles.addTaskInput}
            />
            <P5Button
              variant="primary"
              size="md"
              onPress={addTask}
              disabled={!newTaskTitle.trim()}
              style={styles.addTaskButton}
            >
              +
            </P5Button>
          </View>
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
                onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            </Animated.View>
          ))}
          
          {filteredTasks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyText}>No missions here</Text>
              <Text style={styles.emptySubtext}>Add a new task to get started</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
      
      {/* Bottom Tab Bar */}
      <P5TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
        showLabels={true}
      />
    </P5Screen>
  );
});

// Filter tab component
interface FilterTabProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

const FilterTab = memo(function FilterTab({ label, active, onPress }: FilterTabProps) {
  return (
    <Animated.View>
      <P5Button
        variant={active ? 'primary' : 'ghost'}
        size="sm"
        onPress={onPress}
        style={styles.filterTab}
      >
        {label}
      </P5Button>
    </Animated.View>
  );
});

// Task item component
interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const TaskItem = memo(function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const checkboxScale = useSharedValue(1);
  
  const animatedCheckboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));
  
  const handleToggle = useCallback(() => {
    checkboxScale.value = withSequence(
      withSpring(1.2, { stiffness: 300, damping: 10 }),
      withSpring(1, { stiffness: 300, damping: 10 })
    );
    onToggle();
  }, [checkboxScale, onToggle]);
  
  return (
    <P5Card
      accentPosition="left"
      intensity={task.priority === 'urgent' ? 'alert' : 'subtle'}
      onPress={handleToggle}
      style={styles.taskCard}
    >
      <View style={styles.taskContent}>
        {/* Priority indicator */}
        <View style={[styles.priorityBar, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
        
        {/* Checkbox */}
        <Animated.View style={[styles.checkbox, task.completed && styles.checkboxChecked, animatedCheckboxStyle]}>
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </Animated.View>
        
        {/* Task info */}
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
            {task.title}
          </Text>
          <View style={styles.taskMeta}>
            <Text style={[styles.priorityLabel, { color: PRIORITY_COLORS[task.priority] }]}>
              {PRIORITY_LABELS[task.priority]}
            </Text>
            {task.dueDate && (
              <Text style={styles.dueDate}>• {task.dueDate}</Text>
            )}
          </View>
        </View>
        
        {/* Delete button */}
        <P5Button
          variant="ghost"
          size="sm"
          onPress={onDelete}
          style={styles.deleteButton}
        >
          ✕
        </P5Button>
      </View>
    </P5Card>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: P5Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: P5Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: P5Spacing.md,
  },
  statValue: {
    fontSize: P5FontSizes.heading1,
    fontWeight: '900',
    color: P5Colors.text,
  },
  statLabel: {
    fontSize: P5FontSizes.caption,
    fontWeight: '700',
    color: P5Colors.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  addTaskContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: P5Spacing.lg,
    gap: P5Spacing.sm,
  },
  addTaskInput: {
    flex: 1,
    marginBottom: 0,
  },
  addTaskButton: {
    width: 56,
    height: 56,
  },
  filterTabs: {
    flexDirection: 'row',
    marginTop: P5Spacing.lg,
    gap: P5Spacing.sm,
  },
  filterTab: {
    flex: 1,
  },
  taskCard: {
    marginTop: P5Spacing.sm,
    padding: P5Spacing.md,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBar: {
    width: 4,
    height: 40,
    marginRight: P5Spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: P5Colors.stroke,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: P5Spacing.md,
  },
  checkboxChecked: {
    backgroundColor: P5Colors.primary,
    borderColor: P5Colors.primary,
  },
  checkmark: {
    color: P5Colors.text,
    fontWeight: '900',
    fontSize: 16,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: P5FontSizes.body,
    fontWeight: '600',
    color: P5Colors.text,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: P5Colors.textMuted,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priorityLabel: {
    fontSize: P5FontSizes.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dueDate: {
    fontSize: P5FontSizes.caption,
    fontWeight: '500',
    color: P5Colors.textMuted,
    marginLeft: 4,
  },
  deleteButton: {
    width: 32,
    height: 32,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: P5Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: P5Spacing.md,
  },
  emptyText: {
    fontSize: P5FontSizes.heading1,
    fontWeight: '900',
    color: P5Colors.text,
    textTransform: 'uppercase',
  },
  emptySubtext: {
    fontSize: P5FontSizes.body,
    fontWeight: '500',
    color: P5Colors.textMuted,
    marginTop: P5Spacing.xs,
  },
});

export default P5TasksScreen;
