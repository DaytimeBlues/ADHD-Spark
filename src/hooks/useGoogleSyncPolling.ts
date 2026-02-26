import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { GoogleTasksSyncService } from '../services/GoogleTasksSyncService';

export const useGoogleSyncPolling = (): void => {
  const pollingStartedRef = useRef(false);

  useEffect(() => {
    const syncPollingForState = (nextState: AppStateStatus) => {
      if (Platform.OS === 'web') {
        return;
      }

      if (nextState === 'active') {
        if (!pollingStartedRef.current) {
          GoogleTasksSyncService.startForegroundPolling();
          pollingStartedRef.current = true;
        }
        return;
      }

      if (pollingStartedRef.current) {
        GoogleTasksSyncService.stopForegroundPolling();
      }
      pollingStartedRef.current = false;
    };

    syncPollingForState(AppState.currentState);
    const appStateSubscription = AppState.addEventListener(
      'change',
      syncPollingForState,
    );

    return () => {
      appStateSubscription.remove();
      if (pollingStartedRef.current) {
        GoogleTasksSyncService.stopForegroundPolling();
      }
      pollingStartedRef.current = false;
    };
  }, []);
};

export default useGoogleSyncPolling;
