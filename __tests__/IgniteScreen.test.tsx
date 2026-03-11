import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import IgniteScreen from '../src/screens/IgniteScreen';

const mockStart = jest.fn();
const mockPause = jest.fn();
const mockReset = jest.fn();

jest.mock('../src/hooks/useTimer', () => ({
  __esModule: true,
  default: () => ({
    timeLeft: 300,
    isRunning: false,
    formattedTime: '05:00',
    start: mockStart,
    pause: mockPause,
    reset: mockReset,
    setTime: jest.fn(),
  }),
}));

jest.mock('../src/services/SoundService', () => ({
  __esModule: true,
  default: {
    initBrownNoise: jest.fn(),
    playBrownNoise: jest.fn(),
    pauseBrownNoise: jest.fn(),
    stopBrownNoise: jest.fn(),
    releaseBrownNoise: jest.fn(),
    playCompletionSound: jest.fn(),
  },
}));

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    getJSON: jest.fn().mockResolvedValue(null),
    setJSON: jest.fn().mockResolvedValue(true),
    STORAGE_KEYS: {
      igniteState: 'igniteState',
      lastActiveSession: 'lastActiveSession',
    },
  },
}));

jest.mock('../src/services/UXMetricsService', () => ({
  __esModule: true,
  default: { track: jest.fn() },
}));

jest.mock('../src/services/ActivationService', () => ({
  __esModule: true,
  default: {
    consumePendingStart: jest.fn().mockResolvedValue(null),
    startSession: jest.fn().mockResolvedValue('session-1'),
    updateSessionStatus: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../src/services/LoggerService', () => ({
  __esModule: true,
  default: { error: jest.fn(), debug: jest.fn() },
  LoggerService: { error: jest.fn(), debug: jest.fn() },
}));

jest.mock('../src/store/useTimerStore', () => ({
  __esModule: true,
  useTimerStore: {
    getState: () => ({ isRunning: false }),
  },
}));

jest.mock('../src/ui/cosmic', () => {
  const { Text, View, Pressable } = require('react-native');
  return {
    CosmicBackground: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
    GlowCard: ({ children }: { children: React.ReactNode }) => (
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

describe('IgniteScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and starts timer', () => {
    render(<IgniteScreen />);

    expect(screen.getByText('IGNITE_PROTOCOL')).toBeTruthy();
    return waitFor(() => {
      fireEvent.press(screen.getByText('INITIATE_FOCUS'));
      expect(mockStart).toHaveBeenCalled();
    });
  });

  it('keeps the audio toggle off when brown noise playback is unavailable', async () => {
    render(<IgniteScreen />);

    await waitFor(() => {
      expect(screen.getByText('NOISE: OFF')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('NOISE: OFF'));

    expect(screen.getByText('NOISE: OFF')).toBeTruthy();
    expect(screen.queryByText('NOISE: ON')).toBeNull();
  });
});
