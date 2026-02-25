import { renderHook, waitFor, act } from '@testing-library/react-native';

jest.mock('../src/services/NotificationService', () => ({
  NotificationService: {
    requestPermissions: jest.fn(),
    scheduleTimerCompletion: jest.fn(),
    cancelTimerNotification: jest.fn(),
  },
}));

import { useNotifications } from '../src/hooks/useNotifications';
import { NotificationService } from '../src/services/NotificationService';

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NotificationService.requestPermissions as jest.Mock).mockResolvedValue(
      true,
    );
    (
      NotificationService.scheduleTimerCompletion as jest.Mock
    ).mockResolvedValue('mock-id');
    (
      NotificationService.cancelTimerNotification as jest.Mock
    ).mockResolvedValue(undefined);
  });

  it('checks permission on mount', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(NotificationService.requestPermissions).toHaveBeenCalled();
    expect(result.current.hasPermission).toBe(true);
  });

  it('returns false when requesting permission fails', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (NotificationService.requestPermissions as jest.Mock).mockRejectedValue(
      new Error('boom'),
    );

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let granted = true;
    await act(async () => {
      granted = await result.current.requestPermission();
    });

    expect(granted).toBe(false);
    expect(result.current.hasPermission).toBe(false);
    errorSpy.mockRestore();
  });

  it('does not schedule notifications without permission', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (NotificationService.requestPermissions as jest.Mock).mockResolvedValue(
      false,
    );

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      const output = await result.current.scheduleNotification(
        'Done',
        'Body',
        123,
      );
      expect(output).toBeNull();
    });

    expect(NotificationService.scheduleTimerCompletion).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('schedules notification when permission is granted', async () => {
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.hasPermission).toBe(true);
    });

    await act(async () => {
      await result.current.scheduleNotification('Done', 'Body', 5000);
    });

    expect(NotificationService.scheduleTimerCompletion).toHaveBeenCalledWith(
      'Done',
      'Body',
      5000,
    );
  });

  it('cancels scheduled notification', async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.cancelNotification();
    });

    expect(NotificationService.cancelTimerNotification).toHaveBeenCalled();
  });
});
