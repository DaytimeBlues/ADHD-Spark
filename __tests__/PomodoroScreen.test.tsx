import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import PomodoroScreen from '../src/screens/PomodoroScreen';
import { NightAweTokens } from '../src/theme/tokens';

const mockStart = jest.fn();
const mockPause = jest.fn();
const mockReset = jest.fn();
const mockUseTheme = jest.fn(() => ({
  variant: 'cosmic',
  isCosmic: true,
  isNightAwe: false,
  isLinear: false,
  isLoaded: true,
  metadata: {
    label: 'Cosmic',
    description: 'Mystical deep space with ethereal glows',
    preview: {
      background: '#070712',
      accent: '#8B5CF6',
      text: '#EEF2FF',
    },
  },
  setVariant: jest.fn(),
  t: NightAweTokens,
}));

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

jest.mock('../src/theme/useTheme', () => ({
  __esModule: true,
  useTheme: () => mockUseTheme(),
}));

jest.mock('../src/ui/cosmic', () => {
  const { Text, View, Pressable } = require('react-native');
  return {
    CosmicBackground: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    HaloRing: () => <View />,
    ChronoDigits: ({ value }: { value: string }) => <Text>{value}</Text>,
    RuneButton: ({
      children,
      onPress,
    }: {
      children: React.ReactNode;
      onPress?: () => void;
    }) => (
      <Pressable onPress={onPress}>
        <Text>{children}</Text>
      </Pressable>
    ),
  };
});

jest.mock('../src/ui/nightAwe', () => {
  const { View } = require('react-native');
  return {
    NightAweBackground: ({ children }: { children: React.ReactNode }) => (
      <View testID="night-awe-background">{children}</View>
    ),
  };
});

describe('PomodoroScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue({
      variant: 'cosmic',
      isCosmic: true,
      isNightAwe: false,
      isLinear: false,
      isLoaded: true,
      metadata: {
        label: 'Cosmic',
        description: 'Mystical deep space with ethereal glows',
        preview: {
          background: '#070712',
          accent: '#8B5CF6',
          text: '#EEF2FF',
        },
      },
      setVariant: jest.fn(),
      t: NightAweTokens,
    });
  });

  it('renders pomodoro timer and starts when button pressed', () => {
    render(<PomodoroScreen />);

    expect(screen.getByText('POMODORO')).toBeTruthy();
    expect(screen.getByText('25:00')).toBeTruthy();

    fireEvent.press(screen.getByText('Start Timer'));
    expect(mockStart).toHaveBeenCalled();
  });

  it('renders night awe shell when that theme is active', () => {
    mockUseTheme.mockReturnValue({
      variant: 'nightAwe',
      isCosmic: false,
      isNightAwe: true,
      isLinear: false,
      isLoaded: true,
      metadata: {
        label: 'Night Awe',
        description: 'Grounded horizon tones with a calm, natural sky',
        preview: {
          background: '#08111E',
          accent: '#AFC7FF',
          text: '#F6F1E7',
        },
      },
      setVariant: jest.fn(),
      t: NightAweTokens,
    });

    render(<PomodoroScreen />);

    expect(screen.getByTestId('night-awe-background')).toBeTruthy();
    expect(screen.getByText('Start Timer')).toBeTruthy();
  });
});
