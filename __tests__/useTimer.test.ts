import { renderHook, act, waitFor } from '@testing-library/react-native';
import useTimer from '../src/hooks/useTimer';
import { useTimerStore } from '../src/store/useTimerStore';
import { TimerService } from '../src/services/TimerService';

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
    completedAt: null,
  });
};

describe('useTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetTimerStore();
    TimerService.stop();
  });

  afterEach(() => {
    TimerService.stop();
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

  it('supports autoStart and completion state', async () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() =>
      useTimer({ initialTime: 1, autoStart: true, onComplete }),
    );

    // Wait for auto-start to complete
    await waitFor(() => {
      expect(result.current.isRunning).toBe(true);
    });

    // Start the TimerService to trigger ticks
    TimerService.start();

    // Advance timers to trigger completion
    act(() => {
      jest.advanceTimersByTime(1100);
    });

    // Wait for the completion to be processed
    await waitFor(() => {
      expect(result.current.timeLeft).toBe(0);
    });

    // The onComplete callback should have been called via the store's completedAt mechanism
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

    // Start the TimerService to trigger ticks
    TimerService.start();

    act(() => {
      jest.advanceTimersByTime(1100);
    });

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('resumes when start is called on an active paused timer', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 5 }));

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
  });

  it('uses resume path when paused mid-session', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 5 }));

    act(() => {
      result.current.start();
      TimerService.start();
      jest.advanceTimersByTime(1100);
    });

    const beforePause = result.current.timeLeft;

    act(() => {
      result.current.pause();
    });

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.timeLeft).toBe(beforePause);
  });

  it('registers and cleans up E2E timer controls for active timer', () => {
    const globalRecord = globalThis as unknown as Record<string, unknown>;
    globalRecord.__SPARK_E2E_TEST_MODE__ = true;

    const { result, unmount } = renderHook(() =>
      useTimer({ id: 'pomodoro', initialTime: 10 }),
    );

    act(() => {
      result.current.start();
    });

    const controls = globalRecord.__SPARK_E2E_TIMER_CONTROLS__ as
      | {
          complete: () => void;
          fastForward: (seconds: number) => void;
        }
      | undefined;

    expect(controls).toBeTruthy();

    act(() => {
      controls?.fastForward(3);
    });

    expect(result.current.timeLeft).toBe(7);

    act(() => {
      controls?.fastForward(0);
      controls?.fastForward(-4);
      controls?.fastForward(Number.NaN);
    });

    expect(result.current.timeLeft).toBe(7);

    act(() => {
      controls?.complete();
    });

    expect(result.current.timeLeft).toBe(0);
    expect(result.current.isRunning).toBe(false);

    unmount();
    expect(globalRecord.__SPARK_E2E_TIMER_CONTROLS__).toBeUndefined();
    delete globalRecord.__SPARK_E2E_TEST_MODE__;
  });

  it('does not set E2E controls when timer is not active', () => {
    const globalRecord = globalThis as unknown as Record<string, unknown>;
    globalRecord.__SPARK_E2E_TEST_MODE__ = true;
    useTimerStore.setState({ activeMode: 'ignite', isRunning: true });

    renderHook(() => useTimer({ id: 'pomodoro', initialTime: 10 }));

    expect(globalRecord.__SPARK_E2E_TIMER_CONTROLS__).toBeUndefined();
    delete globalRecord.__SPARK_E2E_TEST_MODE__;
  });
});
