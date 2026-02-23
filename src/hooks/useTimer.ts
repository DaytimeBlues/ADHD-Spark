import { useEffect, useCallback } from 'react';
import { formatTime } from '../utils/helpers';
import { useTimerStore, TimerMode } from '../store/useTimerStore';

interface UseTimerOptions {
  id?: TimerMode | string;
  initialTime: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

const getGlobalRecord = (): Record<string, unknown> | null => {
  if (typeof globalThis === 'undefined') {
    return null;
  }
  return globalThis as unknown as Record<string, unknown>;
};

const isE2ETestMode = (): boolean => {
  const globalRecord = getGlobalRecord();
  return globalRecord?.__SPARK_E2E_TEST_MODE__ === true;
};

const useTimer = ({
  id = 'pomodoro',
  initialTime,
  onComplete,
  autoStart = false,
}: UseTimerOptions) => {
  const store = useTimerStore();
  const tickMs = isE2ETestMode() ? 100 : 1000;

  // We are "active" if the global store's activeMode matches this instance's id
  const isActive = store.activeMode === id;
  const isRunning = isActive && store.isRunning;
  const timeLeft = isActive ? store.remainingSeconds : initialTime;
  const hasCompleted =
    isActive && store.remainingSeconds <= 0 && !store.isRunning;

  // Global interval tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        useTimerStore.getState().tick();
      }, tickMs);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, tickMs]);

  // Handle completion when time hits 0
  useEffect(() => {
    if (isActive && isRunning && store.remainingSeconds === 0) {
      onComplete?.();
    }
  }, [isActive, isRunning, store.remainingSeconds, onComplete]);

  // Handle E2E controls
  useEffect(() => {
    if (!isE2ETestMode() || !isActive) {
      return;
    }

    const globalRecord = getGlobalRecord();
    if (!globalRecord) {
      return;
    }

    globalRecord.__SPARK_E2E_TIMER_CONTROLS__ = {
      complete: () => {
        useTimerStore.getState().tick(); // sync manual overrides if needed
        // Force complete for E2E
        useTimerStore.setState({ remainingSeconds: 0, isRunning: false });
        onComplete?.();
      },
      fastForward: (seconds: number) => {
        if (!Number.isFinite(seconds) || seconds <= 0) {
          return;
        }
        const current = useTimerStore.getState().remainingSeconds;
        useTimerStore.setState({
          remainingSeconds: Math.max(0, current - Math.floor(seconds)),
        });
      },
    };

    return () => {
      if (globalRecord.__SPARK_E2E_TIMER_CONTROLS__) {
        delete globalRecord.__SPARK_E2E_TIMER_CONTROLS__;
      }
    };
  }, [isActive, onComplete]);

  // Auto-start logic
  useEffect(() => {
    if (autoStart && !isRunning && store.activeMode === null) {
      store.start(id as TimerMode, initialTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(() => {
    store.start(id as TimerMode, initialTime);
  }, [id, initialTime, store]);

  const pause = useCallback(() => {
    if (isActive) {
      store.pause();
    }
  }, [isActive, store]);

  const reset = useCallback(() => {
    store.reset();
  }, [store]);

  const setTime = useCallback(
    (time: number) => {
      if (isActive) {
        useTimerStore.setState({
          remainingSeconds: time,
          durationSeconds: time,
        });
      }
    },
    [isActive],
  );

  return {
    timeLeft,
    isRunning,
    hasCompleted,
    formattedTime: formatTime(timeLeft),
    start,
    pause,
    reset,
    setTime,
  };
};

export default useTimer;
