# Android Readiness Report

Date: 2026-02-16

## Completed

1. **Android build blocker removed**
   - `:react-native-reanimated:prepareHeadersForPrefab` lock failure is resolved.
   - Windows build outputs were redirected off OneDrive to `%LOCALAPPDATA%/Temp/spark-android/*` to avoid file-handle lock contention.
   - `./gradlew assembleDebug --no-daemon --no-build-cache` now succeeds.
   - APK output verified at:
     - `/c/Users/Steve/AppData/Local/Temp/spark-android/app/outputs/apk/debug/app-debug.apk`

2. **Google sign-in wiring validation completed**
   - `android/app/google-services.json` is currently missing.
   - Google Tasks + Calendar scopes are configured in `PlaudService`.
   - Added environment-backed client IDs:
     - `REACT_APP_GOOGLE_WEB_CLIENT_ID`
     - `REACT_APP_GOOGLE_IOS_CLIENT_ID`
   - Google config now uses those values during `GoogleSignin.configure(...)`.

3. **Pipeline resilience hardening completed**
   - Added retry/backoff for transient Google API failures (`408`, `429`, `500`, `502`, `503`, `504`) with exponential delays.
   - Added structured Google export error metadata:
     - `errorCode`
     - `errorMessage`
   - Added explicit auth-required/auth-failed reporting from export pipeline.

4. **User-visible auth/degradation state improved**
   - Brain Dump now surfaces Google auth/network export errors via `sortingError` instead of silently skipping.
   - Successful export still clears the error and announces success.

## Verification Evidence

- Android build: `BUILD SUCCESSFUL` for `assembleDebug`.
- Typecheck: `npx tsc --noEmit` completed successfully.
- Targeted tests: `npx jest __tests__/PlaudService.test.ts` passed.

## Remaining Gaps (Before Production)

1. **Runtime Google setup (required for real account sync)**
   - Add `android/app/google-services.json` generated from Firebase/Google project tied to `com.sparkadhd`.
   - Confirm Android OAuth client SHA-1/SHA-256 (debug + release keystores) are registered.
   - Set `REACT_APP_GOOGLE_WEB_CLIENT_ID` (and iOS equivalent if needed in this build environment).

2. **On-device validation still required**
   - Confirm first-run microphone permission UX on physical Android device.
   - Confirm overlay permission request and bubble launch UX on Android 13/14.
   - Confirm offline behavior end-to-end (transcription failure messaging, sync retry expectations).

3. **Toolchain warning cleanup (non-blocking)**
   - NDK/SDK warning `CXX5304` appears during native configure steps.
   - Build succeeds, but Android SDK command-line tools and Android Studio versions should be aligned.
