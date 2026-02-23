import { defineConfig } from 'detox';

export default defineConfig({
  testRunner: 'jest',
  runnerConfig: '__tests__/detox/config.json',
  artifacts: {
    rootDir: './detox/artifacts',
    plugins: {
      log: 'enabled',
      screenshot: 'enabled',
    },
  },
  apps: {
    'android.debug': {
      type: 'android.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
    },
    'android.release': {
      type: 'android.apk',
      build: 'cd android && ./gradlew assembleRelease',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
    },
  },
  devices: {
    android: [
      {
        type: 'android.emulator',
        device: {
          avdName: 'Pixel_5_API_34',
        },
      },
    ],
  },
  configurations: {
    'android.debug': {
      device: 'android',
      app: 'android.debug',
    },
    'android.release': {
      device: 'android',
      app: 'android.release',
    },
  },
});
