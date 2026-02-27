import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import PomodoroScreen from '../src/screens/PomodoroScreen';

const mockStart = jest.fn();
const mockPause = jest.fn();
const mockReset = jest.fn();

const mockStoreState = {
  activeMode: 'pomodoro',
  isWorking: true,
  sessions: 2,
  incrementSession: jest.fn(),
  completePhase: jest.fn(),
};


jest.mock('../src/hooks/useTimer', () => ({
  __esModule: true,
  default: () => ({
    timeLeft: 1500,
    isRunning: false,
    formattedTime: '25:00',
    start: mockStart,
    pause: mockPause,
    reset: mockReset,
  }),
}));

jest.mock('../src/store/useTimerStore', () => {
  const mockUseTimerStore = jest.fn(() => mockStoreState) as jest.Mock & {
    getState: () => typeof mockStoreState;
  };
  mockUseTimerStore.getState = () => mockStoreState;
  return {
    __esModule: true,
    useTimerStore: mockUseTimerStore,
  };
});

jest.mock('../src/services/SoundService', () => ({
  __esModule: true,
  default: {
    playCompletionSound: jest.fn(),
    playNotificationSound: jest.fn(),
  },
}));

jest.mock('../src/ui/cosmic', () => {
  const React = require('react');
  const { Text, View, Pressable } = require('react-native');
  return {
    CosmicBackground: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    HaloRing: () => <View />,
    ChronoDigits: ({ value }: { value: string }) => <Text>{value}</Text>,
    RuneButton: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
      <Pressable onPress={onPress}><Text>{children}</Text></Pressable>
    ),
  };
});

describe('PomodoroScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pomodoro timer and starts when button pressed', () => {
    render(<PomodoroScreen />);

    expect(screen.getByText('POMODORO')).toBeTruthy();
    expect(screen.getByText('25:00')).toBeTruthy();

    fireEvent.press(screen.getByText('Start Timer'));
    expect(mockStart).toHaveBeenCalled();
  });
});
