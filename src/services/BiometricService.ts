import * as LocalAuthentication from 'expo-local-authentication';
import { AppState, AppStateStatus } from 'react-native';
import StorageService from './StorageService';

type AuthStateSubscriber = (isAuthenticated: boolean) => void;

class BiometricServiceClass {
  private isAuthenticated = false;
  private isSecured = false;
  private subscribers: Set<AuthStateSubscriber> = new Set();
  private backgroundedAt: number | null = null;
  // Threshold in ms to require re-auth (e.g. 10 minutes)
  private readonly REAUTH_THRESHOLD_MS = 10 * 60 * 1000;

  constructor() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  public async init() {
    const isSecured =
      await StorageService.getJSON<boolean>('isBiometricSecured');
    this.isSecured = !!isSecured;
    // Assume initialized app is authenticated until otherwise
    this.isAuthenticated = true;
    this.notifySubscribers();
  }

  public async toggleSecurity(enabled: boolean): Promise<boolean> {
    if (enabled) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return false;
      }
    }

    this.isSecured = enabled;
    await StorageService.setJSON('isBiometricSecured', enabled);
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

    try {
      const result = await LocalAuthentication.authenticateAsync({
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
