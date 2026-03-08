jest.mock('../src/services/LoggerService', () => ({
  LoggerService: {
    info: jest.fn(),
  },
}));

describe('AppLifecycleService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.dontMock('react-native');
  });

  it('starts, pauses, resumes, and stops registered services', () => {
    const listenerRef: { current?: (state: 'active' | 'background') => void } =
      {};

    jest.doMock('react-native', () => ({
      AppState: {
        currentState: 'active',
        addEventListener: jest.fn(
          (
            _event: 'change',
            listener: (state: 'active' | 'background') => void,
          ) => {
            listenerRef.current = listener;
            return { remove: jest.fn() };
          },
        ),
      },
    }));

    const { AppLifecycleService } =
      require('../src/services/AppLifecycleService') as typeof import('../src/services/AppLifecycleService');

    const service = {
      name: 'test-service',
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      stop: jest.fn(),
    };

    AppLifecycleService.register(service);
    AppLifecycleService.initialize();
    listenerRef.current?.('background');
    listenerRef.current?.('active');
    AppLifecycleService.shutdown();

    expect(service.start).toHaveBeenCalledTimes(1);
    expect(service.pause).toHaveBeenCalledTimes(1);
    expect(service.resume).toHaveBeenCalledTimes(1);
    expect(service.stop).toHaveBeenCalledTimes(1);
  });

  it('does not start services while backgrounded and clears registrations on shutdown', () => {
    const appState = {
      currentState: 'background' as 'active' | 'background',
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    };

    jest.doMock('react-native', () => ({
      AppState: appState,
    }));

    const { AppLifecycleService } =
      require('../src/services/AppLifecycleService') as typeof import('../src/services/AppLifecycleService');

    const service = {
      name: 'stale-service',
      start: jest.fn(),
      pause: jest.fn(),
      stop: jest.fn(),
    };

    AppLifecycleService.register(service);
    AppLifecycleService.initialize();

    expect(service.start).not.toHaveBeenCalled();

    AppLifecycleService.shutdown();

    expect(service.stop).toHaveBeenCalledTimes(1);

    appState.currentState = 'active';
    AppLifecycleService.initialize();

    expect(service.start).not.toHaveBeenCalled();
  });
});
