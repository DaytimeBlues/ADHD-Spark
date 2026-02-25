import { renderHook, act } from '@testing-library/react-native';
import { useUnreviewedCount } from '../src/hooks/useUnreviewedCount';
import CaptureService from '../src/services/CaptureService';

// Mock CaptureService
jest.mock('../src/services/CaptureService', () => ({
  __esModule: true,
  default: {
    getUnreviewedCount: jest.fn().mockReturnValue(0),
    subscribe: jest.fn(),
  },
}));

describe('useUnreviewedCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with CaptureService count', () => {
    (CaptureService.getUnreviewedCount as jest.Mock).mockReturnValue(5);

    const { result } = renderHook(() => useUnreviewedCount());

    expect(CaptureService.getUnreviewedCount).toHaveBeenCalled();
    expect(result.current).toBe(5);
  });

  it('should subscribe to CaptureService on mount', () => {
    renderHook(() => useUnreviewedCount());

    expect(CaptureService.subscribe).toHaveBeenCalled();
  });

  it('should update count when service notifies', () => {
    let subscriberCallback: ((count: number) => void) | null = null;

    (CaptureService.getUnreviewedCount as jest.Mock).mockReturnValue(0);
    (CaptureService.subscribe as jest.Mock).mockImplementation(
      (cb: (count: number) => void) => {
        subscriberCallback = cb;
        cb(0); // Initial call
        return jest.fn();
      },
    );

    const { result } = renderHook(() => useUnreviewedCount());

    expect(result.current).toBe(0);

    // Simulate service update
    act(() => {
      subscriberCallback?.(3);
    });

    expect(result.current).toBe(3);
  });

  it('should unsubscribe from CaptureService on unmount', () => {
    const unsubscribe = jest.fn();
    (CaptureService.subscribe as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useUnreviewedCount());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
