import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  Layout,
  SlideInRight,
} from 'react-native-reanimated';
import { CosmicBackground, GlowCard, RuneButton } from '../ui/cosmic';
import { NightAweBackground } from '../ui/nightAwe';
import { ROUTES } from '../navigation/routes';
import { useTaskStore } from '../store/useTaskStore';
import { getTaskPriorityColors } from './TasksScreen.constants';
import { FilterTab } from './TasksScreen.FilterTab';
import { getTasksScreenStyles } from './TasksScreen.styles';
import { TaskItem } from './TasksScreen.TaskItem';
import { useTheme } from '../theme/useTheme';

export const TasksScreen = memo(function TasksScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { isNightAwe, t, variant } = useTheme();
  const styles = useMemo(() => getTasksScreenStyles(variant, t), [t, variant]);
  const priorityColors = useMemo(
    () => getTaskPriorityColors(t, variant),
    [t, variant],
  );

  const tasks = useTaskStore((state) => state.tasks);
  const addTaskStore = useTaskStore((state) => state.addTask);
  const toggleTaskStore = useTaskStore((state) => state.toggleTask);
  const deleteTaskStore = useTaskStore((state) => state.deleteTask);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter((task) => !task.completed);
      case 'completed':
        return tasks.filter((task) => task.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
      urgent: tasks.filter(
        (task) => task.priority === 'urgent' && !task.completed,
      ).length,
    }),
    [tasks],
  );

  const handleAdd = useCallback(() => {
    const title = newTaskTitle.trim();
    if (!title) {
      return;
    }

    addTaskStore({
      title,
      priority: 'normal',
      source: 'manual',
    });
    setNewTaskTitle('');
  }, [addTaskStore, newTaskTitle]);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  }, []);

  const handleOpenBrainDump = useCallback(() => {
    navigation.navigate(ROUTES.BRAIN_DUMP as never);
  }, [navigation]);

  const utilityActions = isNightAwe ? (
    <View style={styles.headerActions}>
      <Pressable
        onPress={handleSync}
        accessibilityRole="button"
        accessibilityLabel="Sync tasks"
        style={({ pressed }) => [
          styles.utilityButton,
          pressed && { opacity: 0.88 },
        ]}
      >
        <Text style={styles.utilityButtonText}>
          {isSyncing ? 'SYNCING' : 'SYNC'}
        </Text>
      </Pressable>
      <Pressable
        onPress={handleOpenBrainDump}
        accessibilityRole="button"
        accessibilityLabel="Open Brain Dump"
        testID="open-brain-dump"
        style={({ pressed }) => [
          styles.utilityButton,
          pressed && { opacity: 0.88 },
        ]}
      >
        <Text style={styles.utilityButtonText}>BRAIN DUMP</Text>
      </Pressable>
    </View>
  ) : (
    <View style={styles.headerActions}>
      <RuneButton
        variant="secondary"
        size="sm"
        onPress={handleSync}
        loading={isSyncing}
        style={styles.syncButton}
      >
        {isSyncing ? 'SYNCING' : 'SYNC'}
      </RuneButton>
      <RuneButton
        variant="secondary"
        size="sm"
        onPress={handleOpenBrainDump}
        style={styles.syncButton}
        testID="open-brain-dump"
      >
        BRAIN DUMP
      </RuneButton>
    </View>
  );

  const content = (
    <>
      <View
        style={[styles.header, { paddingTop: insets.top + 16 }]}
        accessibilityLabel="Tasks screen"
        accessibilityRole="summary"
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>TASKS</Text>
            <Text style={styles.headerSubtitle}>
              {isNightAwe ? 'STEADY QUEUE' : 'NEBULA QUEUE'}
            </Text>
          </View>
        </View>

        {utilityActions}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.delay(100).duration(300)}>
          <View style={styles.statsRow}>
            {isNightAwe ? (
              <>
                <View style={styles.statCardSurface}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: priorityColors.urgent },
                    ]}
                  >
                    {stats.urgent}
                  </Text>
                  <Text style={styles.statLabel}>URGENT</Text>
                </View>
                <View style={styles.statCardSurface}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: priorityColors.normal },
                    ]}
                  >
                    {stats.total - stats.completed}
                  </Text>
                  <Text style={styles.statLabel}>ACTIVE</Text>
                </View>
                <View style={styles.statCardSurface}>
                  <Text style={[styles.statValue, styles.statValueCompleted]}>
                    {stats.completed}
                  </Text>
                  <Text style={styles.statLabel}>DONE</Text>
                </View>
              </>
            ) : (
              <>
                <GlowCard
                  tone="raised"
                  glow="soft"
                  padding="sm"
                  style={styles.statCard}
                >
                  <Text
                    style={[
                      styles.statValue,
                      { color: priorityColors.urgent },
                    ]}
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
                    style={[
                      styles.statValue,
                      { color: priorityColors.normal },
                    ]}
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
                  <Text style={[styles.statValue, styles.statValueCompleted]}>
                    {stats.completed}
                  </Text>
                  <Text style={styles.statLabel}>DONE</Text>
                </GlowCard>
              </>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200).duration(300)}>
          {isNightAwe ? (
            <View style={styles.addTaskCardSurface}>
              <View style={styles.addTaskContent}>
                <TextInput
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  placeholder="New objective..."
                  placeholderTextColor={
                    t.colors.text?.muted || 'rgba(238, 242, 255, 0.4)'
                  }
                  onSubmitEditing={handleAdd}
                  returnKeyType="done"
                  style={styles.addTaskInput}
                />
                <Pressable
                  onPress={handleAdd}
                  disabled={!newTaskTitle.trim()}
                  accessibilityRole="button"
                  accessibilityLabel="Add task"
                  style={({ pressed }) => [
                    styles.addTaskButtonSurface,
                    (pressed || !newTaskTitle.trim()) && {
                      opacity: !newTaskTitle.trim() ? 0.45 : 0.88,
                    },
                  ]}
                >
                  <Text style={styles.addTaskButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          ) : (
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
          )}
        </Animated.View>

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

        <Animated.View layout={Layout.springify()}>
          {filteredTasks.map((task, index) => (
            <Animated.View
              key={task.id}
              entering={SlideInRight.delay(index * 50).duration(300)}
            >
              <TaskItem
                task={task}
                onToggle={() => toggleTaskStore(task.id)}
                onDelete={() => deleteTaskStore(task.id)}
              />
            </Animated.View>
          ))}

          {filteredTasks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>*</Text>
              <Text style={styles.emptyText}>
                {isNightAwe ? 'Quiet Queue' : 'Celestial Clear'}
              </Text>
              <Text style={styles.emptySubtext}>
                {isNightAwe
                  ? 'Add one grounded next step when you are ready'
                  : 'The nebula is waiting for its next mission'}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </>
  );

  if (isNightAwe) {
    return (
      <NightAweBackground
        variant="focus"
        activeFeature="tasks"
        motionMode="idle"
        dimmer={false}
      >
        {content}
      </NightAweBackground>
    );
  }

  return <CosmicBackground variant="ridge">{content}</CosmicBackground>;
});

export default TasksScreen;
