const mockNavigate = jest.fn();
const mockIsReady = jest.fn();

import { ROUTES } from '../src/navigation/routes';

const loadNavigationRefModule = () => {
  jest.resetModules();
  jest.doMock('@react-navigation/native', () => ({
    createNavigationContainerRef: () => ({
      isReady: mockIsReady,
      navigate: mockNavigate,
    }),
  }));

  return require('../src/navigation/navigationRef') as typeof import('../src/navigation/navigationRef');
};

describe('handleOverlayIntent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsReady.mockReturnValue(true);
  });

  it('returns false when navigation is not ready', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    mockIsReady.mockReturnValue(false);

    const result = handleOverlayIntent({ route: ROUTES.ANCHOR });

    expect(result).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('returns false when route is missing or disallowed', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    const missingRouteResult = handleOverlayIntent({});
    const disallowedRouteResult = handleOverlayIntent({
      route: ROUTES.CALENDAR,
    });

    expect(missingRouteResult).toBe(false);
    expect(disallowedRouteResult).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to Tasks with autoRecord params and returns true', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    const result = handleOverlayIntent({
      route: ROUTES.TASKS,
      autoRecord: true,
    });

    expect(result).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TASKS, {
      autoRecord: true,
    });
  });

  it('navigates to allowed non-Tasks route and returns true', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    const result = handleOverlayIntent({ route: ROUTES.CBT_GUIDE });

    expect(result).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CBT_GUIDE);
  });

  it('normalizes legacy "Ignite" route to ROUTES.FOCUS', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    const result = handleOverlayIntent({ route: 'Ignite' });

    expect(result).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.FOCUS);
  });

  it('normalizes legacy "BrainDump" route to ROUTES.TASKS', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    const result = handleOverlayIntent({
      route: 'BrainDump',
      autoRecord: true,
    });

    expect(result).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TASKS, {
      autoRecord: true,
    });
  });

  it('navigates to ROUTES.FOCUS when requested directly', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    const result = handleOverlayIntent({ route: ROUTES.FOCUS });

    expect(result).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.FOCUS);
  });

  it('navigates to ROUTES.POMODORO when requested directly', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    const result = handleOverlayIntent({ route: ROUTES.POMODORO });

    expect(result).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.POMODORO);
  });

  it('normalizes legacy "FogCutter" route to ROUTES.FOG_CUTTER', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    const result = handleOverlayIntent({ route: 'FogCutter' });

    expect(result).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.FOG_CUTTER);
  });

  it('normalizes legacy "CheckIn" route to ROUTES.CHECK_IN', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    const result = handleOverlayIntent({ route: 'CheckIn' });

    expect(result).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CHECK_IN);
  });
});
