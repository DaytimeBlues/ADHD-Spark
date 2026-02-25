import { useEffect, useCallback, useRef } from 'react';
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
  const hasAutoStartedRef = useRef(false);

  // We are "active" if the global store's activeMode matches this instance's id
  const isActive = store.activeMode === id;
  const isRunning = isActive && store.isRunning;
  const timeLeft = isActive ? store.remainingSeconds : initialTime;
  const hasCompleted =
    isActive && store.remainingSeconds <= 0 && !store.isRunning;

  // No internal interval here - managed by global TimerService
  useEffect(() => {
    // The service is started in App.tsx, but we can ensure it's running here too if needed
    // However, we want to avoid every hook instance trying to start/stop the service
    // if that logic becomes more complex. For now, it's safe to just let App.tsx handle it.
  }, []);

  // Handle completion from store's completion signal (single source of truth)
  useEffect(() => {
    if (isActive && store.completedAt !== null) {
      onComplete?.();
      // Reset completion signal to prevent duplicate triggers
      useTimerStore.setState({ completedAt: null });
    }
  }, [isActive, store.completedAt, onComplete]);

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
        // Use the same store path as normal completion - tick() handles the transition
        const state = useTimerStore.getState();
        if (state.isRunning) {
          // Force remainingSeconds to 0 and let tick() handle the completion transition
          useTimerStore.setState({
            remainingSeconds: 0,
            targetEndTime: Date.now(), // Force immediate expiration
          });
          // Trigger tick to process completion
          state.tick();
        }
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
  }, [isActive]);

  // Auto-start logic - runs once when component mounts and conditions are met
  useEffect(() => {
    if (
      autoStart &&
      !hasAutoStartedRef.current &&
      !store.isRunning &&
      store.activeMode === null
    ) {
      hasAutoStartedRef.current = true;
      store.start(id as TimerMode, initialTime);
    }
  }, [autoStart, id, initialTime, store.isRunning, store.activeMode, store]);

  const start = useCallback(() => {
    const currentState = useTimerStore.getState();
    const isThisActive = currentState.activeMode === id;

    if (
      isThisActive &&
      currentState.remainingSeconds > 0 &&
      !currentState.isRunning
    ) {
      if (currentState.remainingSeconds === currentState.durationSeconds) {
        // It's a fresh start of a phase (e.g. from completePhase setting nextDurationSeconds)
        currentState.start(
          id as TimerMode,
          currentState.durationSeconds,
          currentState.isWorking,
        );
      } else {
        // It's a resume from a paused state
        currentState.resume();
      }
    } else {
      // It's a first time initialization, restart from 0, or overriding
      currentState.start(
        id as TimerMode,
        initialTime,
        id === 'pomodoro' ? true : undefined,
      );
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
