import fs from 'fs';
import path from 'path';

describe('Android release verification script', () => {
  test('waits for the Android package manager before installing the APK', () => {
    const scriptPath = path.join(
      __dirname,
      '..',
      'scripts',
      'ci',
      'verify-android-release.sh',
    );
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
});
