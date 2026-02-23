import { AppState, AppStateStatus } from 'react-native';
import { useDriftStore } from '../store/useDriftStore';

class DriftServiceClass {
  private intervalId: NodeJS.Timeout | null = null;
  private DRIFT_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes
  // Or for testing, use a shorter interval like 1 minute: 60 * 1000

  constructor() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  public init() {
    this.startInterval();
  }

  public setIntervalTime(ms: number) {
    this.DRIFT_INTERVAL_MS = ms;
    this.stopInterval();
    this.startInterval();
  }

  private startInterval() {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.triggerDriftCheck();
    }, this.DRIFT_INTERVAL_MS);
  }

  private stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public triggerDriftCheck() {
    // Only show if it's currently hidden to avoid React state bouncing
    if (!useDriftStore.getState().isVisible) {
      useDriftStore.getState().showOverlay();
    }
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // Calculate elapsed time from background to see if we missed an interval
      // For now, restarting the interval
      this.startInterval();
    } else {
      // Depending on OS limits, standard setInterval pauses.
      // Phase 6 mentions background tasks or alarms. Here we lean on foreground for now,
      // but the architecture holds space for AlarmManager hooks.
      this.stopInterval();
    }
  };
}

export const DriftService = new DriftServiceClass();
