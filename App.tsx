import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  StatusBar,
  Platform,
  View,
  ActivityIndicator,
  DeviceEventEmitter,
  AppState,
  AppStateStatus,
} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import StorageService from './src/services/StorageService';
import { GoogleTasksSyncService } from './src/services/PlaudService';
import OverlayService from './src/services/OverlayService';
import WebMCPService from './src/services/WebMCPService';
import { Tokens } from './src/theme/tokens';
import { config } from './src/config';
import {
  handleOverlayIntent,
  navigationRef,
} from './src/navigation/navigationRef';

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const pollingStartedRef = useRef(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await StorageService.init();
        
        // Validate Google configuration before attempting sync
        const hasGoogleConfig = Platform.OS === 'web' || 
          (config.googleWebClientId || config.googleIosClientId);
        
        if (!hasGoogleConfig && Platform.OS !== 'web') {
          console.warn(
            '[Google Config] Missing REACT_APP_GOOGLE_WEB_CLIENT_ID or REACT_APP_GOOGLE_IOS_CLIENT_ID. ' +
            'Google Tasks/Calendar sync will be disabled. See android/app/google-services.json setup instructions.'
          );
        }
        
        await GoogleTasksSyncService.syncToBrainDump();
        WebMCPService.init();
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsReady(true);
      }
    };

    initializeApp();

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

      GoogleTasksSyncService.stopForegroundPolling();
      pollingStartedRef.current = false;
    };

    syncPollingForState(AppState.currentState);
    const appStateSubscription = AppState.addEventListener(
      'change',
      syncPollingForState,
    );

    return () => {
      appStateSubscription.remove();
      GoogleTasksSyncService.stopForegroundPolling();
      pollingStartedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'overlayRouteIntent',
      (payload) => {
        const handled = handleOverlayIntent(payload ?? {});
        if (handled) {
          OverlayService.collapseOverlay();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Tokens.colors.neutral.darkest,
        }}
      >
        <ActivityIndicator size="large" color={Tokens.colors.indigo.primary} />
      </View>
    );
  }

  const content = (
    <NavigationContainer ref={navigationRef}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Tokens.colors.neutral.darkest}
      />
      <AppNavigator />
    </NavigationContainer>
  );

  // GestureHandlerRootView can cause issues on web, wrap conditionally
  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{content}</View>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {content}
    </GestureHandlerRootView>
  );
};

export default App;
