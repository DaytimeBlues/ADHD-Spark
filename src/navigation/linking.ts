import {
  getPathFromState as getReactNavigationPathFromState,
  getStateFromPath as getReactNavigationStateFromPath,
  type LinkingOptions,
} from '@react-navigation/native';
import type { RootStackParamList } from './navigationRef';
import { ROUTES } from './routes';
import { WEB_APP_BASE_PATH, WEB_LINKING_PREFIXES } from '../config/paths';
import { isWeb } from '../utils/PlatformUtils';

const TAB_PATHS: Record<string, string> = {
  [ROUTES.HOME]: '',
  [ROUTES.FOCUS]: 'focus',
  [ROUTES.TASKS]: 'tasks',
  [ROUTES.CALENDAR]: 'calendar',
  [ROUTES.CHAT]: 'chat',
};

const ROOT_SCREEN_CONFIG: LinkingOptions<RootStackParamList>['config'] = {
  screens: {
    [ROUTES.MAIN]: {
      path: '',
      screens: TAB_PATHS,
    },
    [ROUTES.CHECK_IN]: 'check-in',
    [ROUTES.CBT_GUIDE]: 'cbt-guide',
    [ROUTES.DIAGNOSTICS]: 'diagnostics',
    [ROUTES.FOG_CUTTER]: 'fog-cutter',
    [ROUTES.POMODORO]: 'pomodoro',
    [ROUTES.ANCHOR]: 'anchor',
    [ROUTES.INBOX]: 'inbox',
  },
};

function trimBasePath(path: string): string {
  if (!path.startsWith(WEB_APP_BASE_PATH)) {
    return path;
  }

  const trimmed = path.slice(WEB_APP_BASE_PATH.length);
  return trimmed.length > 0 ? trimmed : '/';
}

function prependBasePath(path: string): string {
  if (!path || path === '/') {
    return `${WEB_APP_BASE_PATH}/`;
  }

  if (path.startsWith(WEB_APP_BASE_PATH)) {
    return path;
  }

  return `${WEB_APP_BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
}

export const appLinking: LinkingOptions<RootStackParamList> = {
  prefixes: WEB_LINKING_PREFIXES,
  config: ROOT_SCREEN_CONFIG,
  getStateFromPath(path, options) {
    const normalizedPath = isWeb ? trimBasePath(path) : path;
    return getReactNavigationStateFromPath(normalizedPath, options);
  },
  getPathFromState(state, options) {
    const path = getReactNavigationPathFromState(state, options);
    return isWeb ? prependBasePath(path) : path;
  },
};
