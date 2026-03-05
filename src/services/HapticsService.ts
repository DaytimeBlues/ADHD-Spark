import { Vibration } from 'react-native';
import { isWeb } from '../utils/PlatformUtils';
import LoggerService from './LoggerService';

// Try to import expo-haptics if available
let Haptics: typeof import('expo-haptics') | null = null;
try {
  Haptics = require('expo-haptics');
} catch (err) {
  // Use LoggerService if available (may not be during early module loading)
  try {
    LoggerService.debug({
      service: 'HapticsService',
      operation: 'import',
      message: 'expo-haptics not available, using Vibration fallback',
      error: err,
    });
  } catch {
    // Fallback to console if LoggerService not initialized
    // eslint-disable-next-line no-console
    console.debug('[HapticsService] expo-haptics not available');
  }
}

// Detect if device has haptic engine (iOS 10+)
const hasExpoHaptics = Haptics !== null;

// Light tap for UI feedback
const LIGHT_TAP_MS = 10;
const MEDIUM_TAP_MS = 20;
const HEAVY_TAP_MS = 40;
const MIN_INTERVAL_MS = 100;

// Selection feedback (iOS only - subtle tick)
const SELECTION_INTERVAL_MS = 50;

type TapOptions = {
  key?: string;
  minIntervalMs?: number;
  durationMs?: number;
  intensity?: 'light' | 'medium' | 'heavy';
};

type SelectionOptions = {
  key?: string;
};

class HapticsService {
  private lastTapByKey: Record<string, number> = {};
  private lastSelectionByKey: Record<string, number> = {};

  /**
   * Light tap - for button presses, selections
   * Uses expo-haptics on iOS, vibration on Android
   */
  tap(options?: TapOptions): void {
    if (isWeb) {
      return;
    }

    const key = options?.key ?? 'global';
    const minIntervalMs = options?.minIntervalMs ?? MIN_INTERVAL_MS;
    const intensity = options?.intensity ?? 'light';
    const now = Date.now();
    const lastTapAt = this.lastTapByKey[key] ?? 0;

    if (now - lastTapAt < minIntervalMs) {
      return;
    }

    this.lastTapByKey[key] = now;

    // Use expo-haptics if available (much better on iOS)
    if (hasExpoHaptics && Haptics) {
      const impactStyle =
        intensity === 'heavy'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : intensity === 'medium'
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light;

      Haptics.impactAsync(impactStyle).catch((err) => {
        LoggerService.debug({
          service: 'HapticsService',
          operation: 'impactAsync',
          error: err,
          message: 'Haptics impact failed, falling back to vibration',
        });
        this.fallbackVibrate(intensity);
      });
    } else {
      this.fallbackVibrate(intensity);
    }
  }

  private fallbackVibrate(intensity: 'light' | 'medium' | 'heavy'): void {
    Vibration.vibrate(
      intensity === 'heavy'
        ? HEAVY_TAP_MS
        : intensity === 'medium'
          ? MEDIUM_TAP_MS
          : LIGHT_TAP_MS,
    );
  }

  /**
   * Medium tap - for important actions
   */
  mediumTap(options?: TapOptions): void {
    this.tap({ ...options, intensity: 'medium' });
  }

  /**
   * Heavy tap - for critical actions, completion
   */
  heavyTap(options?: TapOptions): void {
    this.tap({ ...options, intensity: 'heavy' });
  }

  /**
   * Selection feedback - subtle tick for scrolling/selection changes
   * iOS only - very subtle
   */
  selection(options?: SelectionOptions): void {
    if (isWeb) {
      return;
    }

    const key = options?.key ?? 'global';
    const now = Date.now();
    const lastSelectionAt = this.lastSelectionByKey[key] ?? 0;

    if (now - lastSelectionAt < SELECTION_INTERVAL_MS) {
      return;
    }

    this.lastSelectionByKey[key] = now;

    // Light tick for selection
    Vibration.vibrate(5);
  }

  /**
   * Light tap - alias for tap
   */
  lightTap(options?: TapOptions): void {
    this.tap(options);
  }

  /**
   * Success feedback - use expo-haptics if available
   */
  success(): void {
    if (isWeb) {
      return;
    }

    if (hasExpoHaptics && Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        (err) => {
          LoggerService.debug({
            service: 'HapticsService',
            operation: 'notificationAsync',
            error: err,
            message: 'Haptics notification failed, falling back to vibration',
          });
          Vibration.vibrate([0, 50, 50, 50]);
        },
      );
    } else {
      Vibration.vibrate([0, 50, 50, 50]);
    }
  }

  /**
   * Warning feedback - longer vibration
   */
  warning(): void {
    if (isWeb) {
      return;
    }
    Vibration.vibrate(100);
  }

  /**
   * Error feedback - triple short vibration
   */
  error(): void {
    if (isWeb) {
      return;
    }
    Vibration.vibrate([0, 30, 30, 30, 30, 30]);
  }

  /**
   * Cancel/restore feedback - sequence
   */
  cancel(): void {
    if (isWeb) {
      return;
    }
    Vibration.vibrate([0, 20, 50, 20]);
  }
}

export default new HapticsService();
