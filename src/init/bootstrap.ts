import StorageService from '../services/StorageService';
import { GoogleTasksSyncService } from '../services/GoogleTasksSyncService';
import WebMCPService from '../services/WebMCPService';
import { CheckInService } from '../services/CheckInService';
import { DriftService } from '../services/DriftService';
import { BiometricService } from '../services/BiometricService';
import { LoggerService } from '../services/LoggerService';
import { config } from '../config';
import { createOperationContext } from '../services/OperationContext';
import { withOperationContext } from '../services/LoggerService';

const CRITICAL_INIT_TIMEOUT_MS = 8000;
let unhandledRejectionHandlerInstalled = false;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

interface BootstrapResult {
  success: boolean;
  errors: Error[];
}

function installUnhandledRejectionHandler(): void {
  if (unhandledRejectionHandlerInstalled) {
    return;
  }

  const operationContext = createOperationContext({ feature: 'bootstrap' });
  const handleUnhandledRejection = (reason: unknown) => {
    LoggerService.fatal({
      ...withOperationContext(
        {
          service: 'bootstrap',
          operation: 'unhandledRejection',
          message: 'Unhandled promise rejection',
          error: reason,
        },
        operationContext,
      ),
    });
  };

  const processLike = globalThis as typeof globalThis & {
    process?: {
      on?: (event: string, listener: (reason: unknown) => void) => void;
    };
  };
  processLike.process?.on?.('unhandledRejection', handleUnhandledRejection);

  const globalWithEvents = globalThis as typeof globalThis & {
    addEventListener?: (
      type: string,
      listener: (event: { reason?: unknown }) => void,
    ) => void;
  };
  globalWithEvents.addEventListener?.('unhandledrejection', (event) => {
    handleUnhandledRejection(event.reason);
  });

  unhandledRejectionHandlerInstalled = true;
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
function initializeNonBlockingServices(): undefined {
  const operationContext = createOperationContext({ feature: 'bootstrap' });
  GoogleTasksSyncService.syncToBrainDump(0, operationContext).catch((error) => {
    LoggerService.error({
      ...withOperationContext(
        {
          service: 'bootstrap',
          operation: 'initializeNonBlockingServices',
          message: 'Initial Google Tasks sync failed',
          error,
        },
        operationContext,
      ),
    });
  });
  WebMCPService.init();
  CheckInService.start();
  DriftService.init();
}

function logStartupDiagnostics(): void {
  const operationContext = createOperationContext({ feature: 'bootstrap' });

  config.startupWarnings.forEach((diagnostic) => {
    LoggerService.warn({
      ...withOperationContext(
        {
          service: 'bootstrap',
          operation: 'logStartupDiagnostics',
          message: diagnostic.message,
          context: {
            code: diagnostic.code,
            envVar: diagnostic.envVar,
            feature: diagnostic.feature,
          },
        },
        operationContext,
      ),
    });
  });

  config.startupErrors.forEach((diagnostic) => {
    LoggerService.error({
      ...withOperationContext(
        {
          service: 'bootstrap',
          operation: 'logStartupDiagnostics',
          message: diagnostic.message,
          context: {
            code: diagnostic.code,
            envVar: diagnostic.envVar,
            feature: diagnostic.feature,
          },
        },
        operationContext,
      ),
    });
  });
}

/**
 * Bootstrap the application.
 *
 * @returns Promise that resolves when critical initialization is complete
 */
export async function bootstrapApp(): Promise<BootstrapResult> {
  const errors: Error[] = [];
  const operationContext = createOperationContext({ feature: 'bootstrap' });

  try {
    installUnhandledRejectionHandler();
    logStartupDiagnostics();

    const initTimeout = wait(CRITICAL_INIT_TIMEOUT_MS).then(() => {
      LoggerService.warn({
        ...withOperationContext(
          {
            service: 'bootstrap',
            operation: 'bootstrapApp',
            message: `Critical app initialization exceeded ${CRITICAL_INIT_TIMEOUT_MS}ms. Continuing app launch.`,
          },
          operationContext,
        ),
      });
    });

    await Promise.race([initializeCriticalServices(), initTimeout]);
    initializeNonBlockingServices();

    return { success: true, errors };
  } catch (error) {
    LoggerService.error({
      ...withOperationContext(
        {
          service: 'bootstrap',
          operation: 'bootstrapApp',
          message: 'App initialization error',
          error,
        },
        operationContext,
      ),
    });
    errors.push(error instanceof Error ? error : new Error(String(error)));
    return { success: false, errors };
  }
}

export { CRITICAL_INIT_TIMEOUT_MS };
export type { BootstrapResult };
