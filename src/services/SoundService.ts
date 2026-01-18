import Sound from 'react-native-sound';

let brownNoise: Sound | null = null;

const SoundService = {
  async initBrownNoise() {
    brownNoise = new Sound('brown_noise.mp3', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.error('Failed to load brown noise:', error);
      }
    });
  },

  playBrownNoise() {
    if (brownNoise) {
      brownNoise.setNumberOfLoops(-1);
      brownNoise.setVolume(0.5);
      brownNoise.play(success => {
        if (!success) {
          console.error('Brown noise playback failed');
        }
      });
    }
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
  },

  async playNotificationSound() {
    const notification = new Sound('notification.mp3', Sound.MAIN_BUNDLE);
    notification.setVolume(0.7);
    notification.play(success => {
      if (success) {
        notification.release();
      }
    });
  },

  async playCompletionSound() {
    const completion = new Sound('completion.mp3', Sound.MAIN_BUNDLE);
    completion.setVolume(0.7);
    completion.play(success => {
      if (success) {
        completion.release();
      }
    });
  },
};

export default SoundService;
