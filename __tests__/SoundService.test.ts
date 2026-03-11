jest.mock('react-native-sound', () => {
  type MockSoundInstance = {
    setNumberOfLoops: jest.Mock;
    setVolume: jest.Mock;
    play: jest.Mock;
    pause: jest.Mock;
    stop: jest.Mock;
    release: jest.Mock;
  };

  const MockSound = jest.fn(function (
    this: MockSoundInstance,
    _file: string,
    _bundle: string,
    callback?: (error: unknown) => void,
  ) {
    this.setNumberOfLoops = jest.fn();
    this.setVolume = jest.fn();
    this.play = jest.fn((cb?: (success: boolean) => void) => cb?.(true));
    this.pause = jest.fn();
    this.stop = jest.fn();
    this.release = jest.fn();
    setTimeout(() => callback?.(null), 0);
  });

  return Object.assign(MockSound, { MAIN_BUNDLE: 'main' });
});

jest.mock('../src/services/LoggerService', () => ({
  __esModule: true,
  LoggerService: {
    error: jest.fn(),
  },
}));

import SoundService from '../src/services/SoundService';
import { REQUIRED_AUDIO_FILES } from '../src/config/audioAssets';

describe('SoundService', () => {
  it('runs all sound methods without throwing', async () => {
    await expect(SoundService.initBrownNoise()).resolves.toBe(true);

    expect(SoundService.playBrownNoise()).toBe(true);
    expect(() => SoundService.pauseBrownNoise()).not.toThrow();
    expect(() => SoundService.stopBrownNoise()).not.toThrow();
    expect(() => SoundService.setBrownNoiseVolume(0.3)).not.toThrow();
    expect(() => SoundService.releaseBrownNoise()).not.toThrow();

    await expect(SoundService.playNotificationSound()).resolves.toBe(true);
    await expect(SoundService.playCompletionSound()).resolves.toBe(true);

    const MockSound = jest.requireMock('react-native-sound') as jest.Mock;
    expect(MockSound).toHaveBeenCalledWith(
      REQUIRED_AUDIO_FILES.brownNoise,
      'main',
      expect.any(Function),
    );
    expect(MockSound).toHaveBeenCalledWith(
      REQUIRED_AUDIO_FILES.notification,
      'main',
      expect.any(Function),
    );
    expect(MockSound).toHaveBeenCalledWith(
      REQUIRED_AUDIO_FILES.completion,
      'main',
      expect.any(Function),
    );
  });

  it('does not report brown noise as playable when the asset fails to load', async () => {
    const MockSound = jest.requireMock('react-native-sound') as jest.Mock;

    MockSound.mockImplementationOnce(function failingBrownNoise(
      this: {
        setNumberOfLoops: jest.Mock;
        setVolume: jest.Mock;
        play: jest.Mock;
        pause: jest.Mock;
        stop: jest.Mock;
        release: jest.Mock;
      },
      _file: string,
      _bundle: string,
      callback?: (error: unknown) => void,
    ) {
      this.setNumberOfLoops = jest.fn();
      this.setVolume = jest.fn();
      this.play = jest.fn();
      this.pause = jest.fn();
      this.stop = jest.fn();
      this.release = jest.fn();
      setTimeout(() => callback?.(new Error('resource not found')), 0);
    });

    await expect(SoundService.initBrownNoise()).resolves.toBe(false);
    expect(SoundService.playBrownNoise()).toBe(false);
  });

  it('returns false when notification and completion assets fail to load', async () => {
    const MockSound = jest.requireMock('react-native-sound') as jest.Mock;

    MockSound.mockImplementation(function failingTransientSound(
      this: {
        setNumberOfLoops: jest.Mock;
        setVolume: jest.Mock;
        play: jest.Mock;
        pause: jest.Mock;
        stop: jest.Mock;
        release: jest.Mock;
      },
      _file: string,
      _bundle: string,
      callback?: (error: unknown) => void,
    ) {
      this.setNumberOfLoops = jest.fn();
      this.setVolume = jest.fn();
      this.play = jest.fn();
      this.pause = jest.fn();
      this.stop = jest.fn();
      this.release = jest.fn();
      setTimeout(() => callback?.(new Error('resource missing')), 0);
    });

    await expect(SoundService.playNotificationSound()).resolves.toBe(false);
    await expect(SoundService.playCompletionSound()).resolves.toBe(false);
  });
});
