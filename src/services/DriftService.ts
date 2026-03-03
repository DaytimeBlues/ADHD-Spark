import { AppState } from 'react-native';
import { useDriftStore } from '../store/useDriftStore';

class DriftServiceClass {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private appStateSubscription: { remove(): void } | null = null;
  private DRIFT_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes

  public init() {
    if (this.appStateSubscription) {
      return;
    }

    this.appStateSubscription = AppState.addEventListener(
      'change',
      (nextState) => {
        if (nextState === 'active') {
          this.startCheck();
        } else {
          this.stopCheck();
        }
      },
    );

    this.startCheck();
  }

  public destroy() {
    this.stopCheck();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  public setIntervalTime(ms: number) {
    this.DRIFT_INTERVAL_MS = ms;
    this.stopCheck();
    this.startCheck();
  }

  private startCheck() {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.triggerDriftCheck();
    }, this.DRIFT_INTERVAL_MS);
  }

  private stopCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public triggerDriftCheck() {
    if (!useDriftStore.getState().isVisible) {
      useDriftStore.getState().showOverlay();
    }
  }
}

export const DriftService = new DriftServiceClass();
export default DriftService;
