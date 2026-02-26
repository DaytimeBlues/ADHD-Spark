import React, { useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  StatusBar,
  Platform,
  View,
  ActivityIndicator,
  DeviceEventEmitter,
  AppState,
  AppStateStatus,
  StyleSheet,
} from "react-native";

import AppNavigator from "./src/navigation/AppNavigator";
import { GoogleTasksSyncService } from "./src/services/GoogleTasksSyncService";
import OverlayService from "./src/services/OverlayService";
import { Tokens } from "./src/theme/tokens";
import {
  handleOverlayIntent,
  flushOverlayIntentQueue,
  navigationRef,
  type RootStackParamList,
} from "./src/navigation/navigationRef";
import { agentEventBus } from "./src/services/AgentEventBus";

import { DriftCheckOverlay } from "./src/components/DriftCheckOverlay";
import { useDriftStore } from "./src/store/useDriftStore";
import { BiometricService } from "./src/services/BiometricService";
import { LockScreen } from "./src/components/LockScreen";
import { bootstrapApp } from "./src/init/bootstrap";

/**
 * useAppBootstrap
 *
 * Manages app initialization lifecycle.
 * Returns isReady state when critical services are initialized.
 */
export const useAppBootstrap = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      await bootstrapApp();
      if (isMounted) {
        setIsReady(true);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  return isReady;
};

const App = () => {
  const isReady = useAppBootstrap();
  const pollingStartedRef = useRef(false);
  const isDriftVisible = useDriftStore((state) => state.isVisible);
  const hideDrift = useDriftStore((state) => state.hideOverlay);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

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
      if (Platform.OS === "web") {
        return;
      }

      if (nextState === "active") {
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
      "change",
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
      "overlayRouteIntent",
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
    const unsub = agentEventBus.on("navigate:screen", ({ screen }) => {
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
    <NavigationContainer
      ref={navigationRef}
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
  ) : (
    <LockScreen onUnlock={handleUnlock} />
  );

  // GestureHandlerRootView can cause issues on web, wrap conditionally
  if (Platform.OS === "web") {
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  flex: {
    flex: 1,
  },
});

export default App;
