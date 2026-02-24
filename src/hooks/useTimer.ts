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
        // Set isRunning: false so the completion useEffect does NOT double-fire onComplete
        useTimerStore.setState({ remainingSeconds: 0, isRunning: false, targetEndTime: null });
        // Fire onComplete synchronously so the phase transition happens immediately
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
    const currentState = useTimerStore.getState();
    const isThisActive = currentState.activeMode === id;

    if (isThisActive && currentState.remainingSeconds > 0 && !currentState.isRunning) {
      if (currentState.remainingSeconds === currentState.durationSeconds) {
        // It's a fresh start of a phase (e.g. from completePhase setting nextDurationSeconds)
        currentState.start(id as TimerMode, currentState.durationSeconds, currentState.isWorking);
      } else {
        // It's a resume from a paused state
        currentState.resume();
      }
    } else {
      // It's a first time initialization, restart from 0, or overriding
      currentState.start(id as TimerMode, initialTime, id === 'pomodoro' ? true : undefined);
    }
  }, [id, initialTime]);

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
