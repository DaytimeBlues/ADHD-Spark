import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { WebNavBar } from './WebNavBar';
import { ROUTES } from './routes';
import { CaptureBubble } from '../components/capture';
import ErrorBoundary from '../components/ErrorBoundary';
import AppIcon from '../components/AppIcon';

import { isWeb } from '../utils/PlatformUtils';

const screenModuleLoaders = {
  '../screens/HomeScreen': () => require('../screens/HomeScreen'),
  '../screens/IgniteScreen': () => require('../screens/IgniteScreen'),
  '../screens/TasksScreen': () => require('../screens/TasksScreen'),
  '../screens/BrainDumpScreen': () => require('../screens/BrainDumpScreen'),
  '../screens/ChatScreen': () => require('../screens/ChatScreen'),
  '../screens/FogCutterScreen': () => require('../screens/FogCutterScreen'),
  '../screens/PomodoroScreen': () => require('../screens/PomodoroScreen'),
  '../screens/CalendarScreen': () => require('../screens/CalendarScreen'),
  '../screens/AnchorScreen': () => require('../screens/AnchorScreen'),
  '../screens/InboxScreen': () => require('../screens/InboxScreen'),
  '../screens/CheckInScreen': () => require('../screens/CheckInScreen'),
  '../screens/CBTGuideScreen': () => require('../screens/CBTGuideScreen'),
  '../screens/DiagnosticsScreen': () => require('../screens/DiagnosticsScreen'),
} as const;

type ScreenModulePath = keyof typeof screenModuleLoaders;

const loadScreen = <P extends object>(
  modulePath: ScreenModulePath,
  lazyFactory: () => Promise<{ default: React.ComponentType<P> }>,
): React.ComponentType<P> => {
  if (process.env.NODE_ENV === 'test') {
    // Jest does not support these lazy dynamic imports without extra VM flags.
    // Using require in tests keeps the production bundle lazy-loaded.
    return screenModuleLoaders[modulePath]().default as React.ComponentType<P>;
  }

  return lazy(lazyFactory) as unknown as React.ComponentType<P>;
};

// Lazy loaded screens keep the first web bundle smaller.
const HomeScreen = loadScreen(
  '../screens/HomeScreen',
  () => import('../screens/HomeScreen'),
);
const IgniteScreen = loadScreen(
  '../screens/IgniteScreen',
  () => import('../screens/IgniteScreen'),
);
const TasksScreen = loadScreen(
  '../screens/TasksScreen',
  () => import('../screens/TasksScreen'),
);
const BrainDumpScreen = loadScreen(
  '../screens/BrainDumpScreen',
  () => import('../screens/BrainDumpScreen'),
);
const ChatScreen = loadScreen(
  '../screens/ChatScreen',
  () => import('../screens/ChatScreen'),
);
const FogCutterScreen = loadScreen(
  '../screens/FogCutterScreen',
  () => import('../screens/FogCutterScreen'),
);
const PomodoroScreen = loadScreen(
  '../screens/PomodoroScreen',
  () => import('../screens/PomodoroScreen'),
);
const CalendarScreen = loadScreen(
  '../screens/CalendarScreen',
  () => import('../screens/CalendarScreen'),
);
const AnchorScreen = loadScreen(
  '../screens/AnchorScreen',
  () => import('../screens/AnchorScreen'),
);
const InboxScreen = loadScreen(
  '../screens/InboxScreen',
  () => import('../screens/InboxScreen'),
);
const CheckInScreen = loadScreen(
  '../screens/CheckInScreen',
  () => import('../screens/CheckInScreen'),
);
const CBTGuideScreen = loadScreen(
  '../screens/CBTGuideScreen',
  () => import('../screens/CBTGuideScreen'),
);
const DiagnosticsScreen = loadScreen(
  '../screens/DiagnosticsScreen',
  () => import('../screens/DiagnosticsScreen'),
);

type TabBarIconProps = {
  color: string;
  size: number;
  focused: boolean;
};

const renderWebTabBar = (props: BottomTabBarProps) => <WebNavBar {...props} />;

const HomeTabIcon = ({ color }: TabBarIconProps) => (
  <AppIcon name="home" size={24} color={color} />
);

const FocusTabIcon = ({ color }: TabBarIconProps) => (
  <AppIcon name="fire" size={24} color={color} />
);

const TasksTabIcon = ({ color }: TabBarIconProps) => (
  <AppIcon name="text-box-outline" size={24} color={color} />
);

const CalendarTabIcon = ({ color }: TabBarIconProps) => (
  <AppIcon name="calendar" size={24} color={color} />
);

const ChatTabIcon = ({ color }: TabBarIconProps) => (
  <AppIcon name="message-text-outline" size={24} color={color} />
);

const SuspenseFallback = () => (
  <View style={styles.suspenseFallback}>
    <ActivityIndicator size="large" color={Tokens.colors.indigo.primary} />
  </View>
);

const withSuspense = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <Suspense fallback={<SuspenseFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return (props: P) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
};

const LazyFogCutter = withSuspense(FogCutterScreen);
const LazyPomodoro = withSuspense(PomodoroScreen);
const LazyCalendar = withSuspense(CalendarScreen);
const LazyAnchor = withSuspense(AnchorScreen);
const LazyInbox = withSuspense(InboxScreen);
const LazyCheckIn = withSuspense(CheckInScreen);
const LazyCBTGuide = withSuspense(CBTGuideScreen);
const LazyDiagnostics = withSuspense(DiagnosticsScreen);

const LazyHome = withSuspense(HomeScreen);
const LazyIgnite = withSuspense(IgniteScreen);
const LazyTasks = withSuspense(TasksScreen);
const LazyBrainDump = withSuspense(BrainDumpScreen);
const LazyChat = withSuspense(ChatScreen);

// Phase 6: Wrapped Cosmic screens for primary tabs (with ErrorBoundary)
const SafeHomeScreen = withErrorBoundary(LazyHome);
const SafeIgniteScreen = withErrorBoundary(LazyIgnite);
const SafeTasksScreen = withErrorBoundary(LazyTasks);
const SafeBrainDumpScreen = withErrorBoundary(LazyBrainDump);
const SafeChatScreen = withErrorBoundary(LazyChat);
const SafeLazyFogCutter = withErrorBoundary(LazyFogCutter);
const SafeLazyPomodoro = withErrorBoundary(LazyPomodoro);
const SafeLazyCalendar = withErrorBoundary(LazyCalendar);
const SafeLazyAnchor = withErrorBoundary(LazyAnchor);
const SafeLazyInbox = withErrorBoundary(LazyInbox);
const SafeLazyCheckIn = withErrorBoundary(LazyCheckIn);
const SafeLazyCBTGuide = withErrorBoundary(LazyCBTGuide);
const SafeLazyDiagnostics = withErrorBoundary(LazyDiagnostics);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const crossFadeOptions = {
  headerShown: false,
  cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
  transitionSpec: {
    open: { animation: 'timing' as const, config: { duration: 200 } },
    close: { animation: 'timing' as const, config: { duration: 200 } },
  },
};

const TabNavigator = () => {
  const { isCosmic } = useTheme();
  const webSceneContainerStyle = isCosmic
    ? styles.webSceneContainerCosmic
    : styles.webSceneContainerLinear;

  return (
    <Tab.Navigator
      tabBar={isWeb ? renderWebTabBar : undefined}
      sceneContainerStyle={isWeb ? webSceneContainerStyle : undefined}
      screenOptions={{
        tabBarActiveTintColor: isCosmic
          ? '#8B5CF6'
          : Tokens.colors.indigo.primary,
        tabBarInactiveTintColor: isCosmic
          ? '#B9C2D9'
          : Tokens.colors.text.tertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isCosmic ? '#070712' : Tokens.colors.neutral.darker,
          borderTopWidth: 1,
          borderTopColor: isCosmic
            ? 'rgba(42, 53, 82, 0.3)'
            : Tokens.colors.neutral.borderSubtle,
          height: 60,
          paddingBottom: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: Tokens.type.fontFamily.sans,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      }}
    >
      {/* Phase 6: Primary tabs migrated to Cosmic UI equivalents */}
      <Tab.Screen
        name={ROUTES.HOME}
        component={SafeHomeScreen}
        options={{
          tabBarIcon: HomeTabIcon,
          tabBarButtonTestID: 'nav-home',
        }}
      />
      <Tab.Screen
        name={ROUTES.FOCUS}
        component={SafeIgniteScreen}
        options={{
          tabBarIcon: FocusTabIcon,
          tabBarButtonTestID: 'nav-focus',
        }}
      />
      <Tab.Screen
        name={ROUTES.TASKS}
        component={SafeTasksScreen}
        options={{
          tabBarIcon: TasksTabIcon,
          tabBarButtonTestID: 'nav-tasks',
        }}
      />
      <Tab.Screen
        name={ROUTES.CALENDAR}
        component={SafeLazyCalendar}
        options={{
          tabBarIcon: CalendarTabIcon,
          tabBarButtonTestID: 'nav-calendar',
        }}
      />
      <Tab.Screen
        name={ROUTES.CHAT}
        component={SafeChatScreen}
        options={{
          tabBarIcon: ChatTabIcon,
          tabBarButtonTestID: 'nav-chat',
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * TabNavigatorWithBubble
 *
 * Wraps the TabNavigator in a flex-1 View and renders the CaptureBubble
 * above all tab screens. The Bubble is NOT shown on fullscreen modals
 * (Pomodoro, Anchor, FogCutter) — those are sibling Stack.Screens above
 * this component, so the bubble is naturally hidden there.
 */
const TabNavigatorWithBubble = () => (
  <View style={styles.container}>
    <TabNavigator />
    <CaptureBubble />
  </View>
);

const styles = StyleSheet.create({
  suspenseFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  webSceneContainerCosmic: {
    paddingTop: 64,
    backgroundColor: '#070712',
    height: '100%',
  },
  webSceneContainerLinear: {
    paddingTop: 64,
    backgroundColor: Tokens.colors.neutral.darkest,
    height: '100%',
  },
  container: {
    flex: 1,
  },
});

const AppNavigatorContent = () => (
  <Stack.Navigator screenOptions={crossFadeOptions}>
    <Stack.Screen name={ROUTES.MAIN} component={TabNavigatorWithBubble} />
    <Stack.Screen name={ROUTES.CHECK_IN} component={SafeLazyCheckIn} />
    <Stack.Screen name={ROUTES.CBT_GUIDE} component={SafeLazyCBTGuide} />
    <Stack.Screen name={ROUTES.DIAGNOSTICS} component={SafeLazyDiagnostics} />
    <Stack.Screen name={ROUTES.BRAIN_DUMP} component={SafeBrainDumpScreen} />
    <Stack.Screen name={ROUTES.FOG_CUTTER} component={SafeLazyFogCutter} />
    <Stack.Screen name={ROUTES.POMODORO} component={SafeLazyPomodoro} />
    <Stack.Screen name={ROUTES.ANCHOR} component={SafeLazyAnchor} />
    <Stack.Screen
      name={ROUTES.INBOX}
      component={SafeLazyInbox}
      options={{ presentation: 'modal' }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => <AppNavigatorContent />;

export { ROUTES };
export default AppNavigator;
