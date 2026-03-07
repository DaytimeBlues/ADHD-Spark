import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import {
  StatusBar,
  View,
  ActivityIndicator,
  DeviceEventEmitter,
  StyleSheet,
  AppState,
  AppStateStatus,
} from 'react-native';

import AppNavigator from './src/navigation/AppNavigator';
import { GoogleTasksSyncService } from './src/services/GoogleTasksSyncService';
import OverlayService from './src/services/OverlayService';
import { LoggerService } from './src/services/LoggerService';
import { Tokens } from './src/theme/tokens';
import { config } from './src/config';
import {
  handleOverlayIntent,
  flushOverlayIntentQueue,
  navigationRef,
  type RootStackParamList,
} from './src/navigation/navigationRef';
import { agentEventBus } from './src/services/AgentEventBus';
import { isWeb } from './src/utils/PlatformUtils';
import { bootstrapApp } from './src/init/bootstrap';

import { DriftCheckOverlay } from './src/components/DriftCheckOverlay';
import { useDriftStore } from './src/store/useDriftStore';
import { BiometricService } from './src/services/BiometricService';
import { LockScreen } from './src/components/LockScreen';
import ErrorBoundary from './src/components/ErrorBoundary';
import { appLinking } from './src/navigation/linking';

// Initialize Sentry for error tracking
if (config.environment === 'production') {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
    environment: config.environment,
    release: 'adhd-caddi@1.0.0',
    beforeSend: (event) => {
      // Don't send errors in development
      if (__DEV__) {
        LoggerService.info({
          service: 'App',
          operation: 'beforeSend',
          message: '[Sentry] Would send error',
          context: { event },
        });
        return null;
      }
      return event;
    },
  });
}

export const useAppBootstrap = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    bootstrapApp()
      .catch((error) => {
        LoggerService.fatal({
          service: 'App',
          operation: 'useAppBootstrap',
          message: 'bootstrapApp rejected unexpectedly',
          error,
        });
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return isReady;
};

const App = () => {
  const isReady = useAppBootstrap();
  const isDriftVisible = useDriftStore((state) => state.isVisible);
  const hideDrift = useDriftStore((state) => state.hideOverlay);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const pollingStartedRef = useRef(false);

  useEffect(() => {
    const unsub = BiometricService.subscribe((auth) =>
      setIsAuthenticated(auth),
    );
    return () => {
      unsub();
    };
  }, []);

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

  useEffect(() => {
    const unsub = agentEventBus.on('navigate:screen', ({ screen }) => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(screen as keyof RootStackParamList);
      }
    });

    return unsub;
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Tokens.colors.indigo.primary} />
      </View>
    );
  }

  const handleUnlock = () => {
    BiometricService.authenticate();
  };

  const content = isAuthenticated ? (
    <ErrorBoundary>
      <NavigationContainer
        ref={navigationRef}
        linking={appLinking}
        onReady={() => {
          // Flush any overlay intents that were queued before navigation was ready
          flushOverlayIntentQueue();
        }}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor={Tokens.colors.neutral.darkest}
        />
        <AppNavigator />
        <DriftCheckOverlay visible={isDriftVisible} onClose={hideDrift} />
      </NavigationContainer>
    </ErrorBoundary>
  ) : (
    <ErrorBoundary>
      <LockScreen onUnlock={handleUnlock} />
    </ErrorBoundary>
  );

  // GestureHandlerRootView can cause issues on web, wrap conditionally
  if (isWeb) {
    return <View style={styles.flex}>{content}</View>;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      {content}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  flex: {
    flex: 1,
  },
});

export default App;
