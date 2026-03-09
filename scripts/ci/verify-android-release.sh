#!/usr/bin/env bash

set -euo pipefail

APK="android/app/build/outputs/apk/release/app-release.apk"

echo "Waiting for emulator to be available..."
adb wait-for-device

# Wait for boot_completed (up to 10 min); restart adb server only when offline.
for i in $(seq 1 60); do
  BOOT="$(adb -s emulator-5554 shell getprop sys.boot_completed 2>/dev/null || echo "offline")"
  if [ "$BOOT" = "1" ]; then
    echo "Emulator booted."
    break
  fi

  echo "Emulator not ready yet (attempt $i). status=$BOOT"
  if [ "$BOOT" = "offline" ]; then
    adb kill-server || true
    adb start-server || true
  fi
  sleep 10
done

adb devices

installed=0
for attempt in 1 2 3; do
  echo "Installing APK (attempt $attempt)..."
  if adb install -r "$APK"; then
    echo "APK installed."
    installed=1
    break
  fi

  echo "Install failed (attempt $attempt). Retrying..."
  sleep 5
  adb kill-server || true
  adb start-server || true
done

if [ "$installed" -ne 1 ]; then
  echo "APK installation failed after retries."
  exit 1
fi

adb shell am start -n com.adhdcaddi/.MainActivity
sleep 10

if ! adb shell dumpsys window windows | grep -i "com.adhdcaddi"; then
  echo "com.adhdcaddi was not found in the active window dump."
  exit 1
fi
