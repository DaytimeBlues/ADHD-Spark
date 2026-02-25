import { useTimerStore } from '../store/useTimerStore';

/**
 * TimerService
 *
 * Manages a single global interval for the Pomodoro and other timers.
 * This prevents interval duplication when multiple components use the useTimer hook.
 */

class TimerServiceClass {
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private tickMs = 1000;

    constructor() {
        this.checkE2EMode();
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
