import SoundService from '../src/services/SoundService.web';

describe('SoundService.web', () => {
  it('executes all methods without throwing', async () => {
    await expect(SoundService.initBrownNoise()).resolves.toBeUndefined();
    expect(() => SoundService.playBrownNoise()).not.toThrow();
    expect(() => SoundService.pauseBrownNoise()).not.toThrow();
    expect(() => SoundService.stopBrownNoise()).not.toThrow();
    expect(() => SoundService.setBrownNoiseVolume(0.5)).not.toThrow();
    expect(() => SoundService.releaseBrownNoise()).not.toThrow();
    await expect(SoundService.playNotificationSound()).resolves.toBeUndefined();
    await expect(SoundService.playCompletionSound()).resolves.toBeUndefined();
  });
});
