export const REQUIRED_AUDIO_FILES = {
  brownNoise: 'brown_noise.mp3',
  notification: 'notification.mp3',
  completion: 'completion.mp3',
} as const;

export const REQUIRED_AUDIO_FILE_NAMES = Object.freeze(
  Object.values(REQUIRED_AUDIO_FILES),
);

export type AudioAssetKey = keyof typeof REQUIRED_AUDIO_FILES;

export const getBundledAudioFileName = (asset: AudioAssetKey) =>
  REQUIRED_AUDIO_FILES[asset];
