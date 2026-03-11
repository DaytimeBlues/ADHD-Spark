import Sound from 'react-native-sound';
import { getBundledAudioFileName } from '../config/audioAssets';
import { LoggerService } from './LoggerService';

let brownNoise: Sound | null = null;
let brownNoiseAvailable = false;

const loadSound = (
  fileName: string,
  operation: string,
): Promise<Sound | null> => {
  return new Promise((resolve) => {
    const sound = new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        LoggerService.error({
          service: 'SoundService',
          operation,
          message: `Failed to load ${fileName}`,
          error,
        });
        resolve(null);
        return;
      }

      resolve(sound);
    });
  });
};

const SoundService = {
  async initBrownNoise() {
    brownNoise?.release();
    brownNoise = await loadSound(
      getBundledAudioFileName('brownNoise'),
      'initBrownNoise',
    );
    brownNoiseAvailable = brownNoise !== null;
    return brownNoiseAvailable;
  },

  playBrownNoise() {
    if (!brownNoise || !brownNoiseAvailable) {
      return false;
    }

    brownNoise.setNumberOfLoops(-1);
    brownNoise.setVolume(0.5);
    brownNoise.play((success) => {
      if (!success) {
        LoggerService.error({
          service: 'SoundService',
          operation: 'playBrownNoise',
          message: 'Brown noise playback failed',
        });
      }
    });

    return true;
  },

  pauseBrownNoise() {
    if (brownNoise) {
      brownNoise.pause();
    }
  },

  stopBrownNoise() {
    if (brownNoise) {
      brownNoise.stop();
    }
  },

  setBrownNoiseVolume(volume: number) {
    if (brownNoise) {
      brownNoise.setVolume(volume);
    }
  },

  releaseBrownNoise() {
    if (brownNoise) {
      brownNoise.release();
      brownNoise = null;
    }
    brownNoiseAvailable = false;
  },

  async playNotificationSound() {
    const notification = await loadSound(
      getBundledAudioFileName('notification'),
      'playNotificationSound',
    );
    if (!notification) {
      return false;
    }

    notification.setVolume(0.7);
    notification.play((success) => {
      if (!success) {
        LoggerService.error({
          service: 'SoundService',
          operation: 'playNotificationSound',
          message: 'Notification playback failed',
        });
      }
      notification.release();
    });
    return true;
  },

  async playCompletionSound() {
    const completion = await loadSound(
      getBundledAudioFileName('completion'),
      'playCompletionSound',
    );
    if (!completion) {
      return false;
    }

    completion.setVolume(0.7);
    completion.play((success) => {
      if (!success) {
        LoggerService.error({
          service: 'SoundService',
          operation: 'playCompletionSound',
          message: 'Completion playback failed',
        });
      }
      completion.release();
    });
    return true;
  },
};

export default SoundService;
