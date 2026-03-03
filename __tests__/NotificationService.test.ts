import * as Notifications from 'expo-notifications';
import { NotificationService } from '../src/services/NotificationService';

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns true when permissions are already granted', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    const result = await NotificationService.requestPermissions();

    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests permissions when not granted yet', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    const result = await NotificationService.requestPermissions();

    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  it('schedules timer completion notification with minimum 1 second trigger', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1000);

    await NotificationService.scheduleTimerCompletion(
      'Done',
      'Timer ended',
      1200,
    );

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: 'Done',
          body: 'Timer ended',
        }),
        trigger: expect.objectContaining({
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
        }),
      }),
    );

    (Date.now as jest.Mock).mockRestore();
  });

  it('does not schedule when permission is denied', async () => {
    jest
      .spyOn(NotificationService, 'requestPermissions')
      .mockResolvedValueOnce(false);

    await NotificationService.scheduleTimerCompletion(
      'Done',
      'Timer ended',
      Date.now() + 5000,
    );

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancels a previously scheduled timer notification', async () => {
    await NotificationService.scheduleTimerCompletion(
      'Done',
      'Timer ended',
      Date.now() + 5000,
    );
    await NotificationService.cancelTimerNotification();

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'test-notification-id',
    );
  });
});
