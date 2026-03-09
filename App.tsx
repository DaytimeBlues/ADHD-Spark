import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  StatusBar,
  View,
  ActivityIndicator,
  DeviceEventEmitter,
  Platform,
  StyleSheet,
} from 'react-native';

import AppNavigator from './src/navigation/AppNavigator';
import { GoogleTasksSyncService } from './src/services/GoogleTasksSyncService';
import OverlayService from './src/services/OverlayService';
import { LoggerService } from './src/services/LoggerService';
import { TimerService } from './src/services/TimerService';
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
import { WEB_APP_BASE_PATH } from './src/config/paths';
import { AppLifecycleService } from './src/services/AppLifecycleService';

if (config.environment === 'production') {
  import('@sentry/react-native')
    .then((Sentry) => {
      Sentry.init({
        dsn: config.sentryDsn || '',
        environment: config.environment,
        release: 'adhd-caddi@1.0.0',
        beforeSend: (event) => {
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
    })
    .catch((error) => {
      LoggerService.error({
        service: 'App',
        operation: 'initializeSentry',
        message: 'Failed to initialize Sentry',
        error,
      });
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

const syncWebUrlFromNavigation = () => {
  if (!isWeb || !navigationRef.isReady()) {
    return;
  }

  const rootState = navigationRef.getRootState();
  const targetPath = appLinking.getPathFromState?.(
    rootState,
    appLinking.config,
  );

  if (!targetPath) {
    return;
  }

  const currentPath = window.location.pathname;
  if (currentPath === targetPath) {
    return;
  }

  if (
    currentPath.startsWith(WEB_APP_BASE_PATH) ||
    targetPath.startsWith(WEB_APP_BASE_PATH)
  ) {
    window.history.replaceState(null, '', targetPath);
  }
};

const App = () => {
  const isReady = useAppBootstrap();
  const isDriftVisible = useDriftStore((state) => state.isVisible);
  const hideDrift = useDriftStore((state) => state.hideOverlay);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const lifecycleRegisteredRef = useRef(false);

  useEffect(() => {
    const unsub = BiometricService.subscribe((auth) =>
      setIsAuthenticated(auth),
    );
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!isReady || lifecycleRegisteredRef.current) {
      return;
    }

    AppLifecycleService.register({
      name: 'google-sync-polling',
      start: () => GoogleTasksSyncService.startForegroundPolling(),
      resume: () => GoogleTasksSyncService.startForegroundPolling(),
      pause: () => GoogleTasksSyncService.stopForegroundPolling(),
      stop: () => GoogleTasksSyncService.stopForegroundPolling(),
    });
    AppLifecycleService.register({
      name: 'timer-service',
      start: () => TimerService.start(),
      resume: () => TimerService.start(),
      pause: () => TimerService.stop(),
      stop: () => TimerService.stop(),
    });
    AppLifecycleService.initialize();
    lifecycleRegisteredRef.current = true;

    return () => {
      AppLifecycleService.shutdown();
      lifecycleRegisteredRef.current = false;
    };
  }, [isReady]);

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
          syncWebUrlFromNavigation();
          if (Platform.OS === 'android') {
            LoggerService.info({
              service: 'AndroidReleaseSmoke',
              operation: 'reportAppReady',
              message: 'APP_READY',
              platform: 'android',
            });
          }
        }}
        onStateChange={syncWebUrlFromNavigation}
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

  const { GestureHandlerRootView } =
    require('react-native-gesture-handler') as typeof import('react-native-gesture-handler');

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
