import { useTimerStore, TimerMode } from '../store/useTimerStore';
import { NotificationService } from './NotificationService';

/**
 * TimerService
 *
 * Manages a single global interval for the Pomodoro and other timers.
 * Handles side-effects (notifications) by listening to store state changes.
 */

class TimerServiceClass {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private tickMs = 1000;
  private lastIsRunning = false;
  private lastTargetEndTime: number | null = null;

  constructor() {
    this.checkE2EMode();
    this.initStoreListener();
  }

  private checkE2EMode() {
    const globalRecord =
      typeof globalThis === 'undefined'
        ? null
        : (globalThis as unknown as Record<string, unknown>);

    if (globalRecord?.__SPARK_E2E_TEST_MODE__ === true) {
      this.tickMs = 100;
    }
  }

  private initStoreListener() {
    // Subscribe to state changes to handle side-effects (notifications)
    // This removes the need for the store to know about NotificationService
    useTimerStore.subscribe((state) => {
      const { isRunning, targetEndTime, isWorking, activeMode } = state;

      const becameRunning = isRunning && !this.lastIsRunning;
      const targetChanged =
        isRunning && targetEndTime !== this.lastTargetEndTime;

      if ((becameRunning || targetChanged) && targetEndTime) {
        this.scheduleNotification(isWorking, activeMode, targetEndTime);
      } else if (!isRunning && this.lastIsRunning) {
        NotificationService.cancelTimerNotification();
      }

      this.lastIsRunning = isRunning;
      this.lastTargetEndTime = targetEndTime;
    });
  }

  private scheduleNotification(
    isWorking: boolean,
    mode: TimerMode,
    targetEndTime: number,
  ) {
    const title = isWorking ? 'Focus Session Complete' : 'Break Finished';
    const body =
      mode === 'pomodoro'
        ? 'Time to switch gears!'
        : 'Your timer has finished.';
    NotificationService.scheduleTimerCompletion(title, body, targetEndTime);
  }

  /**
   * Start the global timer interval if not already running
   */
  public start() {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      const state = useTimerStore.getState();
      if (state.isRunning) {
        state.tick();
      }
    }, this.tickMs);
  }

  /**
   * Stop the global timer interval
   */
  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Force update tick rate (useful for switching modes in tests)
   */
  public updateTickRate(ms: number) {
    this.tickMs = ms;
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }
}

export const TimerService = new TimerServiceClass();
export default TimerService;
