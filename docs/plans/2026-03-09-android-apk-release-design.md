# Android APK Release Design

## Goal

Define an Android `APK-ready` contract so future engineers can tell from CI and docs whether the app is ready for tester sideloading.

## Decision

Use a hybrid release contract:

- keep ADB-level install and launch verification
- add an explicit in-app `APP_READY` signal from the root shell
- distinguish `CI release smoke` from `sideload release`

## Contract

### `CI release smoke`

- non-production-signed packaging only
- assembles release APK
- uploads CI smoke artifact
- installs and launches in emulator
- reaches app-shell-ready state
- survives long enough to be credible

### `sideload release`

- keystore-signed APK
- built by the documented sideload path
- artifact naming includes version name, version code, and build metadata

## Docs That Must Agree

- `docs/RELEASE_PROCESS.md`
- `docs/TECH_SPEC.md`
- `docs/ANDROID_AUDIT_2026-03-09.md`
- `docs/TEST_MATRIX.md`
