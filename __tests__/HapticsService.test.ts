const mockVibrate = jest.fn();

const loadHapticsService = (platformOS: 'android' | 'web') => {
  jest.resetModules();
  jest.doMock('react-native', () => ({
    Platform: {
      OS: platformOS,
    },
    Vibration: {
      vibrate: mockVibrate,
    },
  }));

  return require('../src/services/HapticsService')
    .default as typeof import('../src/services/HapticsService').default;
};

describe('HapticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('vibrates on tap with default light duration', () => {
    const HapticsService = loadHapticsService('android');

    HapticsService.tap();

    expect(mockVibrate).toHaveBeenCalledWith(10);
  });

  it('respects tap throttle by key', () => {
    const HapticsService = loadHapticsService('android');
    jest.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(1050);

    HapticsService.tap({ key: 'button' });
    HapticsService.tap({ key: 'button' });

    expect(mockVibrate).toHaveBeenCalledTimes(1);
    (Date.now as jest.Mock).mockRestore();
  });

  it('supports medium and heavy tap helpers', () => {
    const HapticsService = loadHapticsService('android');

    HapticsService.mediumTap({ key: 'm1', minIntervalMs: 0 });
    HapticsService.heavyTap({ key: 'h1', minIntervalMs: 0 });

    expect(mockVibrate).toHaveBeenCalledWith(20);
    expect(mockVibrate).toHaveBeenCalledWith(40);
  });

  it('throttles selection feedback', () => {
    const HapticsService = loadHapticsService('android');
    jest.spyOn(Date, 'now').mockReturnValueOnce(2000).mockReturnValueOnce(2030);

    HapticsService.selection({ key: 'wheel' });
    HapticsService.selection({ key: 'wheel' });

    expect(mockVibrate).toHaveBeenCalledTimes(1);
    expect(mockVibrate).toHaveBeenCalledWith(5);
    (Date.now as jest.Mock).mockRestore();
  });

  it('does nothing on web platform', () => {
    const HapticsService = loadHapticsService('web');

    HapticsService.warning();
    HapticsService.success();
    HapticsService.error();
    HapticsService.cancel();

    expect(mockVibrate).not.toHaveBeenCalled();
  });
});
