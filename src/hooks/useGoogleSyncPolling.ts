import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { GoogleTasksSyncService } from '../services/GoogleTasksSyncService';
import { isWeb } from '../utils/PlatformUtils';

export const useGoogleSyncPolling = (): void => {
  const pollingStartedRef = useRef(false);

  useEffect(() => {
    const syncPollingForState = (nextState: AppStateStatus) => {
      if (isWeb) {
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
