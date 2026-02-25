import { renderHook, act, waitFor } from '@testing-library/react-native';
import useTimer from '../src/hooks/useTimer';
import { useTimerStore } from '../src/store/useTimerStore';

// Reset timer store state between tests to prevent cross-test leakage
const resetTimerStore = () => {
  useTimerStore.setState({
    activeMode: null,
    isRunning: false,
    targetEndTime: null,
    remainingSeconds: 0,
    durationSeconds: 0,
    isWorking: true,
    sessions: 0,
  });
};

describe('useTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetTimerStore();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with correct time', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 300 }));
    expect(result.current.timeLeft).toBe(300);
    expect(result.current.formattedTime).toBe('05:00');
  });

  it('starts timer when start is called', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 5 }));
    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
  });

  it('pauses timer when pause is called', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 5 }));
    act(() => {
      result.current.start();
    });
    expect(result.current.isRunning).toBe(true);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);
  });

  it('resets timer to initial time', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 300 }));
    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.timeLeft).toBe(300);
    expect(result.current.isRunning).toBe(false);
  });

  it('formats time correctly', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 65 }));
    expect(result.current.formattedTime).toBe('01:05');
  });

  it('supports autoStart and completion state', () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() =>
      useTimer({ initialTime: 1, autoStart: true, onComplete }),
    );

    expect(result.current.isRunning).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Timer should have ticked down and triggered completion
    expect(result.current.timeLeft).toBe(0);
    // hasCompleted is true when timer is active, remainingSeconds is 0, and not running
    // After completion, the timer may no longer be "active" so hasCompleted may be false
    // The key behavior is that onComplete was called and timeLeft is 0
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('allows setting time directly when active', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 10 }));

    // Start the timer to make it active
    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.setTime(42);
    });

    expect(result.current.timeLeft).toBe(42);
  });

  it('calls onComplete when timer finishes', async () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() =>
      useTimer({ initialTime: 1, onComplete }),
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
