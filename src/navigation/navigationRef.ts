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

const ALLOWED_OVERLAY_ROUTES = new Set<string>([
  ROUTES.CBT_GUIDE,
  ROUTES.FOG_CUTTER,
  ROUTES.TASKS,
  ROUTES.ANCHOR,
  ROUTES.CHECK_IN,
]);

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function handleOverlayIntent(payload: OverlayIntentPayload): boolean {
  if (!navigationRef.isReady() || !payload.route) {
    return false;
  }

  if (!ALLOWED_OVERLAY_ROUTES.has(payload.route)) {
    return false;
  }

  if (payload.route === ROUTES.TASKS) {
    navigationRef.navigate(ROUTES.TASKS, {
      autoRecord: payload.autoRecord === true,
    });
    return true;
  }

  navigationRef.navigate(payload.route as keyof RootStackParamList);
  return true;
}
