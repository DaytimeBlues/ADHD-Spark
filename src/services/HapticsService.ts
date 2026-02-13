import { Platform, Vibration } from 'react-native';

const TAP_DURATION_MS = 8;
const MIN_INTERVAL_MS = 40;

class HapticsService {
  private lastTapAt = 0;

  tap(): void {
    if (Platform.OS === 'web') {
      return;
    }

    const now = Date.now();
    if (now - this.lastTapAt < MIN_INTERVAL_MS) {
      return;
    }

    this.lastTapAt = now;
    Vibration.vibrate(TAP_DURATION_MS);
  }
}

export default new HapticsService();
