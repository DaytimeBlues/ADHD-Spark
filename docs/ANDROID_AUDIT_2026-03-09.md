# Android Audit 2026-03-09

## Summary

Android scope is currently `APK-ready`, not Play Store release automation.

The current automated source of truth is [`.github/workflows/android.yml`](/C:/dev/ADHD-CADDI-V1/.github/workflows/android.yml), which now defines Android readiness as:

- release APK assembles on `main`
- CI smoke artifact is uploaded
- emulator install succeeds
- app launch succeeds
- app emits an `APP_READY` signal from the root shell
- process and app window remain alive after readiness

## Current Release Status

### Integration status as of 2026-03-09

- `main` now includes merge commit `a67ef8a` (`merge: formalize android apk release readiness`)
- `origin/main` currently points to `88580a7` (`docs: record android release integration status`)
- local verification passed before push:
  - focused Android contract tests
  - `npx tsc --noEmit`
  - `npm run admin:android-health`
  - `npm run lint` with the same pre-existing 20 warnings and 0 errors
- post-push GitHub Actions state for merge commit `a67ef8a`:
  - `CI`: success
  - `CodeQL Security Analysis`: success
  - `Secret Scanning (Gitleaks)`: success
  - `Android CI`: still running at the time of this audit update, with `Android Build and E2E Tests` already green and `Android Release Build Check` still in progress

### `CI release smoke`

Meaning:

- non-production signing only
- proves the APK can be packaged, installed, launched, and reach app-shell-ready state
- not a production-signed artifact

### `sideload release`

Meaning:

- keystore-signed APK built with the documented sideload path
- artifact naming includes version name, version code, and build metadata
- suitable for tester handoff once manual device validation is complete

## Evidence

- Release workflow: [android.yml](/C:/dev/ADHD-CADDI-V1/.github/workflows/android.yml)
- Emulator verifier: [verify-android-release.sh](/C:/dev/ADHD-CADDI-V1/scripts/ci/verify-android-release.sh)
- App-ready signal: [App.tsx](/C:/dev/ADHD-CADDI-V1/App.tsx)
- Signed sideload helper: [build-sideload-release.js](/C:/dev/ADHD-CADDI-V1/scripts/android/build-sideload-release.js)

## Android Release Checklist

Future agents must follow this order:

1. read current Android audit
2. inspect latest Android CI run
3. run local health checks if touching native code
4. update the audit after changes

## Manual APK-Ready Acceptance

- Clean install launch
- Returning-user local data launch
- Offline startup
- Tutorial visibility
- Capture entry
- Tab navigation survivability
- One representative core flow after launch
- Denied optional permissions do not crash the app
- Disconnected optional integrations do not block launch

## Explicit Exclusions

- Overlay and other high-privilege features remain feature-gated and are not required for the APK-ready bar unless explicitly enabled for the build under test.

## Phase 2: Non-APK Work

- Play Store publishing
- Play Console rollout management
- Wider physical device matrix
- Automated signed-release distribution workflow
- Release notes and store asset automation
