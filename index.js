if (typeof process === 'undefined') {
  global.process = { env: {} };
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: __DEV__, // Print useful debugging info in dev
  tracesSampleRate: 1.0, // Adjust in production
  _experiments: {
    profilesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
  },
});

AppRegistry.registerComponent(appName, () => Sentry.wrap(App));
