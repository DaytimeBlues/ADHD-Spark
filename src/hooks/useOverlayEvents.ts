import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus, AccessibilityInfo } from 'react-native';
import OverlayService from '../services/OverlayService';
import StorageService from '../services/StorageService';
import { LoggerService } from '../services/LoggerService';
import { isAndroid } from '../utils/PlatformUtils';

export type OverlayEvent = {
  id: string;
  timestamp: number;
  label: string;
};

export const useOverlayEvents = () => {
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(false);
  const [isOverlayPermissionRequesting, setIsOverlayPermissionRequesting] =
    useState(false);
  const [overlayEvents, setOverlayEvents] = useState<OverlayEvent[]>([]);

  const addOverlayEvent = useCallback((label: string) => {
    if (!__DEV__) {
      return;
    }
    setOverlayEvents((prev) => {
      const newEvent = {
        id: Date.now().toString() + Math.random(),
        timestamp: Date.now(),
        label,
      };
      return [newEvent, ...prev].slice(0, 5);
    });
  }, []);

  const checkOverlayState = useCallback(async () => {
    if (isAndroid) {
      try {
        const running = await OverlayService.isRunning();
        setIsOverlayEnabled(running);
      } catch (error) {
        LoggerService.warn({
          service: 'useOverlayEvents',
          operation: 'checkOverlayState',
          message: 'Failed to check overlay state',
          error,
        });
        setIsOverlayEnabled(false);
      }
    }
  }, []);

  const startOverlayWithLatestCount = useCallback(async () => {
    const taskItems =
      (await StorageService.getJSON<Array<{ id: string }>>(
        StorageService.STORAGE_KEYS.brainDump,
      )) || [];
    OverlayService.updateCount(taskItems.length);
    OverlayService.startOverlay();
    setIsOverlayEnabled(true);
  }, []);

  const toggleOverlay = useCallback(
    async (value: boolean) => {
      if (!isAndroid) {
        return;
      }

      try {
        if (value) {
          setIsOverlayPermissionRequesting(true);
          const hasPermission = await OverlayService.canDrawOverlays();
          if (hasPermission) {
            setIsOverlayPermissionRequesting(false);
            await startOverlayWithLatestCount();
            return;
          }

          const granted = await OverlayService.requestOverlayPermission();
          const hasPermissionAfterRequest =
            granted || (await OverlayService.canDrawOverlays());

          if (hasPermissionAfterRequest) {
            setIsOverlayPermissionRequesting(false);
            await startOverlayWithLatestCount();
            return;
          }

          setIsOverlayPermissionRequesting(false);
          setIsOverlayEnabled(false);
          return;
        }

        OverlayService.stopOverlay();
        setIsOverlayEnabled(false);
      } catch (error) {
        setIsOverlayPermissionRequesting(false);
        setIsOverlayEnabled(false);
      }
    },
    [startOverlayWithLatestCount],
  );

  useEffect(() => {
    checkOverlayState();
  }, [checkOverlayState]);

  useEffect(() => {
    if (!isAndroid) {
      return;
    }

    const appStateSubscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          checkOverlayState();
        }
      },
    );

    return () => {
      appStateSubscription.remove();
    };
  }, [checkOverlayState]);

  useEffect(() => {
    if (!isAndroid) {
      return;
    }

    const unsubscribes = [
      OverlayService.addEventListener('overlay_permission_requested', () => {
        setIsOverlayPermissionRequesting(true);
        addOverlayEvent('Permission requested');
        AccessibilityInfo.announceForAccessibility(
          'Overlay permission request started',
        );
      }),
      OverlayService.addEventListener(
        'overlay_permission_result',
        ({ granted }) => {
          setIsOverlayPermissionRequesting(false);
          addOverlayEvent(
            `Permission result: ${granted ? 'GRANTED' : 'DENIED'}`,
          );
          AccessibilityInfo.announceForAccessibility(
            granted
              ? 'Overlay permission granted'
              : 'Overlay permission denied',
          );
        },
      ),
      OverlayService.addEventListener('overlay_permission_timeout', () => {
        setIsOverlayPermissionRequesting(false);
        addOverlayEvent('Permission timeout');
        AccessibilityInfo.announceForAccessibility(
          'Overlay permission request timed out',
        );
      }),
      OverlayService.addEventListener('overlay_permission_error', () => {
        setIsOverlayPermissionRequesting(false);
        addOverlayEvent('Permission error');
        AccessibilityInfo.announceForAccessibility(
          'Overlay permission request failed',
        );
      }),
      OverlayService.addEventListener('overlay_started', () => {
        setIsOverlayEnabled(true);
      }),
      OverlayService.addEventListener('overlay_stopped', () => {
        setIsOverlayEnabled(false);
      }),
    ];

    return () => {
      unsubscribes.forEach((unsub) => unsub?.());
    };
  }, [addOverlayEvent]);

  return {
    isOverlayEnabled,
    isOverlayPermissionRequesting,
    overlayEvents,
    addOverlayEvent,
    toggleOverlay,
    checkOverlayState,
  };
};
