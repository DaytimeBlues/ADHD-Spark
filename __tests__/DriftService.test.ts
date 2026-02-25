export {};

const mockAddEventListener = jest.fn();
const mockShowOverlay = jest.fn();
let mockIsVisible = false;

describe('DriftService', () => {
  let DriftService: typeof import('../src/services/DriftService').DriftService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    jest.clearAllMocks();
    mockIsVisible = false;

    mockAddEventListener.mockImplementation(
      (_event: string, callback: (state: string) => void) => {
        (
          mockAddEventListener as jest.Mock & {
            callback?: (state: string) => void;
          }
        ).callback = callback;
        return { remove: jest.fn() };
      },
    );

    jest.doMock('react-native', () => ({
      AppState: {
        addEventListener: mockAddEventListener,
      },
    }));

    jest.doMock('../src/store/useDriftStore', () => ({
      useDriftStore: {
        getState: jest.fn(() => ({
          isVisible: mockIsVisible,
          showOverlay: mockShowOverlay,
        })),
      },
    }));

    DriftService = require('../src/services/DriftService').DriftService;
  });

  afterEach(() => {
    DriftService.destroy();
    jest.useRealTimers();
  });

  it('starts drift checks on init', () => {
    DriftService.init();

    jest.advanceTimersByTime(60 * 60 * 1000);

    expect(mockShowOverlay).toHaveBeenCalled();
  });

  it('does not show overlay when already visible', () => {
    mockIsVisible = true;

    DriftService.triggerDriftCheck();

    expect(mockShowOverlay).not.toHaveBeenCalled();
  });

  it('stops checks when app goes inactive and resumes on active', () => {
    DriftService.init();
    const handler = (
      mockAddEventListener as jest.Mock & {
        callback?: (state: string) => void;
      }
    ).callback;

    handler?.('inactive');
    jest.advanceTimersByTime(60 * 60 * 1000);
    expect(mockShowOverlay).not.toHaveBeenCalled();

    handler?.('active');
    jest.advanceTimersByTime(60 * 60 * 1000);
    expect(mockShowOverlay).toHaveBeenCalledTimes(1);
  });

  it('removes app state subscription on destroy', () => {
    const remove = jest.fn();
    mockAddEventListener.mockReturnValueOnce({ remove });

    DriftService.init();
    DriftService.destroy();

    expect(remove).toHaveBeenCalled();
  });
});
