const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const REQUIRED_ENV_VARS = ['KEYSTORE_PASSWORD', 'KEY_ALIAS', 'KEY_PASSWORD'];

function validateSigningEnv(env) {
  const missing = REQUIRED_ENV_VARS.filter((key) => !env[key]);
  return {
    ok: missing.length === 0,
    missing,
  };
}

function readPackageVersion(repoRoot) {
  const packageJsonPath = path.join(repoRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}

function readAndroidVersionCode(repoRoot) {
  const buildGradlePath = path.join(repoRoot, 'android', 'app', 'build.gradle');
  const buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
  const versionCodeMatch = buildGradle.match(/versionCode\s+(\d+)/);

  if (!versionCodeMatch) {
    throw new Error(
      'Could not determine Android versionCode from android/app/build.gradle',
    );
  }

  return versionCodeMatch[1];
}

function buildReleaseArtifactName({ versionName, versionCode, buildTag }) {
  return `adhd-caddi-${versionName}+${versionCode}-${buildTag}.apk`;
}

function getBuildTag(repoRoot) {
  if (process.env.GITHUB_SHA) {
    return process.env.GITHUB_SHA.slice(0, 7);
  }

  return execSync('git rev-parse --short HEAD', {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();
}

function assembleSignedRelease(repoRoot) {
  const gradleCommand =
    process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  const result = spawnSync(gradleCommand, ['assembleRelease'], {
    cwd: path.join(repoRoot, 'android'),
    env: { ...process.env, ANDROID_SIGNING_ENABLED: 'true' },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    throw new Error('Signed release build failed');
  }
}

function copyReleaseArtifact(repoRoot, artifactName) {
  const sourceApk = path.join(
    repoRoot,
    'android',
    'app',
    'build',
    'outputs',
    'apk',
    'release',
    'app-release.apk',
  );
  const outputDir = path.join(
    repoRoot,
    'android',
    'app',
    'build',
    'outputs',
    'apk',
    'sideload',
  );

  fs.mkdirSync(outputDir, { recursive: true });

  const targetApk = path.join(outputDir, artifactName);
  fs.copyFileSync(sourceApk, targetApk);
  return targetApk;
}

function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const validation = validateSigningEnv(process.env);

  if (!validation.ok) {
    throw new Error(
      `Missing required release signing environment variables: ${validation.missing.join(', ')}`,
    );
  }

  const versionName = readPackageVersion(repoRoot);
  const versionCode = readAndroidVersionCode(repoRoot);
  const buildTag = getBuildTag(repoRoot);
  const artifactName = buildReleaseArtifactName({
    versionName,
    versionCode,
    buildTag,
  });

  assembleSignedRelease(repoRoot);
  const artifactPath = copyReleaseArtifact(repoRoot, artifactName);

  process.stdout.write(`${artifactPath}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  REQUIRED_ENV_VARS,
  buildReleaseArtifactName,
  validateSigningEnv,
};
