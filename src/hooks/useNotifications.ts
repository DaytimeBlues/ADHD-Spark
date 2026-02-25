import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../services/NotificationService';

/**
 * useNotifications
 *
 * Custom hook for managing notification permissions and scheduling.
 * Wraps NotificationService to provide a React-friendly interface.
 */
export function useNotifications() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await NotificationService.requestPermissions();
      setHasPermission(granted);
    } catch (error) {
      console.error('Failed to check notification permissions:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      const granted = await NotificationService.requestPermissions();
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      setHasPermission(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const scheduleNotification = useCallback(
    async (title: string, body: string, triggerDateMs: number) => {
      if (!hasPermission) {
        console.warn('Cannot schedule notification: permission not granted');
        return null;
      }
      return NotificationService.scheduleTimerCompletion(
        title,
        body,
        triggerDateMs,
      );
    },
    [hasPermission],
  );

  const cancelNotification = useCallback(async () => {
    return NotificationService.cancelTimerNotification();
  }, []);

  return {
    hasPermission,
    isLoading,
    requestPermission,
    scheduleNotification,
    cancelNotification,
  };
}
