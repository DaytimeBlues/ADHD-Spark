import { createNavigationContainerRef } from '@react-navigation/native';
import { ROUTES } from './routes';

type RootStackParamList = {
  [ROUTES.MAIN]: undefined;
  [ROUTES.HOME]: undefined;
  [ROUTES.FOCUS]: undefined;
  [ROUTES.TASKS]: { autoRecord?: boolean } | undefined;
  [ROUTES.CALENDAR]: undefined;
  [ROUTES.HOME_MAIN]: undefined;
  [ROUTES.CHECK_IN]: undefined;
  [ROUTES.CBT_GUIDE]: undefined;
  [ROUTES.FOG_CUTTER]: undefined;
  [ROUTES.POMODORO]: undefined;
  [ROUTES.ANCHOR]: undefined;
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

function normalizeOverlayRoute(route: string): string {
  return OVERLAY_ROUTE_ALIASES[route] ?? route;
}

export function handleOverlayIntent(payload: OverlayIntentPayload): boolean {
  if (!navigationRef.isReady() || !payload.route) {
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
