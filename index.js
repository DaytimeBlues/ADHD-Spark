if (typeof process === 'undefined') {
  global.process = { env: {} };
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import * as Sentry from '@sentry/react-native';

// Sentry.init is called in App.tsx with production guards.
// Here we only wrap the root component for error boundary integration.
AppRegistry.registerComponent(appName, () => Sentry.wrap(App));
