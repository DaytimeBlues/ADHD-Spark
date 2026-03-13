import { LoggerService } from './LoggerService';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null | undefined;
let notificationHandlerConfigured = false;

const getNotifications = (): NotificationsModule | null => {
  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  try {
    notificationsModule = require('expo-notifications') as NotificationsModule;
  } catch (error) {
    LoggerService.warn({
      service: 'NotificationService',
      operation: 'getNotifications',
      message:
        'expo-notifications is unavailable; notification features are disabled.',
      error,
    });
    notificationsModule = null;
  }

  return notificationsModule;
};

const ensureNotificationHandler = (
  Notifications: NotificationsModule | null,
): void => {
  if (!Notifications || notificationHandlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  notificationHandlerConfigured = true;
};

class NotificationServiceClass {
  private currentTimerNotificationId: string | null = null;

  async requestPermissions() {
    const Notifications = getNotifications();
    if (!Notifications) {
      return false;
    }
    ensureNotificationHandler(Notifications);

    const permissions = await Notifications.getPermissionsAsync();
    let finalStatus = permissions.status;

    if (finalStatus !== 'granted') {
      const result = await Notifications.requestPermissionsAsync();
      finalStatus = result.status;
    }

    return finalStatus === 'granted';
  }

  async scheduleTimerCompletion(
    title: string,
    body: string,
    triggerDateMs: number,
  ) {
    await this.cancelTimerNotification();

    const triggerInSeconds = Math.max(
      1,
      Math.floor((triggerDateMs - Date.now()) / 1000),
    );

    try {
      const Notifications = getNotifications();
      if (!Notifications) {
        return;
      }
      ensureNotificationHandler(Notifications);

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return;
      }

      this.currentTimerNotificationId =
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: triggerInSeconds,
          },
        });
    } catch (e) {
      LoggerService.warn({
        service: 'NotificationService',
        operation: 'scheduleTimerCompletion',
        message: 'Failed to schedule notification',
        error: e,
      });
    }
  }

  async cancelTimerNotification() {
    if (this.currentTimerNotificationId) {
      try {
        const Notifications = getNotifications();
        if (!Notifications) {
          this.currentTimerNotificationId = null;
          return;
        }
        await Notifications.cancelScheduledNotificationAsync(
          this.currentTimerNotificationId,
        );
      } catch (e) {
        LoggerService.warn({
          service: 'NotificationService',
          operation: 'cancelTimerNotification',
          message: 'Failed to cancel notification',
          error: e,
        });
      }
      this.currentTimerNotificationId = null;
    }
  }
}

export const NotificationService = new NotificationServiceClass();
