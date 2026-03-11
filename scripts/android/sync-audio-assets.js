const fs = require('fs');
const path = require('path');

const REQUIRED_AUDIO_FILES = Object.freeze({
  brownNoise: 'brown_noise.mp3',
  notification: 'notification.mp3',
  completion: 'completion.mp3',
});

const REQUIRED_AUDIO_FILE_NAMES = Object.freeze(
  Object.values(REQUIRED_AUDIO_FILES),
);

const AUDIO_SOURCE_DIRECTORY = ['assets', 'audio'];
const GENERATED_AUDIO_DIRECTORY = [
  'android',
  'app',
  'build',
  'generated',
  'res',
  'audio',
  'raw',
];

function getAudioSourceDirectory(repoRoot) {
  return path.join(repoRoot, ...AUDIO_SOURCE_DIRECTORY);
}

function getGeneratedAudioDirectory(repoRoot) {
  return path.join(repoRoot, ...GENERATED_AUDIO_DIRECTORY);
}

function collectAudioAssetStatus(repoRoot) {
  const sourceDirectory = getAudioSourceDirectory(repoRoot);
  const allFiles = fs.existsSync(sourceDirectory)
    ? fs
        .readdirSync(sourceDirectory, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
    : [];
  const availableFiles = REQUIRED_AUDIO_FILE_NAMES.filter((fileName) =>
    allFiles.includes(fileName),
  );

  const missingRequiredFiles = REQUIRED_AUDIO_FILE_NAMES.filter(
    (fileName) => !availableFiles.includes(fileName),
  );

  return {
    sourceDirectory,
    targetDirectory: getGeneratedAudioDirectory(repoRoot),
    availableFiles,
    missingRequiredFiles,
  };
}

function syncAudioAssets(repoRoot) {
  const status = collectAudioAssetStatus(repoRoot);

  fs.rmSync(status.targetDirectory, { recursive: true, force: true });
  fs.mkdirSync(status.targetDirectory, { recursive: true });

  const copiedFiles = [];
  for (const fileName of status.availableFiles) {
    fs.copyFileSync(
      path.join(status.sourceDirectory, fileName),
      path.join(status.targetDirectory, fileName),
    );
    copiedFiles.push(fileName);
  }

  return {
    ...status,
    copiedFiles,
  };
}

function formatStatus(result) {
  const copied = result.copiedFiles ?? [];

  return [
    `Audio source: ${result.sourceDirectory}`,
    `Android generated raw dir: ${result.targetDirectory}`,
    `Copied: ${copied.length ? copied.join(', ') : '(none)'}`,
    `Missing required: ${
      result.missingRequiredFiles.length
        ? result.missingRequiredFiles.join(', ')
        : '(none)'
    }`,
  ].join('\n');
}

function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const checkOnly = process.argv.includes('--check');
  const result = checkOnly
    ? collectAudioAssetStatus(repoRoot)
    : syncAudioAssets(repoRoot);

  process.stdout.write(`${formatStatus(result)}\n`);

  if (checkOnly && result.missingRequiredFiles.length > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  REQUIRED_AUDIO_FILES,
  REQUIRED_AUDIO_FILE_NAMES,
  collectAudioAssetStatus,
  getAudioSourceDirectory,
  getGeneratedAudioDirectory,
  syncAudioAssets,
};
