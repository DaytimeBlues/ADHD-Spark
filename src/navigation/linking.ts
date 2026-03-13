import {
  getPathFromState as getReactNavigationPathFromState,
  getStateFromPath as getReactNavigationStateFromPath,
  type LinkingOptions,
} from '@react-navigation/native';
import type { RootStackParamList } from './navigationRef';
import { ROUTES } from './routes';
import { WEB_LINKING_PREFIXES } from '../config/paths';

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

export const appLinking: LinkingOptions<RootStackParamList> = {
  prefixes: WEB_LINKING_PREFIXES,
  config: ROOT_SCREEN_CONFIG,
  getStateFromPath(path, options) {
    return getReactNavigationStateFromPath(path, options);
  },
  getPathFromState(state, options) {
    return getReactNavigationPathFromState(state, options);
  },
};
