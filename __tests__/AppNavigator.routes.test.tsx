import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Text, View } from 'react-native';
import AppNavigator from '../src/navigation/AppNavigator';

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
    State: {},
    Directions: {},
  };
});

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('../src/components/capture', () => ({
  __esModule: true,
  CaptureBubble: () => null,
}));

jest.mock('../src/screens/HomeScreen', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  const { ROUTES } = require('../src/navigation/routes');

  return {
    __esModule: true,
    default: ({
      navigation,
    }: {
      navigation: { navigate: (route: string) => void };
    }) => (
      <View>
        <Text testID="home-title">SPARK_PRO</Text>
        <Pressable
          testID="mode-checkin"
          onPress={() => navigation.navigate(ROUTES.CHECK_IN)}
        >
          <Text>Check In</Text>
        </Pressable>
        <Pressable
          testID="mode-cbtguide"
          onPress={() => navigation.navigate(ROUTES.CBT_GUIDE)}
        >
          <Text>CBT Guide</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Settings and Diagnostics"
          onPress={() => navigation.navigate(ROUTES.DIAGNOSTICS)}
        >
          <Text>Diagnostics</Text>
        </Pressable>
      </View>
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
  default: createScreen('TASKS'),
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
  const renderNavigator = async () => {
    render(
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('home-title')).toBeTruthy();
    });
  };

  it('opens Check In from the Home card', async () => {
    await renderNavigator();

    fireEvent.press(screen.getByTestId('mode-checkin'));

    await waitFor(() => {
      expect(screen.getByText('CHECK IN')).toBeTruthy();
    });
  });

  it('opens CBT Guide from the Home card', async () => {
    await renderNavigator();

    fireEvent.press(screen.getByTestId('mode-cbtguide'));

    await waitFor(() => {
      expect(screen.getByText('CBT FOR ADHD')).toBeTruthy();
    });
  });

  it('opens Diagnostics from the Home settings action', async () => {
    await renderNavigator();

    fireEvent.press(screen.getByLabelText('Settings and Diagnostics'));

    await waitFor(() => {
      expect(screen.getByText('DIAGNOSTICS')).toBeTruthy();
    });
  });
});
