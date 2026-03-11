import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import AppNavigator from '../src/navigation/AppNavigator';

let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

const getActWarnings = () =>
  consoleErrorSpy.mock.calls.filter(
    ([message]: Parameters<typeof console.error>) =>
      typeof message === 'string' && message.includes('not wrapped in act'),
  );

jest.mock('react-native-gesture-handler', () => {
  const { View: MockView } = require('react-native');
  return {
    GestureHandlerRootView: MockView,
    PanGestureHandler: MockView,
    TapGestureHandler: MockView,
    State: {},
    Directions: {},
  };
});

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('../src/utils/PlatformUtils', () => ({
  __esModule: true,
  isWeb: true,
  isAndroid: false,
  isIOS: false,
}));

jest.mock('../src/components/capture', () => ({
  __esModule: true,
  CaptureBubble: () => null,
}));

jest.mock('../src/screens/HomeScreen', () => {
  const { Pressable, Text: MockText, View: MockView } = require('react-native');
  const { ROUTES } = require('../src/navigation/routes');

  return {
    __esModule: true,
    default: ({
      navigation,
    }: {
      navigation: { navigate: (route: string) => void };
    }) => (
      <MockView>
        <MockText testID="home-title">SPARK_PRO</MockText>
        <Pressable
          testID="mode-checkin"
          onPress={() => navigation.navigate(ROUTES.CHECK_IN)}
        >
          <MockText>Check In</MockText>
        </Pressable>
        <Pressable
          testID="mode-cbtguide"
          onPress={() => navigation.navigate(ROUTES.CBT_GUIDE)}
        >
          <MockText>CBT Guide</MockText>
        </Pressable>
        <Pressable
          accessibilityLabel="Settings and Diagnostics"
          onPress={() => navigation.navigate(ROUTES.DIAGNOSTICS)}
        >
          <MockText>Diagnostics</MockText>
        </Pressable>
      </MockView>
    ),
  };
});

const createScreen = (title: string) => () => (
  <View>
    <Text>{title}</Text>
  </View>
);

jest.mock('../src/screens/CheckInScreen', () => ({
  __esModule: true,
  default: createScreen('CHECK IN'),
}));
jest.mock('../src/screens/CBTGuideScreen', () => ({
  __esModule: true,
  default: createScreen('CBT FOR ADHD'),
}));
jest.mock('../src/screens/DiagnosticsScreen', () => ({
  __esModule: true,
  default: createScreen('DIAGNOSTICS'),
}));
jest.mock('../src/screens/IgniteScreen', () => ({
  __esModule: true,
  default: createScreen('FOCUS'),
}));
jest.mock('../src/screens/BrainDumpScreen', () => ({
  __esModule: true,
  default: createScreen('BRAIN_DUMP'),
}));
jest.mock('../src/screens/TasksScreen', () => ({
  __esModule: true,
  default: createScreen('TASKS_SCREEN'),
}));
jest.mock('../src/screens/ChatScreen', () => ({
  __esModule: true,
  default: createScreen('CHAT'),
}));
jest.mock('../src/screens/FogCutterScreen', () => ({
  __esModule: true,
  default: createScreen('FOG CUTTER'),
}));
jest.mock('../src/screens/PomodoroScreen', () => ({
  __esModule: true,
  default: createScreen('POMODORO'),
}));
jest.mock('../src/screens/CalendarScreen', () => ({
  __esModule: true,
  default: createScreen('CALENDAR'),
}));
jest.mock('../src/screens/AnchorScreen', () => ({
  __esModule: true,
  default: createScreen('ANCHOR'),
}));
jest.mock('../src/screens/InboxScreen', () => ({
  __esModule: true,
  default: createScreen('INBOX'),
}));

describe('AppNavigator route registration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    const actWarnings = getActWarnings();
    consoleErrorSpy.mockRestore();
    jest.clearAllTimers();
    jest.useRealTimers();
    expect(actWarnings).toHaveLength(0);
  });

  const renderNavigator = async () => {
    render(
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>,
    );

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByTestId('home-title')).toBeTruthy();
  };

  it('opens Check In from the Home card', async () => {
    await renderNavigator();

    fireEvent.press(screen.getByTestId('mode-checkin'));
    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(screen.getByText('CHECK IN')).toBeTruthy();
  });

  it('opens CBT Guide from the Home card', async () => {
    await renderNavigator();

    fireEvent.press(screen.getByTestId('mode-cbtguide'));
    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(screen.getByText('CBT FOR ADHD')).toBeTruthy();
  });

  it('opens Diagnostics from the Home settings action', async () => {
    await renderNavigator();

    fireEvent.press(screen.getByLabelText('Settings and Diagnostics'));
    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(screen.getByText('DIAGNOSTICS')).toBeTruthy();
  });

  it('opens the canonical task screen from the Tasks tab', async () => {
    await renderNavigator();

    fireEvent.press(screen.getByTestId('nav-tasks'));

    expect(screen.getByText('TASKS_SCREEN')).toBeTruthy();
    expect(screen.queryByText('BRAIN_DUMP')).toBeNull();
  });
});
