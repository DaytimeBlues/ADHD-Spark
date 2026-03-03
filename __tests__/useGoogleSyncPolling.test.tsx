import { renderHook } from '@testing-library/react-native';
import { AppState, Platform } from 'react-native';
import { useGoogleSyncPolling } from '../src/hooks/useGoogleSyncPolling';
import { GoogleTasksSyncService } from '../src/services/GoogleTasksSyncService';

jest.mock('../src/services/GoogleTasksSyncService', () => ({
  GoogleTasksSyncService: {
    startForegroundPolling: jest.fn(),
    stopForegroundPolling: jest.fn(),
  },
}));

describe('useGoogleSyncPolling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts polling when app is active and stops on inactive + cleanup', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'android',
    });

    Object.defineProperty(AppState, 'currentState', {
      configurable: true,
      get: () => 'active',
    });

    const remove = jest.fn();
    const addEventListenerSpy = jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation(
        (
          _: 'change',
          listener: (state: 'active' | 'background' | 'inactive') => void,
        ) => {
          listener('background');
          return { remove } as unknown as ReturnType<
            typeof AppState.addEventListener
          >;
        },
      );

    const { unmount } = renderHook(() => useGoogleSyncPolling());

    expect(GoogleTasksSyncService.startForegroundPolling).toHaveBeenCalledTimes(
      1,
    );
    expect(GoogleTasksSyncService.stopForegroundPolling).toHaveBeenCalledTimes(
      1,
    );

    unmount();

    expect(remove).toHaveBeenCalledTimes(1);
    expect(GoogleTasksSyncService.stopForegroundPolling).toHaveBeenCalledTimes(
      1,
    );

    addEventListenerSpy.mockRestore();
  });

  it('is a no-op on web', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'web',
    });

    const remove = jest.fn();
    const addEventListenerSpy = jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation(
        (
          _: 'change',
          _listener: (state: 'active' | 'background' | 'inactive') => void,
        ) => {
          return { remove } as unknown as ReturnType<
            typeof AppState.addEventListener
          >;
        },
      );

    const { unmount } = renderHook(() => useGoogleSyncPolling());

    expect(
      GoogleTasksSyncService.startForegroundPolling,
    ).not.toHaveBeenCalled();
    expect(GoogleTasksSyncService.stopForegroundPolling).not.toHaveBeenCalled();

    unmount();
    expect(remove).toHaveBeenCalledTimes(1);
    expect(GoogleTasksSyncService.stopForegroundPolling).not.toHaveBeenCalled();

    addEventListenerSpy.mockRestore();
  });
});
