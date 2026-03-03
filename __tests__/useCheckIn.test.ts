import { renderHook, act } from '@testing-library/react-native';
import { useCheckIn } from '../src/hooks/useCheckIn';
import { CheckInService } from '../src/services/CheckInService';

// Mock CheckInService
jest.mock('../src/services/CheckInService', () => ({
  CheckInService: {
    isPending: jest.fn().mockReturnValue(false),
    subscribe: jest.fn(),
    setPending: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  },
}));

describe('useCheckIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with CheckInService pending status', () => {
    (CheckInService.isPending as jest.Mock).mockReturnValue(true);

    const { result } = renderHook(() => useCheckIn());

    expect(CheckInService.isPending).toHaveBeenCalled();
    expect(result.current.isPending).toBe(true);
  });

  it('should subscribe to CheckInService on mount', () => {
    renderHook(() => useCheckIn());

    expect(CheckInService.subscribe).toHaveBeenCalled();
  });

  it('should update isPending when service notifies', () => {
    let subscriberCallback: ((pending: boolean) => void) | null = null;

    (CheckInService.subscribe as jest.Mock).mockImplementation(
      (cb: (pending: boolean) => void) => {
        subscriberCallback = cb;
        cb(false); // Initial call
        return jest.fn();
      },
    );

    const { result } = renderHook(() => useCheckIn());

    expect(result.current.isPending).toBe(false);

    // Simulate service update
    act(() => {
      subscriberCallback?.(true);
    });

    expect(result.current.isPending).toBe(true);
  });

  it('should unsubscribe from CheckInService on unmount', () => {
    const unsubscribe = jest.fn();
    (CheckInService.subscribe as jest.Mock).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useCheckIn());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('should provide setPending function', () => {
    const { result } = renderHook(() => useCheckIn());

    expect(typeof result.current.setPending).toBe('function');
  });

  it('should provide start function', () => {
    const { result } = renderHook(() => useCheckIn());

    expect(typeof result.current.start).toBe('function');
  });

  it('should provide stop function', () => {
    const { result } = renderHook(() => useCheckIn());

    expect(typeof result.current.stop).toBe('function');
  });

  it('should call CheckInService.setPending when setPending is called', () => {
    const { result } = renderHook(() => useCheckIn());

    result.current.setPending(true);

    expect(CheckInService.setPending).toHaveBeenCalledWith(true);
  });

  it('should call CheckInService.start when start is called', () => {
    const { result } = renderHook(() => useCheckIn());

    result.current.start(5000);

    expect(CheckInService.start).toHaveBeenCalledWith(5000);
  });

  it('should call CheckInService.stop when stop is called', () => {
    const { result } = renderHook(() => useCheckIn());

    result.current.stop();

    expect(CheckInService.stop).toHaveBeenCalled();
  });
});
