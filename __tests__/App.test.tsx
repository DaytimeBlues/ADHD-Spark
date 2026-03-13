import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import App from '../App';

const mockBootstrapApp = jest.fn();
const mockRegister = jest.fn();
const mockInitialize = jest.fn();
const mockShutdown = jest.fn();
const mockGoogleStart = jest.fn();
const mockGoogleStop = jest.fn();
const mockTimerStart = jest.fn();
const mockTimerStop = jest.fn();
const mockBiometricSubscribe = jest.fn();
const mockFlushOverlayIntentQueue = jest.fn();
const mockHandleOverlayIntent = jest.fn();
const mockHideDrift = jest.fn();
const mockAddListener = jest.fn();
const mockLoggerWarn = jest.fn();

jest.mock('../src/init/bootstrap', () => ({
  bootstrapApp: () => mockBootstrapApp(),
}));

jest.mock('../src/utils/PlatformUtils', () => ({
  isWeb: true,
}));

jest.mock('../src/services/AppLifecycleService', () => ({
  AppLifecycleService: {
    register: (...args: unknown[]) => mockRegister(...args),
    initialize: () => mockInitialize(),
    shutdown: () => mockShutdown(),
  },
}));

jest.mock('../src/services/GoogleTasksSyncService', () => ({
  GoogleTasksSyncService: {
    startForegroundPolling: () => mockGoogleStart(),
    stopForegroundPolling: () => mockGoogleStop(),
    syncToBrainDump: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../src/services/OverlayService', () => ({
  __esModule: true,
  default: {
    collapseOverlay: jest.fn(),
  },
}));

jest.mock('../src/services/TimerService', () => ({
  TimerService: {
    start: () => mockTimerStart(),
    stop: () => mockTimerStop(),
  },
}));

jest.mock('../src/config', () => ({
  config: {
    googleWebClientId: undefined,
    googleIosClientId: undefined,
  },
}));

jest.mock('../src/services/BiometricService', () => ({
  BiometricService: {
    subscribe: (...args: unknown[]) => mockBiometricSubscribe(...args),
    authenticate: jest.fn(),
  },
}));

jest.mock('../src/store/useDriftStore', () => ({
  useDriftStore: (
    selector: (state: {
      isVisible: boolean;
      hideOverlay: () => void;
    }) => unknown,
  ) =>
    selector({
      isVisible: false,
      hideOverlay: mockHideDrift,
    }),
}));

jest.mock('../src/navigation/navigationRef', () => ({
  navigationRef: {
    isReady: () => true,
    getRootState: jest.fn(() => ({})),
    navigate: jest.fn(),
  },
  handleOverlayIntent: (...args: unknown[]) => mockHandleOverlayIntent(...args),
  flushOverlayIntentQueue: () => mockFlushOverlayIntentQueue(),
}));

jest.mock('../src/navigation/linking', () => ({
  appLinking: {
    config: {},
    getPathFromState: () => '/home',
  },
}));

jest.mock('../src/config/paths', () => ({
  WEB_APP_BASE_PATH: '',
}));

jest.mock('@react-navigation/native', () => {
  const ReactLocal = require('react');
  return {
    NavigationContainer: ReactLocal.forwardRef(
      (
        {
          children,
          onReady,
        }: {
          children: React.ReactNode;
          onReady?: () => void;
        },
        _ref: React.Ref<unknown>,
      ) => {
        ReactLocal.useEffect(() => {
          onReady?.();
        }, [onReady]);
        return children;
      },
    ),
  };
});

jest.mock('../src/navigation/AppNavigator', () => () => {
  const { Text } = require('react-native');
  return <Text>APP_NAVIGATOR</Text>;
});

jest.mock('../src/components/ErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/components/DriftCheckOverlay', () => ({
  DriftCheckOverlay: () => null,
}));

jest.mock('../src/components/LockScreen', () => ({
  LockScreen: () => {
    const { Text } = require('react-native');
    return <Text>LOCK_SCREEN</Text>;
  },
}));

jest.mock('../src/services/AgentEventBus', () => ({
  agentEventBus: {
    on: jest.fn(() => jest.fn()),
  },
}));

jest.mock('../src/services/LoggerService', () => ({
  LoggerService: {
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
    error: jest.fn(),
    fatal: jest.fn(),
    info: jest.fn(),
  },
  withOperationContext: (value: unknown) => value,
}));

jest.mock('react-native', () => {
  return {
    View: 'View',
    Text: 'Text',
    ActivityIndicator: 'ActivityIndicator',
    StatusBar: 'StatusBar',
    DeviceEventEmitter: {
      addListener: (...args: unknown[]) => mockAddListener(...args),
    },
    Platform: {
      OS: 'web',
      select: (value: { web?: unknown; default?: unknown }) =>
        value.web ?? value.default,
    },
    StyleSheet: {
      create: <T,>(styles: T) => styles,
      absoluteFillObject: {},
    },
  };
});

describe('App bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBootstrapApp.mockResolvedValue(undefined);
    mockBiometricSubscribe.mockImplementation(
      (callback: (value: boolean) => void) => {
        callback(true);
        return jest.fn();
      },
    );
    mockAddListener.mockReturnValue({ remove: jest.fn() });
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: { pathname: '/home' },
        history: { replaceState: jest.fn() },
      },
      configurable: true,
    });
  });

  it('boots the app and registers lifecycle services after bootstrap', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('APP_NAVIGATOR')).toBeTruthy();
    });

    expect(mockBootstrapApp).toHaveBeenCalled();
    expect(mockRegister).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'timer-service' }),
    );
    expect(mockRegister).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'google-sync-polling' }),
    );
    expect(mockInitialize).toHaveBeenCalled();
    expect(mockFlushOverlayIntentQueue).toHaveBeenCalled();
  });

  it('does not emit a bootstrap timeout warning when bootstrap resolves immediately', async () => {
    jest.useFakeTimers();

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('APP_NAVIGATOR')).toBeTruthy();
    });

    jest.advanceTimersByTime(9000);

    expect(mockLoggerWarn).not.toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'bootstrap',
        operation: 'bootstrapApp',
      }),
    );

    jest.useRealTimers();
  });
});
