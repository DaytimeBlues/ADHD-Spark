import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, AppState, AppStateStatus } from 'react-native';
import OverlayService from '../services/OverlayService';
import StorageService from '../services/StorageService';
import { LoggerService } from '../services/LoggerService';
import { isAndroid } from '../utils/PlatformUtils';

export type OverlayEvent = {
  id: string;
  timestamp: number;
  label: string;
};

const createOverlayEvent = (label: string): OverlayEvent => {
  const timestamp = Date.now();

  return {
    id: `${timestamp}-${Math.random()}`,
    timestamp,
    label,
  };
};

const announceOverlayEvent = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

const checkOverlayRunning = async (
  setIsOverlayEnabled: (value: boolean) => void,
) => {
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
};

const startOverlayWithLatestCount = async (
  setIsOverlayEnabled: (value: boolean) => void,
) => {
  const taskItems =
    (await StorageService.getJSON<Array<{ id: string }>>(
      StorageService.STORAGE_KEYS.brainDump,
    )) || [];

  OverlayService.updateCount(taskItems.length);
  OverlayService.startOverlay();
  setIsOverlayEnabled(true);
};

const requestOverlayEnable = async ({
  setIsOverlayEnabled,
  setIsOverlayPermissionRequesting,
}: {
  setIsOverlayEnabled: (value: boolean) => void;
  setIsOverlayPermissionRequesting: (value: boolean) => void;
}) => {
  setIsOverlayPermissionRequesting(true);

  const hasPermission = await OverlayService.canDrawOverlays();
  if (hasPermission) {
    setIsOverlayPermissionRequesting(false);
    await startOverlayWithLatestCount(setIsOverlayEnabled);
    return;
  }

  const granted = await OverlayService.requestOverlayPermission();
  const hasPermissionAfterRequest =
    granted || (await OverlayService.canDrawOverlays());

  if (hasPermissionAfterRequest) {
    setIsOverlayPermissionRequesting(false);
    await startOverlayWithLatestCount(setIsOverlayEnabled);
    return;
  }

  setIsOverlayPermissionRequesting(false);
  setIsOverlayEnabled(false);
};

const subscribeToOverlayEvents = ({
  addOverlayEvent,
  setIsOverlayEnabled,
  setIsOverlayPermissionRequesting,
}: {
  addOverlayEvent: (label: string) => void;
  setIsOverlayEnabled: (value: boolean) => void;
  setIsOverlayPermissionRequesting: (value: boolean) => void;
}) => {
  return [
    OverlayService.addEventListener('overlay_permission_requested', () => {
      setIsOverlayPermissionRequesting(true);
      addOverlayEvent('Permission requested');
      announceOverlayEvent('Overlay permission request started');
    }),
    OverlayService.addEventListener(
      'overlay_permission_result',
      ({ granted }) => {
        setIsOverlayPermissionRequesting(false);
        addOverlayEvent(`Permission result: ${granted ? 'GRANTED' : 'DENIED'}`);
        announceOverlayEvent(
          granted ? 'Overlay permission granted' : 'Overlay permission denied',
        );
      },
    ),
    OverlayService.addEventListener('overlay_permission_timeout', () => {
      setIsOverlayPermissionRequesting(false);
      addOverlayEvent('Permission timeout');
      announceOverlayEvent('Overlay permission request timed out');
    }),
    OverlayService.addEventListener('overlay_permission_error', () => {
      setIsOverlayPermissionRequesting(false);
      addOverlayEvent('Permission error');
      announceOverlayEvent('Overlay permission request failed');
    }),
    OverlayService.addEventListener('overlay_started', () => {
      setIsOverlayEnabled(true);
    }),
    OverlayService.addEventListener('overlay_stopped', () => {
      setIsOverlayEnabled(false);
    }),
  ];
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
      return [createOverlayEvent(label), ...prev].slice(0, 5);
    });
  }, []);

  const checkOverlayState = useCallback(async () => {
    if (!isAndroid) {
      return;
    }

    await checkOverlayRunning(setIsOverlayEnabled);
  }, []);

  const toggleOverlay = useCallback(async (value: boolean) => {
    if (!isAndroid) {
      return;
    }

    try {
      if (value) {
        await requestOverlayEnable({
          setIsOverlayEnabled,
          setIsOverlayPermissionRequesting,
        });
        return;
      }

      OverlayService.stopOverlay();
      setIsOverlayEnabled(false);
    } catch (error) {
      setIsOverlayPermissionRequesting(false);
      setIsOverlayEnabled(false);
      LoggerService.warn({
        service: 'useOverlayEvents',
        operation: 'toggleOverlay',
        message: 'Overlay toggle failed',
        error,
        context: {
          attemptedTargetState: value,
        },
      });
    }
  }, []);

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

    const unsubscribes = subscribeToOverlayEvents({
      addOverlayEvent,
      setIsOverlayEnabled,
      setIsOverlayPermissionRequesting,
    });

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
