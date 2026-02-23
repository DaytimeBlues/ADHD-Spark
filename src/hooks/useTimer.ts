import { useState, useEffect, useCallback } from 'react';
import { formatTime } from '../utils/helpers';

interface UseTimerOptions {
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
  initialTime,
  onComplete,
  autoStart = false,
}: UseTimerOptions) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [hasCompleted, setHasCompleted] = useState(false);
  const tickMs = isE2ETestMode() ? 100 : 1000;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasCompleted(true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, tickMs);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, onComplete, tickMs, timeLeft]);

  useEffect(() => {
    if (!isE2ETestMode()) {
      return;
    }

    const globalRecord = getGlobalRecord();
    if (!globalRecord) {
      return;
    }

    globalRecord.__SPARK_E2E_TIMER_CONTROLS__ = {
      complete: () => {
        setTimeLeft(0);
        setIsRunning(false);
        setHasCompleted(true);
        onComplete?.();
      },
      fastForward: (seconds: number) => {
        if (!Number.isFinite(seconds) || seconds <= 0) {
          return;
        }
        setTimeLeft((prev) => Math.max(0, prev - Math.floor(seconds)));
      },
    };

    return () => {
      if (globalRecord.__SPARK_E2E_TIMER_CONTROLS__) {
        delete globalRecord.__SPARK_E2E_TIMER_CONTROLS__;
      }
    };
  }, [onComplete]);

  const start = useCallback(() => {
    setIsRunning(true);
    setHasCompleted(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTimeLeft(initialTime);
    setIsRunning(false);
    setHasCompleted(false);
  }, [initialTime]);

  const setTime = useCallback((time: number) => {
    setTimeLeft(time);
  }, []);

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
