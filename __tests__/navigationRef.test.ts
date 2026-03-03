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

  it('returns false when navigation is not ready and route is invalid', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    mockIsReady.mockReturnValue(false);

    const result = handleOverlayIntent({ route: ROUTES.CALENDAR }); // Disallowed route

    expect(result).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('returns false when route is missing', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    mockIsReady.mockReturnValue(true);

    const result = handleOverlayIntent({});

    expect(result).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('returns false when route is disallowed', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    mockIsReady.mockReturnValue(true);

    const result = handleOverlayIntent({ route: ROUTES.CALENDAR });

    expect(result).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('queues valid intent when nav is not ready and returns true', () => {
    const { handleOverlayIntent } = loadNavigationRefModule();
    mockIsReady.mockReturnValue(false);

    const result = handleOverlayIntent({ route: ROUTES.FOCUS });

    expect(result).toBe(true); // Accepted but queued
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

describe('flushOverlayIntentQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('processes queued intents when nav becomes ready', () => {
    const { handleOverlayIntent, flushOverlayIntentQueue } =
      loadNavigationRefModule();

    // First, queue some intents when nav is not ready
    mockIsReady.mockReturnValue(false);
    handleOverlayIntent({ route: ROUTES.FOCUS });
    handleOverlayIntent({ route: ROUTES.POMODORO });
    handleOverlayIntent({ route: ROUTES.CALENDAR }); // Should be rejected (not queued)

    expect(mockNavigate).not.toHaveBeenCalled();

    // Now nav becomes ready
    mockIsReady.mockReturnValue(true);
    flushOverlayIntentQueue();

    // Only valid routes should be navigated
    expect(mockNavigate).toHaveBeenCalledTimes(2);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.FOCUS);
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.POMODORO);
  });

  it('clears the queue after processing', () => {
    const { handleOverlayIntent, flushOverlayIntentQueue } =
      loadNavigationRefModule();

    mockIsReady.mockReturnValue(false);
    handleOverlayIntent({ route: ROUTES.FOCUS });

    mockIsReady.mockReturnValue(true);
    flushOverlayIntentQueue();

    // Clear mock to check second flush
    jest.clearAllMocks();

    // Second flush should not navigate again
    flushOverlayIntentQueue();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles TASKS route with autoRecord in queue', () => {
    const { handleOverlayIntent, flushOverlayIntentQueue } =
      loadNavigationRefModule();

    mockIsReady.mockReturnValue(false);
    handleOverlayIntent({ route: ROUTES.TASKS, autoRecord: true });

    mockIsReady.mockReturnValue(true);
    flushOverlayIntentQueue();

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.TASKS, {
      autoRecord: true,
    });
  });

  it('does nothing when queue is empty', () => {
    const { flushOverlayIntentQueue } = loadNavigationRefModule();

    mockIsReady.mockReturnValue(true);
    flushOverlayIntentQueue();

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
