export type CheckInSubscriber = (isPending: boolean) => void;

class CheckInServiceClass {
    private timer: ReturnType<typeof setInterval> | null = null;
    private isEnabled: boolean = true;
    private pending: boolean = false;
    private subscribers: Set<CheckInSubscriber> = new Set();

    // Defaults to 30 minutes. Settable for testing.
    private intervalMs = 30 * 60 * 1000;

    start(intervalMs?: number) {
        if (intervalMs) this.intervalMs = intervalMs;
        if (!this.isEnabled) return;
        this.stop();
        this.timer = setInterval(() => {
            this.setPending(true);
        }, this.intervalMs);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    setPending(status: boolean) {
        if (this.pending !== status) {
            this.pending = status;
            this.notifySubscribers();
        }
    }

    isPending() {
        return this.pending;
    }

    subscribe(callback: CheckInSubscriber) {
        this.subscribers.add(callback);
        callback(this.pending);
        return () => {
            this.subscribers.delete(callback);
        };
    }

    private notifySubscribers() {
        this.subscribers.forEach(cb => cb(this.pending));
    }
}

export const CheckInService = new CheckInServiceClass();
