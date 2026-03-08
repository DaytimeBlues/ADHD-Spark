import { AppState, AppStateStatus } from 'react-native';
import { LoggerService } from './LoggerService';
import { createOperationContext } from './OperationContext';

export interface LifecycleAwareService {
  name: string;
  start(): void;
  pause?(): void;
  resume?(): void;
  stop(): void;
}

class AppLifecycleServiceClass {
  private services = new Map<string, LifecycleAwareService>();
  private appStateSubscription: { remove(): void } | null = null;
  private webCleanupHandler: (() => void) | null = null;
  private lastState: AppStateStatus | null = null;

  register(service: LifecycleAwareService): void {
    this.services.set(service.name, service);
  }

  initialize(): void {
    if (this.appStateSubscription) {
      return;
    }

    this.lastState = AppState.currentState;
    this.startAll();

    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );

    if (
      typeof window !== 'undefined' &&
      typeof window.addEventListener === 'function' &&
      !this.webCleanupHandler
    ) {
      this.webCleanupHandler = () => {
        this.stopAll();
      };
      window.addEventListener('pagehide', this.webCleanupHandler);
      window.addEventListener('beforeunload', this.webCleanupHandler);
    }
  }

  shutdown(): void {
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;

    if (
      typeof window !== 'undefined' &&
      typeof window.removeEventListener === 'function' &&
      this.webCleanupHandler
    ) {
      window.removeEventListener('pagehide', this.webCleanupHandler);
      window.removeEventListener('beforeunload', this.webCleanupHandler);
      this.webCleanupHandler = null;
    }

    this.stopAll();
    this.lastState = null;
  }

  private handleAppStateChange = (nextState: AppStateStatus) => {
    if (nextState === this.lastState) {
      return;
    }

    if (nextState === 'active') {
      this.resumeAll();
    } else {
      this.pauseAll();
    }

    this.lastState = nextState;
  };

  private startAll(): void {
    const op = createOperationContext({ feature: 'app-lifecycle' });
    this.services.forEach((service) => {
      service.start();
      LoggerService.info({
        service: 'AppLifecycleService',
        operation: 'startAll',
        message: `Started ${service.name}`,
        ...op,
      });
    });
  }

  private pauseAll(): void {
    const op = createOperationContext({ feature: 'app-lifecycle' });
    this.services.forEach((service) => {
      service.pause?.();
      LoggerService.info({
        service: 'AppLifecycleService',
        operation: 'pauseAll',
        message: `Paused ${service.name}`,
        ...op,
      });
    });
  }

  private resumeAll(): void {
    const op = createOperationContext({ feature: 'app-lifecycle' });
    this.services.forEach((service) => {
      if (service.resume) {
        service.resume();
      } else {
        service.start();
      }
      LoggerService.info({
        service: 'AppLifecycleService',
        operation: 'resumeAll',
        message: `Resumed ${service.name}`,
        ...op,
      });
    });
  }

  private stopAll(): void {
    const op = createOperationContext({ feature: 'app-lifecycle' });
    this.services.forEach((service) => {
      service.stop();
      LoggerService.info({
        service: 'AppLifecycleService',
        operation: 'stopAll',
        message: `Stopped ${service.name}`,
        ...op,
      });
    });
  }
}

export const AppLifecycleService = new AppLifecycleServiceClass();
export default AppLifecycleService;
