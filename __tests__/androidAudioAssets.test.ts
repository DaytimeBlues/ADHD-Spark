import fs from 'fs';
import os from 'os';
import path from 'path';

import {
  REQUIRED_AUDIO_FILES,
  REQUIRED_AUDIO_FILE_NAMES,
} from '../src/config/audioAssets';
import {
  collectAudioAssetStatus,
  syncAudioAssets,
} from '../scripts/android/sync-audio-assets';

describe('android audio asset pipeline', () => {
  it('reports the current repo is still waiting on the committed audio files', () => {
    const repoRoot = path.join(__dirname, '..');

    const status = collectAudioAssetStatus(repoRoot);

    expect(status.sourceDirectory).toBe(path.join(repoRoot, 'assets', 'audio'));
    expect(status.missingRequiredFiles).toEqual(REQUIRED_AUDIO_FILE_NAMES);
    expect(status.availableFiles).toEqual([]);
  });

  it('copies committed audio assets into the generated Android raw resource directory', () => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'audio-sync-'));
    const sourceDirectory = path.join(repoRoot, 'assets', 'audio');
    const targetDirectory = path.join(
      repoRoot,
      'android',
      'app',
      'build',
      'generated',
      'res',
      'audio',
      'raw',
    );

    fs.mkdirSync(sourceDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(sourceDirectory, REQUIRED_AUDIO_FILES.brownNoise),
      'brown',
    );
    fs.writeFileSync(
      path.join(sourceDirectory, REQUIRED_AUDIO_FILES.notification),
      'notification',
    );
    fs.writeFileSync(
      path.join(sourceDirectory, REQUIRED_AUDIO_FILES.completion),
      'completion',
    );

    const result = syncAudioAssets(repoRoot);

    expect(result.missingRequiredFiles).toEqual([]);
    expect(result.copiedFiles).toEqual(REQUIRED_AUDIO_FILE_NAMES);
    for (const fileName of REQUIRED_AUDIO_FILE_NAMES) {
      expect(fs.existsSync(path.join(targetDirectory, fileName))).toBe(true);
    }
  });

  it('wires the Android build to sync generated raw resources before preview and release packaging', () => {
    const buildGradlePath = path.join(
      __dirname,
      '..',
      'android',
      'app',
      'build.gradle',
    );
    const buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

    expect(buildGradle).toContain('syncBundledAudioAssets');
    expect(buildGradle).toContain('$buildDir/generated/res/audio');
    expect(buildGradle).toContain('preBuild.dependsOn(syncBundledAudioAssets)');
  });
});
