import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TimerMode = 'pomodoro' | 'ignite' | 'fog_cutter' | null;

interface TimerState {
  activeMode: TimerMode;
  isRunning: boolean;
  targetEndTime: number | null; // Absolute Unix timestamp ms when timer should end
  remainingSeconds: number;
  durationSeconds: number;
  isWorking: boolean; // Relevant mostly for Pomodoro
  sessions: number;

  start: (
    mode: TimerMode,
    durationSeconds: number,
    isWorking?: boolean,
  ) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  tick: () => void;
  completePhase: (nextDurationSeconds: number, nextIsWorking: boolean) => void;
  incrementSession: () => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      activeMode: null,
      isRunning: false,
      targetEndTime: null,
      remainingSeconds: 0,
      durationSeconds: 0,
      isWorking: true,
      sessions: 0,

      start: (mode, durationSeconds, isWorking = true) => {
        set({
          activeMode: mode,
          isRunning: true,
          durationSeconds,
          remainingSeconds: durationSeconds,
          targetEndTime: Date.now() + durationSeconds * 1000,
          isWorking,
        });
      },

      pause: () => {
        const state = get();
        if (!state.isRunning) {
          return;
        }
        set({
          isRunning: false,
          targetEndTime: null,
          // remainingSeconds is preserved from the last tick
        });
      },

      resume: () => {
        const state = get();
        if (state.isRunning || state.remainingSeconds <= 0) {
          return;
        }
        set({
          isRunning: true,
          targetEndTime: Date.now() + state.remainingSeconds * 1000,
        });
      },

      reset: () => {
        const state = get();
        set({
          isRunning: false,
          remainingSeconds: state.durationSeconds,
          targetEndTime: null,
        });
      },

      tick: () => {
        const state = get();
        if (!state.isRunning || !state.targetEndTime) {
          return;
        }

        const now = Date.now();
        const rawRemaining = Math.max(
          0,
          Math.ceil((state.targetEndTime - now) / 1000),
        );

        if (rawRemaining !== state.remainingSeconds) {
          set({ remainingSeconds: rawRemaining });
        }

        // We do NOT auto-complete here to allow the UI layer (which has sound/haptics/nav)
        // to handle the actual completion event via `completePhase`. The UI effectively checks
        // if `remainingSeconds === 0` and then fires `completePhase`.
      },

      completePhase: (nextDurationSeconds, nextIsWorking) => {
        set({
          isRunning: false,
          targetEndTime: null,
          remainingSeconds: nextDurationSeconds,
          durationSeconds: nextDurationSeconds,
          isWorking: nextIsWorking,
        });
      },

      incrementSession: () => {
        set((state) => ({ sessions: state.sessions + 1 }));
      },
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential state, not necessarily the exact second boundary
      partialize: (state) => ({
        activeMode: state.activeMode,
        isRunning: state.isRunning,
        targetEndTime: state.targetEndTime,
        remainingSeconds: state.remainingSeconds,
        durationSeconds: state.durationSeconds,
        isWorking: state.isWorking,
        sessions: state.sessions,
      }),
    },
  ),
);
