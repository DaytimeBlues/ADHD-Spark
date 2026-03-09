import fs from 'fs';
import path from 'path';

describe('Android release verification script', () => {
  const scriptPath = path.join(
    __dirname,
    '..',
    'scripts',
    'ci',
    'verify-android-release.sh',
  );

  test('waits for the Android package manager before installing the APK', () => {
    const script = fs.readFileSync(scriptPath, 'utf8');

    expect(script).toContain('wait_for_package_manager()');
    expect(script).toContain('adb_device shell service check package');
    expect(script).toMatch(
      /wait_for_boot\(\)[\s\S]*wait_for_package_manager\(\)/,
    );
    expect(script).toMatch(
      /wait_for_package_manager[\s\S]*adb_device install --no-streaming -r "\$APK"/,
    );
  });

  test('requires a stable app-ready signal after launch', () => {
    const script = fs.readFileSync(scriptPath, 'utf8');

    expect(script).toContain('wait_for_app_ready()');
    expect(script).toContain('APP_READY');
    expect(script).toMatch(
      /adb_device shell am start -n com\.adhdcaddi\/\.MainActivity[\s\S]*wait_for_app_ready/,
    );
  });

  test('checks the app survives after readiness is reported', () => {
    const script = fs.readFileSync(scriptPath, 'utf8');

    expect(script).toContain('pidof com.adhdcaddi');
    expect(script).toMatch(/wait_for_app_ready[\s\S]*pidof com\.adhdcaddi/);
  });
});

describe('Android release workflow', () => {
  const workflowPath = path.join(
    __dirname,
    '..',
    '.github',
    'workflows',
    'android.yml',
  );

  test('makes CI smoke signing explicit in the release build job', () => {
    const workflow = fs.readFileSync(workflowPath, 'utf8');

    expect(workflow).toContain('CI smoke only');
    expect(workflow).toContain('not a production-signed artifact');
    expect(workflow).toContain('ANDROID_SIGNING_ENABLED: false');
  });

  test('uses a release artifact name that distinguishes CI smoke output', () => {
    const workflow = fs.readFileSync(workflowPath, 'utf8');

    expect(workflow).not.toContain('name: android-release-apk\n');
    expect(workflow).toContain('android-release-ci-smoke');
    expect(workflow).toContain('${{ github.run_number }}');
    expect(workflow).toContain('${{ github.sha }}');
  });
});

describe('Android app-ready marker', () => {
  const appPath = path.join(__dirname, '..', 'App.tsx');

  test('reports APP_READY from the root shell after navigation becomes ready', () => {
    const app = fs.readFileSync(appPath, 'utf8');

    expect(app).toContain("service: 'AndroidReleaseSmoke'");
    expect(app).toContain("operation: 'reportAppReady'");
    expect(app).toContain("message: 'APP_READY'");
    expect(app).toMatch(
      /flushOverlayIntentQueue\(\);[\s\S]*LoggerService\.info\(/,
    );
  });
});
