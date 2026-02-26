import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  StatusBar,
  Platform,
  View,
  ActivityIndicator,
  DeviceEventEmitter,
  StyleSheet,
} from "react-native";

import AppNavigator from "./src/navigation/AppNavigator";
import StorageService from "./src/services/StorageService";
import { GoogleTasksSyncService } from "./src/services/GoogleTasksSyncService";
import OverlayService from "./src/services/OverlayService";
import WebMCPService from "./src/services/WebMCPService";
import { Tokens } from "./src/theme/tokens";
import { config } from "./src/config";
import {
  handleOverlayIntent,
  flushOverlayIntentQueue,
  navigationRef,
  type RootStackParamList,
} from "./src/navigation/navigationRef";
import { agentEventBus } from "./src/services/AgentEventBus";
import { CheckInService } from "./src/services/CheckInService";
import { TimerService } from "./src/services/TimerService";

import { DriftCheckOverlay } from "./src/components/DriftCheckOverlay";
import { useDriftStore } from "./src/store/useDriftStore";
import { DriftService } from "./src/services/DriftService";
import { BiometricService } from "./src/services/BiometricService";
import { LockScreen } from "./src/components/LockScreen";
import { useGoogleSyncPolling } from "./src/hooks/useGoogleSyncPolling";

const CRITICAL_INIT_TIMEOUT_MS = 8000;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const useAppBootstrap = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeCriticalServices = async () => {
      await Promise.all([StorageService.init(), BiometricService.init()]);
    };

    const initializeNonBlockingServices = () => {
      void GoogleTasksSyncService.syncToBrainDump().catch((error) => {
        console.error("Initial Google Tasks sync failed:", error);
      });
      WebMCPService.init();
      CheckInService.start();
      DriftService.init();
      TimerService.start();
    };

    const initializeApp = async () => {
      try {
        const hasGoogleConfig =
          Platform.OS === "web" ||
          config.googleWebClientId ||
          config.googleIosClientId;

        if (!hasGoogleConfig && Platform.OS !== "web") {
          console.warn(
            "[Google Config] Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID or EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID. Google Tasks/Calendar sync will be disabled. See android/app/google-services.json setup instructions.",
          );
        }

        const initTimeout = wait(CRITICAL_INIT_TIMEOUT_MS).then(() => {
          console.warn(
            `Critical app initialization exceeded ${CRITICAL_INIT_TIMEOUT_MS}ms. Continuing app launch.`,
          );
        });

        await Promise.race([initializeCriticalServices(), initTimeout]);
        initializeNonBlockingServices();
      } catch (error) {
        console.error("App initialization error:", error);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    initializeApp();

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

  useEffect(() => {
    const unsub = BiometricService.subscribe((auth) =>
      setIsAuthenticated(auth),
    );
    return () => {
      unsub();
    };
  }, []);

  useGoogleSyncPolling();

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
