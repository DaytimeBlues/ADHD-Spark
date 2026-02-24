// Mock for expo-notifications
export const setNotificationHandler = jest.fn();

export const getPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });
export const requestPermissionsAsync = jest.fn().mockResolvedValue({ status: 'granted' });

export const scheduleNotificationAsync = jest.fn().mockResolvedValue('test-notification-id');
export const cancelScheduledNotificationAsync = jest.fn().mockResolvedValue(undefined);

export enum AndroidNotificationPriority {
  MIN = 'min',
  LOW = 'low',
  DEFAULT = 'default',
  HIGH = 'high',
  MAX = 'max',
}

export enum SchedulableTriggerInputTypes {
  TIME_INTERVAL = 'timeInterval',
  DATE = 'date',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  YEARLY = 'yearly',
  LOCATION = 'location',
  CALENDAR = 'calendar',
}
