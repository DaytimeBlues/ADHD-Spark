import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Tokens } from '../theme/tokens';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { WebNavBar } from './WebNavBar';
import { ROUTES } from './routes';
import { CaptureBubble } from '../components/capture';
import ErrorBoundary from '../components/ErrorBoundary';

// Phase 6: P5 UI Migration - Primary tabs use P5 screens
// Critical P5 screens - loaded normally for primary tabs
import { P5DashboardScreen } from '../screens/p5';
import { P5FocusTimerScreen } from '../screens/p5';
import { P5TasksScreen } from '../screens/p5';
import { P5JournalScreen } from '../screens/p5';

// Legacy screens (kept for reference/fallback)
import HomeScreen from '../screens/HomeScreen';
import IgniteScreen from '../screens/IgniteScreen';

// Lazy loaded non-critical screens
const FogCutterScreen = lazy(() => import('../screens/FogCutterScreen'));
const PomodoroScreen = lazy(() => import('../screens/PomodoroScreen'));
const BrainDumpScreen = lazy(() => import('../screens/BrainDumpScreen'));
const CalendarScreen = lazy(() => import('../screens/CalendarScreen'));
const AnchorScreen = lazy(() => import('../screens/AnchorScreen'));
const CheckInScreen = lazy(() => import('../screens/CheckInScreen'));
const CBTGuideScreen = lazy(() => import('../screens/CBTGuideScreen'));
const DiagnosticsScreen = lazy(() => import('../screens/DiagnosticsScreen'));
const ChatScreen = lazy(() => import('../screens/ChatScreen'));
const InboxScreen = lazy(() => import('../screens/InboxScreen'));

type TabBarIconProps = {
  color: string;
  size: number;
  focused: boolean;
};

const renderWebTabBar = (props: BottomTabBarProps) => <WebNavBar {...props} />;

const HomeTabIcon = ({ color }: TabBarIconProps) => (
  <Icon name="home" size={24} color={color} />
);

const FocusTabIcon = ({ color }: TabBarIconProps) => (
  <Icon name="fire" size={24} color={color} />
);

const TasksTabIcon = ({ color }: TabBarIconProps) => (
  <Icon name="text-box-outline" size={24} color={color} />
);

const CalendarTabIcon = ({ color }: TabBarIconProps) => (
  <Icon name="calendar" size={24} color={color} />
);

const ChatTabIcon = ({ color }: TabBarIconProps) => (
  <Icon name="message-text-outline" size={24} color={color} />
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
const LazyBrainDump = withSuspense(BrainDumpScreen);
const LazyCalendar = withSuspense(CalendarScreen);
const LazyAnchor = withSuspense(AnchorScreen);
const LazyCheckIn = withSuspense(CheckInScreen);
const LazyCBTGuide = withSuspense(CBTGuideScreen);
const LazyDiagnostics = withSuspense(DiagnosticsScreen);
const LazyChat = withSuspense(ChatScreen);
const LazyInbox = withSuspense(InboxScreen);

// Phase 6: Wrapped P5 screens for primary tabs (with ErrorBoundary)
const SafeP5DashboardScreen = withErrorBoundary(P5DashboardScreen);
const SafeP5FocusTimerScreen = withErrorBoundary(P5FocusTimerScreen);
const SafeP5TasksScreen = withErrorBoundary(P5TasksScreen);
const SafeP5JournalScreen = withErrorBoundary(P5JournalScreen);

// Legacy wrapped screens (kept for HomeStack and modals)
const SafeHomeScreen = withErrorBoundary(HomeScreen);
const SafeIgniteScreen = withErrorBoundary(IgniteScreen);
const SafeLazyFogCutter = withErrorBoundary(LazyFogCutter);
const SafeLazyPomodoro = withErrorBoundary(LazyPomodoro);
const SafeLazyBrainDump = withErrorBoundary(LazyBrainDump);
const SafeLazyCalendar = withErrorBoundary(LazyCalendar);
const SafeLazyAnchor = withErrorBoundary(LazyAnchor);
const SafeLazyCheckIn = withErrorBoundary(LazyCheckIn);
const SafeLazyCBTGuide = withErrorBoundary(LazyCBTGuide);
const SafeLazyDiagnostics = withErrorBoundary(LazyDiagnostics);
const SafeLazyChat = withErrorBoundary(LazyChat);
const SafeLazyInbox = withErrorBoundary(LazyInbox);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const crossFadeOptions = {
  headerShown: false,
  cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
  transitionSpec: {
    open: { animation: 'timing', config: { duration: 200 } } as any,
    close: { animation: 'timing', config: { duration: 200 } } as any,
  },
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={crossFadeOptions}>
    <Stack.Screen name={ROUTES.HOME_MAIN} component={SafeHomeScreen} />
    <Stack.Screen name={ROUTES.CHECK_IN} component={SafeLazyCheckIn} />
    <Stack.Screen name={ROUTES.CBT_GUIDE} component={SafeLazyCBTGuide} />
    <Stack.Screen name={ROUTES.DIAGNOSTICS} component={SafeLazyDiagnostics} />
  </Stack.Navigator>
);

const TabNavigator = () => {
  const { isCosmic } = useTheme();
  const webSceneContainerStyle = isCosmic
    ? styles.webSceneContainerCosmic
    : styles.webSceneContainerLinear;

  return (
    <Tab.Navigator
      tabBar={Platform.OS === 'web' ? renderWebTabBar : undefined}
      sceneContainerStyle={
        Platform.OS === 'web' ? webSceneContainerStyle : undefined
      }
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
      {/* Phase 6: Primary tabs migrated to P5 UI equivalents */}
      <Tab.Screen
        name={ROUTES.HOME}
        component={SafeP5DashboardScreen}
        options={{ tabBarIcon: HomeTabIcon }}
      />
      <Tab.Screen
        name={ROUTES.FOCUS}
        component={SafeP5FocusTimerScreen}
        options={{ tabBarIcon: FocusTabIcon }}
      />
      <Tab.Screen
        name={ROUTES.TASKS}
        component={SafeP5TasksScreen}
        options={{ tabBarIcon: TasksTabIcon }}
      />
      <Tab.Screen
        name={ROUTES.CALENDAR}
        component={SafeLazyCalendar}
        options={{ tabBarIcon: CalendarTabIcon }}
      />
      <Tab.Screen
        name={ROUTES.CHAT}
        component={SafeP5JournalScreen}
        options={{ tabBarIcon: ChatTabIcon }}
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

const AppNavigator = () => (
  <ThemeProvider>
    <AppNavigatorContent />
  </ThemeProvider>
);

export default AppNavigator;
