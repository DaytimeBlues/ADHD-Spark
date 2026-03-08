jest.mock('react-native-sound', () => {
  type MockSoundInstance = {
    setNumberOfLoops: jest.Mock;
    setVolume: jest.Mock;
    play: jest.Mock;
    pause: jest.Mock;
    stop: jest.Mock;
    release: jest.Mock;
  };

  const MockSound = function (
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
    if (callback) {
      callback(null);
    }
  };

  return Object.assign(MockSound, { MAIN_BUNDLE: 'main' });
});

jest.mock('../src/services/LoggerService', () => ({
  __esModule: true,
  LoggerService: {
    error: jest.fn(),
  },
}));

import SoundService from '../src/services/SoundService';

describe('SoundService', () => {
  it('runs all sound methods without throwing', async () => {
    await expect(SoundService.initBrownNoise()).resolves.toBeUndefined();

    expect(() => SoundService.playBrownNoise()).not.toThrow();
    expect(() => SoundService.pauseBrownNoise()).not.toThrow();
    expect(() => SoundService.stopBrownNoise()).not.toThrow();
    expect(() => SoundService.setBrownNoiseVolume(0.3)).not.toThrow();
    expect(() => SoundService.releaseBrownNoise()).not.toThrow();

    await expect(SoundService.playNotificationSound()).resolves.toBeUndefined();
    await expect(SoundService.playCompletionSound()).resolves.toBeUndefined();
  });
});
