import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationServiceClass {
  private currentTimerNotificationId: string | null = null;

  async requestPermissions() {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
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
      console.warn('Failed to schedule notification', e);
    }
  }

  async cancelTimerNotification() {
    if (this.currentTimerNotificationId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(
          this.currentTimerNotificationId,
        );
      } catch (e) {
        console.warn('Failed to cancel notification', e);
      }
      this.currentTimerNotificationId = null;
    }
  }
}

export const NotificationService = new NotificationServiceClass();
