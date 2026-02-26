import { AppState, AppStateStatus } from 'react-native';
import StorageService from './StorageService';

type AuthStateSubscriber = (isAuthenticated: boolean) => void;

type LocalAuthenticationLike = {
  authenticateAsync: (options: {
    promptMessage?: string;
    fallbackLabel?: string;
    disableDeviceFallback?: boolean;
  }) => Promise<{ success: boolean }>;
  hasHardwareAsync: () => Promise<boolean>;
  isEnrolledAsync: () => Promise<boolean>;
};

let localAuthenticationModule: LocalAuthenticationLike | null | undefined;

const getLocalAuthentication = (): LocalAuthenticationLike | null => {
  if (localAuthenticationModule !== undefined) {
    return localAuthenticationModule;
  }

  try {
    localAuthenticationModule = require('expo-local-authentication') as LocalAuthenticationLike;
  } catch (error) {
    console.warn(
      'BiometricService: expo-local-authentication is unavailable; biometric auth is disabled.',
      error,
    );
    localAuthenticationModule = null;
  }

  return localAuthenticationModule;
};

class BiometricServiceClass {
  private isAuthenticated = false;
  private isSecured = false;
  private subscribers: Set<AuthStateSubscriber> = new Set();
  private backgroundedAt: number | null = null;
  // Threshold in ms to require re-auth (e.g. 10 minutes)
  private readonly REAUTH_THRESHOLD_MS = 10 * 60 * 1000;
  private appStateSubscription: { remove(): void } | null = null;

  constructor() {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange,
    );
  }

  public destroy() {
    this.appStateSubscription?.remove();
    this.appStateSubscription = null;
  }

  public async init() {
    const isSecured =
      await StorageService.getJSON<boolean>('isBiometricSecured');
    this.isSecured = !!isSecured && Boolean(getLocalAuthentication());
    // Assume initialized app is authenticated until otherwise
    this.isAuthenticated = true;
    this.notifySubscribers();
  }

  public async toggleSecurity(enabled: boolean): Promise<boolean> {
    const localAuthentication = getLocalAuthentication();

    if (enabled) {
      if (!localAuthentication) {
        return false;
      }

      const hasHardware = await localAuthentication.hasHardwareAsync();
      const isEnrolled = await localAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return false;
      }
    }

    this.isSecured = enabled && Boolean(localAuthentication);
    await StorageService.setJSON('isBiometricSecured', this.isSecured);
    return true;
  }

  public getIsSecured() {
    return this.isSecured;
  }

  public async authenticate(
    promptMessage = 'Unlock Spark ADHD',
  ): Promise<boolean> {
    if (!this.isSecured) {
      return true;
    }

    const localAuthentication = getLocalAuthentication();
    if (!localAuthentication) {
      this.isSecured = false;
      this.notifySubscribers();
      return true;
    }

    try {
      const result = await localAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        this.isAuthenticated = true;
        this.notifySubscribers();
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Biometric auth failed', e);
      return false;
    }
  }

  private handleAppStateChange = (nextState: AppStateStatus) => {
    if (!this.isSecured) {
      return;
    }

    if (nextState === 'background' || nextState === 'inactive') {
      if (!this.backgroundedAt) {
        this.backgroundedAt = Date.now();
      }
    } else if (nextState === 'active') {
      if (
        this.backgroundedAt &&
        Date.now() - this.backgroundedAt > this.REAUTH_THRESHOLD_MS
      ) {
        this.isAuthenticated = false;
        this.notifySubscribers();
        // Fire prompt immediately
        this.authenticate();
      }
      this.backgroundedAt = null;
    }
  };

  public subscribe(callback: AuthStateSubscriber) {
    this.subscribers.add(callback);
    callback(this.isAuthenticated);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach((sub) => sub(this.isAuthenticated));
  }
}

export const BiometricService = new BiometricServiceClass();
