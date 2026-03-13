jest.mock('../src/utils/PlatformUtils', () => ({
  isWeb: true,
  isAndroid: false,
  isIOS: false,
}));

import { appLinking } from '../src/navigation/linking';
import { ROUTES } from '../src/navigation/routes';

describe('web linking config', () => {
  it('resolves root-hosted routes from the current origin', () => {
    const homeState = appLinking.getStateFromPath?.('/', appLinking.config);
    const checkInState = appLinking.getStateFromPath?.(
      '/check-in',
      appLinking.config,
    );
    const cbtGuideState = appLinking.getStateFromPath?.(
      '/cbt-guide',
      appLinking.config,
    );
    const diagnosticsState = appLinking.getStateFromPath?.(
      '/diagnostics',
      appLinking.config,
    );

    expect(homeState).toMatchObject({
      routes: [{ name: ROUTES.MAIN }],
    });
    expect(checkInState).toMatchObject({
      routes: [{ name: ROUTES.CHECK_IN }],
    });
    expect(cbtGuideState).toMatchObject({
      routes: [{ name: ROUTES.CBT_GUIDE }],
    });
    expect(diagnosticsState).toMatchObject({
      routes: [{ name: ROUTES.DIAGNOSTICS }],
    });
  });

  it('builds root-hosted web urls for the registered routes', () => {
    expect(
      appLinking.getPathFromState?.(
        {
          stale: false,
          type: 'stack',
          key: 'root',
          index: 0,
          routeNames: [ROUTES.CHECK_IN],
          routes: [{ key: 'check-in', name: ROUTES.CHECK_IN }],
        },
        appLinking.config,
      ),
    ).toBe('/check-in');

    expect(
      appLinking.getPathFromState?.(
        {
          stale: false,
          type: 'stack',
          key: 'root',
          index: 0,
          routeNames: [ROUTES.CBT_GUIDE],
          routes: [{ key: 'cbt-guide', name: ROUTES.CBT_GUIDE }],
        },
        appLinking.config,
      ),
    ).toBe('/cbt-guide');

    expect(
      appLinking.getPathFromState?.(
        {
          stale: false,
          type: 'stack',
          key: 'root',
          index: 0,
          routeNames: [ROUTES.DIAGNOSTICS],
          routes: [{ key: 'diagnostics', name: ROUTES.DIAGNOSTICS }],
        },
        appLinking.config,
      ),
    ).toBe('/diagnostics');

    expect(
      appLinking.getPathFromState?.(
        {
          stale: false,
          type: 'stack',
          key: 'root',
          index: 0,
          routeNames: [ROUTES.MAIN],
          routes: [{ key: 'main', name: ROUTES.MAIN }],
        },
        appLinking.config,
      ),
    ).toBe('/');

    expect(
      appLinking.getPathFromState?.(
        {
          stale: false,
          type: 'stack',
          key: 'root',
          index: 0,
          routeNames: [ROUTES.MAIN],
          routes: [
            {
              key: 'main',
              name: ROUTES.MAIN,
              state: {
                stale: false,
                type: 'tab',
                key: 'tabs',
                index: 1,
                routeNames: [ROUTES.HOME, ROUTES.TASKS, ROUTES.CHAT],
                routes: [
                  { key: 'home', name: ROUTES.HOME },
                  { key: 'tasks', name: ROUTES.TASKS },
                  { key: 'chat', name: ROUTES.CHAT },
                ],
              },
            },
          ],
        },
        appLinking.config,
      ),
    ).toBe('/tasks');

    expect(
      appLinking.getPathFromState?.(
        {
          stale: false,
          type: 'stack',
          key: 'root',
          index: 0,
          routeNames: [ROUTES.MAIN],
          routes: [
            {
              key: 'main',
              name: ROUTES.MAIN,
              state: {
                stale: false,
                type: 'tab',
                key: 'tabs',
                index: 2,
                routeNames: [ROUTES.HOME, ROUTES.TASKS, ROUTES.CHAT],
                routes: [
                  { key: 'home', name: ROUTES.HOME },
                  { key: 'tasks', name: ROUTES.TASKS },
                  { key: 'chat', name: ROUTES.CHAT },
                ],
              },
            },
          ],
        },
        appLinking.config,
      ),
    ).toBe('/chat');
  });
});
