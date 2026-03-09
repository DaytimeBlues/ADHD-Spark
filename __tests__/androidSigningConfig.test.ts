import fs from 'fs';
import path from 'path';

describe('Android signing boundaries', () => {
  const buildGradlePath = path.join(
    __dirname,
    '..',
    'android',
    'app',
    'build.gradle',
  );
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const helperPath = path.join(
    __dirname,
    '..',
    'scripts',
    'android',
    'build-sideload-release.js',
  );

  test('gradle makes the CI smoke signing boundary explicit', () => {
    const buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

    expect(buildGradle).toContain("System.getenv('ANDROID_SIGNING_ENABLED')");
    expect(buildGradle).toContain('CI smoke signing uses the debug key only.');
    expect(buildGradle).toContain(
      'Real sideload releases require the keystore environment.',
    );
  });

  test('package scripts expose a distinct sideload release entrypoint', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf8'),
    ) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts).toHaveProperty(
      'build:android:sideload',
      'node scripts/android/build-sideload-release.js',
    );
  });

  test('sideload helper validates required signing env vars and builds artifact names', () => {
    expect(fs.existsSync(helperPath)).toBe(true);

    const helper = jest.requireActual(helperPath) as {
      REQUIRED_ENV_VARS: string[];
      buildReleaseArtifactName: (input: {
        versionName: string;
        versionCode: string | number;
        buildTag: string;
      }) => string;
      validateSigningEnv: (env: NodeJS.ProcessEnv) => {
        ok: boolean;
        missing: string[];
      };
    };

    expect(helper.REQUIRED_ENV_VARS).toEqual([
      'KEYSTORE_PASSWORD',
      'KEY_ALIAS',
      'KEY_PASSWORD',
    ]);
    expect(
      helper.buildReleaseArtifactName({
        versionName: '1.2.3',
        versionCode: 42,
        buildTag: 'abc1234',
      }),
    ).toBe('adhd-caddi-1.2.3+42-abc1234.apk');
    expect(
      helper.validateSigningEnv({
        KEYSTORE_PASSWORD: 'secret',
        KEY_ALIAS: '',
        KEY_PASSWORD: 'secret',
      } as unknown as NodeJS.ProcessEnv),
    ).toEqual({
      ok: false,
      missing: ['KEY_ALIAS'],
    });
  });
});
