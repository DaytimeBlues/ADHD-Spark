import React, {useState, useEffect, useCallback} from 'react';

interface UseTimerOptions {
  initialTime: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

const useTimer = ({initialTime, onComplete, autoStart = false}: UseTimerOptions) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasCompleted(true);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, onComplete]);

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

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
