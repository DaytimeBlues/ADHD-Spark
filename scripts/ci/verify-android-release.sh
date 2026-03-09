#!/usr/bin/env bash

set -euo pipefail

APK="android/app/build/outputs/apk/release/app-release.apk"
DEVICE_SERIAL="emulator-5554"

adb_device() {
  adb -s "$DEVICE_SERIAL" "$@"
}

wait_for_boot() {
  echo "Waiting for emulator to finish booting..."
  adb wait-for-device

  for i in $(seq 1 60); do
    BOOT="$(adb_device shell getprop sys.boot_completed 2>/dev/null || echo "offline")"
    if [ "$BOOT" = "1" ]; then
      echo "Emulator booted."
      return 0
    fi

    echo "Emulator not ready yet (attempt $i). status=$BOOT"
    if [ "$BOOT" = "offline" ]; then
      adb kill-server || true
      adb start-server || true
      adb wait-for-device || true
    fi
    sleep 10
  done

  echo "Emulator did not report boot completion in time."
  return 1
}

echo "Waiting for emulator to be available..."
adb wait-for-device

wait_for_boot

adb devices

installed=0
for attempt in 1 2 3; do
  echo "Installing APK (attempt $attempt)..."
  if adb_device install --no-streaming -r "$APK"; then
    echo "APK installed."
    installed=1
    break
  fi

  echo "Install failed (attempt $attempt). Retrying..."
  sleep 5
  adb kill-server || true
  adb start-server || true
  adb wait-for-device || true
  wait_for_boot || true
done

if [ "$installed" -ne 1 ]; then
  echo "APK installation failed after retries."
  exit 1
fi

adb_device shell am start -n com.adhdcaddi/.MainActivity
sleep 10

if ! adb_device shell dumpsys window windows | grep -i "com.adhdcaddi"; then
  echo "com.adhdcaddi was not found in the active window dump."
  exit 1
fi
