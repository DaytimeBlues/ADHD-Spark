jest.mock('../src/utils/PlatformUtils', () => ({
  isWeb: true,
  isAndroid: false,
  isIOS: false,
}));

import { appLinking } from '../src/navigation/linking';
import { ROUTES } from '../src/navigation/routes';

describe('web linking config', () => {
  it('resolves Phase 1 stack routes from the base path', () => {
    const checkInState = appLinking.getStateFromPath?.(
      '/ADHD-CADDI/check-in',
      appLinking.config,
    );
    const cbtGuideState = appLinking.getStateFromPath?.(
      '/ADHD-CADDI/cbt-guide',
      appLinking.config,
    );
    const diagnosticsState = appLinking.getStateFromPath?.(
      '/ADHD-CADDI/diagnostics',
      appLinking.config,
    );

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

  it('builds web urls for the registered Phase 1 stack routes', () => {
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
    ).toBe('/ADHD-CADDI/check-in');

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
    ).toBe('/ADHD-CADDI/cbt-guide');

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
    ).toBe('/ADHD-CADDI/diagnostics');
  });
});
