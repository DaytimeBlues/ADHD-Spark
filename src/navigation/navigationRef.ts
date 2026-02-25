import { createNavigationContainerRef } from '@react-navigation/native';
import { ROUTES } from './routes';

export type RootStackParamList = {
  [ROUTES.MAIN]: undefined;
  [ROUTES.HOME]: undefined;
  [ROUTES.FOCUS]: undefined;
  [ROUTES.TASKS]: { autoRecord?: boolean } | undefined;
  [ROUTES.CALENDAR]: undefined;
  [ROUTES.CHAT]: undefined;
  [ROUTES.HOME_MAIN]: undefined;
  [ROUTES.CHECK_IN]: undefined;
  [ROUTES.CBT_GUIDE]: undefined;
  [ROUTES.DIAGNOSTICS]: undefined;
  [ROUTES.FOG_CUTTER]: undefined;
  [ROUTES.POMODORO]: undefined;
  [ROUTES.ANCHOR]: undefined;
  [ROUTES.INBOX]: undefined;
};

export type OverlayIntentPayload = {
  route?: string;
  autoRecord?: boolean;
};

const OVERLAY_ROUTE_ALIASES: Record<string, string> = {
  Ignite: ROUTES.FOCUS,
  BrainDump: ROUTES.TASKS,
  FogCutter: ROUTES.FOG_CUTTER,
  CheckIn: ROUTES.CHECK_IN,
};

const ALLOWED_OVERLAY_ROUTES = new Set<string>([
  ROUTES.FOCUS,
  ROUTES.CBT_GUIDE,
  ROUTES.FOG_CUTTER,
  ROUTES.POMODORO,
  ROUTES.TASKS,
  ROUTES.ANCHOR,
  ROUTES.CHECK_IN,
]);

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Queue for pending overlay intents when navigation isn't ready
let pendingOverlayIntents: OverlayIntentPayload[] = [];

function normalizeOverlayRoute(route: string): string {
  return OVERLAY_ROUTE_ALIASES[route] ?? route;
}

function processOverlayIntent(payload: OverlayIntentPayload): boolean {
  if (!payload.route) {
    return false;
  }

  const normalizedRoute = normalizeOverlayRoute(payload.route);

  if (!ALLOWED_OVERLAY_ROUTES.has(normalizedRoute)) {
    return false;
  }

  if (normalizedRoute === ROUTES.TASKS) {
    navigationRef.navigate(ROUTES.TASKS, {
      autoRecord: payload.autoRecord === true,
    });
    return true;
  }

  navigationRef.navigate(normalizedRoute as keyof RootStackParamList);
  return true;
}

export function handleOverlayIntent(payload: OverlayIntentPayload): boolean {
  // If navigation isn't ready, queue the intent
  if (!navigationRef.isReady()) {
    // Only queue valid routes
    if (payload.route) {
      const normalizedRoute = normalizeOverlayRoute(payload.route);
      if (ALLOWED_OVERLAY_ROUTES.has(normalizedRoute)) {
        pendingOverlayIntents.push(payload);
        return true; // Accepted but queued
      }
    }
    return false; // Rejected - invalid route or no route
  }

  return processOverlayIntent(payload);
}

/**
 * Flush any pending overlay intents that were queued before navigation was ready.
 * Should be called when NavigationContainer becomes ready.
 */
export function flushOverlayIntentQueue(): void {
  if (pendingOverlayIntents.length === 0) {
    return;
  }

  // Process all pending intents
  const intentsToProcess = [...pendingOverlayIntents];
  pendingOverlayIntents = []; // Clear the queue first to avoid re-processing

  for (const payload of intentsToProcess) {
    processOverlayIntent(payload);
  }
}

/**
 * Clear the pending overlay intent queue without processing.
 * Useful for testing or when the app is being reset.
 */
export function clearOverlayIntentQueue(): void {
  pendingOverlayIntents = [];
}
