import { render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: {} }),
}));

jest.mock('../src/hooks/useReducedMotion', () => ({
  __esModule: true,
  default: () => false,
}));

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    STORAGE_KEYS: {
      brainDump: 'brainDump',
      tasks: 'tasks',
      igniteState: 'igniteState',
    },
    getJSON: jest.fn(() => new Promise(() => {})),
    setJSON: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockResolvedValue(null),
  },
  zustandStorage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../src/store/useTutorialStore', () => ({
  __esModule: true,
  brainDumpOnboardingFlow: { id: 'brain-dump-onboarding', steps: [] },
  useTutorialStore: (
    selector: (state: {
      activeFlow: null;
      currentStepIndex: number;
      isVisible: boolean;
      onboardingCompleted: boolean;
      startTutorial: jest.Mock;
      nextStep: jest.Mock;
      previousStep: jest.Mock;
      skipTutorial: jest.Mock;
    }) => unknown,
  ) =>
    selector({
      activeFlow: null,
      currentStepIndex: 0,
      isVisible: false,
      onboardingCompleted: true,
      startTutorial: jest.fn(),
      nextStep: jest.fn(),
      previousStep: jest.fn(),
      skipTutorial: jest.fn(),
    }),
}));

jest.mock('../src/components/tutorial/TutorialBubble', () => ({
  __esModule: true,
  TutorialBubble: () => null,
}));

jest.mock('../src/services/RecordingService', () => ({
  __esModule: true,
  default: {
    startRecording: jest.fn().mockResolvedValue(false),
    stopRecording: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('../src/services/PlaudService', () => ({
  __esModule: true,
  default: {
    transcribe: jest.fn().mockResolvedValue({ success: false }),
  },
}));

jest.mock('../src/services/AISortService', () => ({
  __esModule: true,
  default: {
    sortItems: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../src/services/OverlayService', () => ({
  __esModule: true,
  default: {
    updateCount: jest.fn(),
    canDrawOverlays: jest.fn().mockResolvedValue(false),
    requestOverlayPermission: jest.fn().mockResolvedValue(false),
    startOverlay: jest.fn(),
    stopOverlay: jest.fn(),
    addEventListener: jest.fn().mockReturnValue(() => {}),
  },
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

jest.mock('../src/hooks/useTimer', () => ({
  __esModule: true,
  default: () => ({
    timeLeft: 300,
    isRunning: false,
    formattedTime: '05:00',
    start: jest.fn(),
    pause: jest.fn(),
    reset: jest.fn(),
    setTime: jest.fn(),
  }),
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('../src/services/UXMetricsService', () => ({
  __esModule: true,
  default: { track: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('../src/services/LoggerService', () => ({
  __esModule: true,
  LoggerService: { error: jest.fn() },
}));

import BrainDumpScreen from '../src/screens/BrainDumpScreen';
import FogCutterScreen from '../src/screens/FogCutterScreen';
import IgniteScreen from '../src/screens/IgniteScreen';

describe('Phase B loading states', () => {
  it('shows loading state for BrainDump initial hydration', () => {
    render(<BrainDumpScreen />);
    expect(screen.getByText('LOADING...')).toBeTruthy();
  });

  it('shows loading state for FogCutter initial hydration', () => {
    render(<FogCutterScreen />);
    expect(screen.getByText('LOADING...')).toBeTruthy();
  });

  it('shows restoring state for Ignite session restore', () => {
    render(<IgniteScreen />);
    expect(screen.getByText('RESTORING...')).toBeTruthy();
  });
});
