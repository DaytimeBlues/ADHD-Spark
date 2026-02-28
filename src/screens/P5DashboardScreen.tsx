/**
 * P5DashboardScreen - Persona 5 Style Dashboard
 * 
 * Main entry point styled as "Metaverse Navigator" - dramatic, high-energy
 * presentation of daily missions and focus tools.
 * 
 * @example
 * <P5DashboardScreen />
 */

import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import {
  P5Screen,
  P5Header,
  P5Button,
  P5Card,
  P5Selector,
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

// Mock data types
interface Task {
  id: string;
  title: string;
  priority: 'normal' | 'important' | 'urgent';
  dueTime?: string;
  completed: boolean;
}

interface DailyMission {
  id: string;
  title: string;
  subtitle?: string;
  progress: number;
}

// Animated components
const AnimatedView = Animated.createAnimatedComponent(View);

export const P5DashboardScreen = memo(function P5DashboardScreen() {
  const insets = useSafeAreaInsets();
  
  // State
  const [activeTab, setActiveTab] = useState('home');
  const [refreshing, setRefreshing] = useState(false);
  const [focusModeActive, setFocusModeActive] = useState(false);
  
  // Mock data
  const [currentMission] = useState<DailyMission>({
    id: '1',
    title: 'Complete Project Proposal',
    subtitle: 'Review and submit to manager',
    progress: 65,
  });
  
  const [tasks] = useState<Task[]>([
    { id: '1', title: 'Review quarterly metrics', priority: 'urgent', dueTime: '2h', completed: false },
    { id: '2', title: 'Update client documentation', priority: 'important', dueTime: 'Tomorrow', completed: false },
    { id: '3', title: 'Team sync meeting notes', priority: 'normal', completed: true },
    { id: '4', title: 'Email follow-ups', priority: 'normal', dueTime: '4h', completed: false },
  ]);
  
  // Animation values
  const missionScale = useSharedValue(0.9);
  
  // Animate mission on mount
  useEffect(() => {
    missionScale.value = withDelay(
      300,
      withSpring(1, { stiffness: P5Motion.easing.spring.stiffness, damping: P5Motion.easing.spring.damping })
    );
  }, [missionScale]);
  
  // Animated mission style
  const animatedMissionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: missionScale.value }],
  }));
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);
  
  // Handle focus mode toggle
  const toggleFocusMode = useCallback(() => {
    setFocusModeActive(prev => !prev);
  }, []);
  
  // Format current date
  const formattedDate = useMemo(() => {
    const now = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${months[now.getMonth()].toUpperCase()}. ${now.getDate()} ${days[now.getDay()].toUpperCase()}`;
  }, []);
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return P5Colors.primary;
      case 'important': return P5Colors.warning;
      default: return P5Colors.textMuted;
    }
  };
  
  // Tabs
  const tabs = [
    { key: 'home', icon: 'home', label: 'Home' },
    { key: 'tasks', icon: 'tasks', label: 'Tasks' },
    { key: 'timer', icon: 'timer', label: 'Focus' },
    { key: 'journal', icon: 'journal', label: 'Journal' },
    { key: 'profile', icon: 'profile', label: 'Profile' },
  ];
  
  return (
    <P5Screen>
      {/* Header */}
      <P5Header 
        title="METAZONE" 
        subtitle={formattedDate}
        variant="large"
      />
      
      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 80 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={P5Colors.primary}
            colors={[P5Colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Focus Mode Toggle */}
        <Animated.View entering={FadeIn.delay(100).duration(300)}>
          <P5Button
            variant={focusModeActive ? 'primary' : 'secondary'}
            size="lg"
            onPress={toggleFocusMode}
            style={styles.focusModeButton}
          >
            {focusModeActive ? '⏸ INFILTRATION MODE' : '▶ START MISSION'}
          </P5Button>
        </Animated.View>
        
        {/* Current Mission Selector */}
        <Animated.View 
          style={[styles.missionSection, animatedMissionStyle]}
          entering={FadeIn.delay(200).duration(400)}
        >
          <Text style={styles.sectionLabel}>TODAY'S MISSION</Text>
          <P5Selector
            size={SCREEN_WIDTH - P5Spacing.lg * 2}
            selected={true}
            pulse={!focusModeActive}
          >
            <View style={styles.missionContent}>
              <Text style={styles.missionTitle}>{currentMission.title}</Text>
              {currentMission.subtitle && (
                <Text style={styles.missionSubtitle}>{currentMission.subtitle}</Text>
              )}
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      { width: `${currentMission.progress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{currentMission.progress}%</Text>
              </View>
            </View>
          </P5Selector>
        </Animated.View>
        
        {/* Quick Actions */}
        <Animated.View entering={FadeIn.delay(400).duration(300)}>
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
          <View style={styles.quickActionsGrid}>
            <P5Card 
              accentPosition="left" 
              intensity="bold"
              onPress={() => {}}
              style={styles.actionCard}
            >
              <Text style={styles.actionIcon}>⚡</Text>
              <Text style={styles.actionTitle}>IGNITE</Text>
              <Text style={styles.actionSubtitle}>5-min focus</Text>
            </P5Card>
            
            <P5Card 
              accentPosition="right" 
              intensity="bold"
              onPress={() => {}}
              style={styles.actionCard}
            >
              <Text style={styles.actionIcon}>🗡️</Text>
              <Text style={styles.actionTitle}>FOG CUTTER</Text>
              <Text style={styles.actionSubtitle}>Break it down</Text>
            </P5Card>
            
            <P5Card 
              accentPosition="left" 
              intensity="subtle"
              onPress={() => {}}
              style={styles.actionCard}
            >
              <Text style={styles.actionIcon}>⏱️</Text>
              <Text style={styles.actionTitle}>POMODORO</Text>
              <Text style={styles.actionSubtitle}>Classic timer</Text>
            </P5Card>
            
            <P5Card 
              accentPosition="right" 
              intensity="subtle"
              onPress={() => {}}
              style={styles.actionCard}
            >
              <Text style={styles.actionIcon}>🧘</Text>
              <Text style={styles.actionTitle}>ANCHOR</Text>
              <Text style={styles.actionSubtitle}>Breathe</Text>
            </P5Card>
          </View>
        </Animated.View>
        
        {/* Priority Queue */}
        <Animated.View entering={FadeIn.delay(600).duration(300)}>
          <Text style={styles.sectionLabel}>PRIORITY QUEUE</Text>
          {tasks.map((task, index) => (
            <Animated.View
              key={task.id}
              entering={SlideInDown.delay(700 + index * 100).duration(300)}
            >
              <P5Card
                accentPosition="left"
                intensity={task.priority === 'urgent' ? 'alert' : 'subtle'}
                style={styles.taskCard}
                onPress={() => {}}
              >
                <View style={styles.taskContent}>
                  <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, task.completed && styles.taskCompleted]}>
                      {task.title}
                    </Text>
                    {task.dueTime && (
                      <Text style={styles.taskDue}>{task.dueTime}</Text>
                    )}
                  </View>
                  <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
                    {task.completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </View>
              </P5Card>
            </Animated.View>
          ))}
        </Animated.View>
        
        {/* Confidant Rank Progress */}
        <Animated.View entering={FadeIn.delay(1000).duration(300)}>
          <Text style={styles.sectionLabel}>CONFIDANT RANK</Text>
          <P5Card accentPosition="bottom" intensity="bold">
            <View style={styles.confidantContainer}>
              <View style={styles.confidantAvatar}>
                <Text style={styles.confidantEmoji}>🎭</Text>
              </View>
              <View style={styles.confidantInfo}>
                <Text style={styles.confidantName}>Productivity Phantom</Text>
                <Text style={styles.confidantLevel}>RANK 7 - CONFIDANT</Text>
                <View style={styles.confidantProgressBg}>
                  <View style={styles.confidantProgressFill} />
                </View>
                <Text style={styles.confidantNext}>Next: 3 more missions</Text>
              </View>
            </View>
          </P5Card>
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

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: P5Spacing.md,
  },
  focusModeButton: {
    marginBottom: P5Spacing.lg,
  },
  sectionLabel: {
    fontSize: P5FontSizes.caption,
    fontWeight: '700',
    color: P5Colors.primary,
    letterSpacing: 2,
    marginBottom: P5Spacing.sm,
    marginTop: P5Spacing.lg,
  },
  missionSection: {
    marginBottom: P5Spacing.md,
  },
  missionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: P5Spacing.md,
  },
  missionTitle: {
    fontSize: P5FontSizes.heading1,
    fontWeight: '900',
    color: P5Colors.text,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  missionSubtitle: {
    fontSize: P5FontSizes.body,
    fontWeight: '500',
    color: P5Colors.textSecondary,
    textAlign: 'center',
    marginTop: P5Spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: P5Spacing.md,
    width: '80%',
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: P5Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: P5Colors.primary,
  },
  progressText: {
    fontSize: P5FontSizes.caption,
    fontWeight: '700',
    color: P5Colors.primary,
    minWidth: 40,
    textAlign: 'right',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (SCREEN_WIDTH - P5Spacing.md * 3) / 2,
    marginBottom: P5Spacing.sm,
    padding: P5Spacing.md,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: P5Spacing.xs,
  },
  actionTitle: {
    fontSize: P5FontSizes.heading2,
    fontWeight: '900',
    color: P5Colors.text,
    textTransform: 'uppercase',
  },
  actionSubtitle: {
    fontSize: P5FontSizes.caption,
    fontWeight: '500',
    color: P5Colors.textMuted,
  },
  taskCard: {
    marginBottom: P5Spacing.sm,
    padding: P5Spacing.md,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 4,
    height: 40,
    marginRight: P5Spacing.md,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: P5FontSizes.body,
    fontWeight: '600',
    color: P5Colors.text,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: P5Colors.textMuted,
  },
  taskDue: {
    fontSize: P5FontSizes.caption,
    fontWeight: '500',
    color: P5Colors.textMuted,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: P5Colors.stroke,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: P5Colors.primary,
    borderColor: P5Colors.primary,
  },
  checkmark: {
    color: P5Colors.text,
    fontWeight: '900',
    fontSize: 14,
  },
  confidantContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidantAvatar: {
    width: 60,
    height: 60,
    backgroundColor: P5Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: P5Spacing.md,
  },
  confidantEmoji: {
    fontSize: 32,
  },
  confidantInfo: {
    flex: 1,
  },
  confidantName: {
    fontSize: P5FontSizes.body,
    fontWeight: '700',
    color: P5Colors.text,
  },
  confidantLevel: {
    fontSize: P5FontSizes.caption,
    fontWeight: '700',
    color: P5Colors.primary,
    letterSpacing: 1,
    marginTop: 2,
  },
  confidantProgressBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: P5Spacing.sm,
  },
  confidantProgressFill: {
    width: '70%',
    height: '100%',
    backgroundColor: P5Colors.primary,
  },
  confidantNext: {
    fontSize: P5FontSizes.caption,
    fontWeight: '500',
    color: P5Colors.textMuted,
    marginTop: 4,
  },
});

export default P5DashboardScreen;
