import { Platform } from "react-native";
import StorageService from "../services/StorageService";
import { GoogleTasksSyncService } from "../services/GoogleTasksSyncService";
import WebMCPService from "../services/WebMCPService";
import { CheckInService } from "../services/CheckInService";
import { TimerService } from "../services/TimerService";
import { DriftService } from "../services/DriftService";
import { BiometricService } from "../services/BiometricService";
import { config } from "../config";

const CRITICAL_INIT_TIMEOUT_MS = 8000;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

interface BootstrapResult {
  success: boolean;
  errors: Error[];
}

/**
 * Initialize critical services that block app readiness.
 * These must complete (or timeout) before the app renders.
 */
async function initializeCriticalServices(): Promise<void> {
  await Promise.all([StorageService.init(), BiometricService.init()]);
}

/**
 * Initialize non-critical services that can run in background.
 * These don't block app readiness.
 */
function initializeNonBlockingServices(): void {
  void GoogleTasksSyncService.syncToBrainDump().catch((error) => {
    console.error("Initial Google Tasks sync failed:", error);
  });
  WebMCPService.init();
  CheckInService.start();
  DriftService.init();
  TimerService.start();
}

/**
 * Check if Google configuration is present for sync features.
 */
function checkGoogleConfig(): boolean {
  const hasGoogleConfig =
    Platform.OS === "web" ||
    config.googleWebClientId ||
    config.googleIosClientId;

  if (!hasGoogleConfig && Platform.OS !== "web") {
    console.warn(
      "[Google Config] Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID or EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID. Google Tasks/Calendar sync will be disabled. See android/app/google-services.json setup instructions.",
    );
  }

  return hasGoogleConfig;
}

/**
 * Bootstrap the application.
 *
 * @returns Promise that resolves when critical initialization is complete
 */
export async function bootstrapApp(): Promise<BootstrapResult> {
  const errors: Error[] = [];

  try {
    checkGoogleConfig();

    const initTimeout = wait(CRITICAL_INIT_TIMEOUT_MS).then(() => {
      console.warn(
        `Critical app initialization exceeded ${CRITICAL_INIT_TIMEOUT_MS}ms. Continuing app launch.`,
      );
    });

    await Promise.race([initializeCriticalServices(), initTimeout]);
    initializeNonBlockingServices();

    return { success: true, errors };
  } catch (error) {
    console.error("App initialization error:", error);
    errors.push(error instanceof Error ? error : new Error(String(error)));
    return { success: false, errors };
  }
}

export { CRITICAL_INIT_TIMEOUT_MS };
export type { BootstrapResult };
