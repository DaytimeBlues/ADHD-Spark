import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Platform, Share } from 'react-native';
import HomeScreen from '../src/screens/HomeScreen';

const mockGetReentryPromptLevel = jest.fn().mockResolvedValue('none');

jest.mock('../src/hooks/useReducedMotion', () => ({
  __esModule: true,
  default: () => false,
}));

const overlayListeners: Record<string, (() => void)[]> = {};

const emitOverlayEvent = (eventName: string) => {
  (overlayListeners[eventName] || []).forEach((listener) => listener());
};

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue(null),
    getJSON: jest.fn().mockResolvedValue([]),
    set: jest.fn().mockResolvedValue(true),
    setJSON: jest.fn().mockResolvedValue(true),
    remove: jest.fn().mockResolvedValue(true),
    STORAGE_KEYS: {
      streakCount: 'streakCount',
      lastUseDate: 'lastUseDate',
      activationSessions: 'activationSessions',
      activationPendingStart: 'activationPendingStart',
    },
  },
}));

jest.mock('../src/services/ActivationService', () => ({
  __esModule: true,
  default: {
    getSummary: jest.fn().mockResolvedValue({
      started: 10,
      completed: 8,
      abandoned: 0,
      resumed: 0,
      completionRate: 0.8,
    }),
    getDailyTrend: jest.fn().mockResolvedValue([
      { day: '2023-01-01', started: 2, completed: 2 },
      { day: '2023-01-02', started: 3, completed: 3 },
      { day: '2023-01-03', started: 8, completed: 6 },
    ]),
  },
}));

jest.mock('../src/services/RetentionService', () => ({
  __esModule: true,
  default: {
    getReentryPromptLevel: () => mockGetReentryPromptLevel(),
    markAppUse: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock vector icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('../src/services/OverlayService', () => ({
  __esModule: true,
  default: {
    canDrawOverlays: jest.fn().mockResolvedValue(false),
    requestOverlayPermission: jest.fn().mockResolvedValue(false),
    startOverlay: jest.fn(),
    stopOverlay: jest.fn(),
    updateCount: jest.fn(),
    addEventListener: jest.fn(
      (eventName: string, listener: () => void | { granted?: boolean }) => {
        if (!overlayListeners[eventName]) {
          overlayListeners[eventName] = [];
        }
        overlayListeners[eventName].push(listener as () => void);
        return () => {
          overlayListeners[eventName] = (
            overlayListeners[eventName] || []
          ).filter((candidate) => candidate !== listener);
        };
      },
    ),
  },
}));

const mockNavigation = {
  navigate: jest.fn(),
};

describe('HomeScreen', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetReentryPromptLevel.mockResolvedValue('none');
    jest.spyOn(Share, 'share').mockResolvedValue({
      action: 'sharedAction',
      activityType: null,
    });
    Object.keys(overlayListeners).forEach((key) => {
      delete overlayListeners[key];
    });
  });

  const renderHomeScreen = async () => {
    const result = render(<HomeScreen navigation={mockNavigation} />);
    await act(async () => {
      jest.runOnlyPendingTimers();
      await Promise.resolve();
    });
    return result;
  };

  it('renders correctly', async () => {
    await renderHomeScreen();
    expect(screen.getByText('SPARK_PRO')).toBeTruthy();
  });

  it('displays mode cards', async () => {
    await renderHomeScreen();
    expect(screen.getByText('RESUME')).toBeTruthy();
    expect(screen.getByText('IGNITE')).toBeTruthy();
    expect(screen.getByText('FOG CUTTER')).toBeTruthy();
    expect(screen.getByText('POMODORO')).toBeTruthy();
    expect(screen.getByText('CBT GUIDE')).toBeTruthy();
  });

  it('shows streak container', async () => {
    await renderHomeScreen();
    expect(screen.getByTestId('home-streak')).toHaveTextContent('STREAK.000');
  });

  it('renders activation trend metrics correctly', async () => {
    await renderHomeScreen();

    expect(screen.getByText('WEEKLY_METRICS')).toBeTruthy();
    expect(screen.getByText('TODAY')).toBeTruthy();
    expect(screen.getAllByText('8').length).toBeGreaterThan(0);
    expect(screen.getByText('DELTA')).toBeTruthy();
    expect(screen.getByText('+5')).toBeTruthy();
    expect(screen.getByText('STARTED')).toBeTruthy();
    expect(screen.getByText('COMPLETED')).toBeTruthy();
  });

  it('navigates to FogCutter when its card is pressed', async () => {
    await renderHomeScreen();
    fireEvent.press(screen.getByTestId('mode-fogcutter'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FogCutter');
  });

  it('navigates to Focus (Ignite) when Resume card is pressed', async () => {
    await renderHomeScreen();
    fireEvent.press(screen.getByTestId('mode-resume'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Focus');
  });

  it('shows re-entry prompt and routes to Focus', async () => {
    mockGetReentryPromptLevel.mockResolvedValue('gentle_restart');

    await renderHomeScreen();

    expect(screen.getByTestId('reentry-prompt')).toBeTruthy();
    fireEvent.press(screen.getByText('START SMALL'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Focus');
  });

  it('renders overlay debug log entries when permission event is received', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'android',
    });

    await renderHomeScreen();

    await act(async () => {
      emitOverlayEvent('overlay_permission_requested');
    });

    expect(screen.getByText('LOGS')).toBeTruthy();
    expect(screen.getByText(/Permission requested/i)).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByText('COPY_DIAG'));
    });
    expect(Share.share).toHaveBeenCalled();
  });
});
