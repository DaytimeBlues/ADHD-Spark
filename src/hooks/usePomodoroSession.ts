import { useCallback, useEffect, useRef } from 'react';
import useTimer from './useTimer';
import SoundService from '../services/SoundService';
import { useTimerStore } from '../store/useTimerStore';

const FOCUS_DURATION_SECONDS = 25 * 60;
const BREAK_DURATION_SECONDS = 5 * 60;

const handlePomodoroPhaseComplete = (
  isWorkingRef: { current: boolean },
  start: () => void,
) => {
  if (isWorkingRef.current) {
    useTimerStore.getState().incrementSession();
    useTimerStore.getState().completePhase(BREAK_DURATION_SECONDS, false);
    isWorkingRef.current = false;
    SoundService.playCompletionSound();
  } else {
    useTimerStore.getState().completePhase(FOCUS_DURATION_SECONDS, true);
    isWorkingRef.current = true;
    SoundService.playNotificationSound();
  }

  setTimeout(() => start(), 0);
};

export interface PomodoroSessionState {
  timeLeft: number;
  isRunning: boolean;
  formattedTime: string;
  isWorking: boolean;
  sessions: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  getTotalDuration: () => number;
}

export const usePomodoroSession = (): PomodoroSessionState => {
  const store = useTimerStore();
  const isWorking = store.activeMode === 'pomodoro' ? store.isWorking : true;
  const sessions = store.activeMode === 'pomodoro' ? store.sessions : 0;
  const isWorkingRef = useRef(isWorking);

  const { timeLeft, isRunning, formattedTime, start, pause, reset } = useTimer({
    id: 'pomodoro',
    initialTime: FOCUS_DURATION_SECONDS,
    onComplete: () => handlePomodoroPhaseComplete(isWorkingRef, start),
  });

  useEffect(() => {
    isWorkingRef.current = isWorking;
  }, [isWorking]);

  const handleStart = useCallback(() => {
    start();
  }, [start]);

  const handlePause = useCallback(() => {
    pause();
  }, [pause]);

  const handleReset = useCallback(() => {
    reset();
    useTimerStore.getState().completePhase(FOCUS_DURATION_SECONDS, true);
    isWorkingRef.current = true;
  }, [reset]);

  const getTotalDuration = useCallback(() => {
    return isWorking ? FOCUS_DURATION_SECONDS : BREAK_DURATION_SECONDS;
  }, [isWorking]);

  return {
    timeLeft,
    isRunning,
    formattedTime,
    isWorking,
    sessions,
    start: handleStart,
    pause: handlePause,
    reset: handleReset,
    getTotalDuration,
  };
};
