# Android Build & QA Test Plan

## Dependency Matrix
| Area | Dependency | Version | Notes |
| --- | --- | --- | --- |
| React Native | com.facebook.react:react-android | From React Native Gradle plugin | AndroidX-based; no legacy support libs.
| Hermes | com.facebook.react:hermes-android | From React Native Gradle plugin | Enabled via `hermesEnabled`.
| Google Auth | com.google.android.gms:play-services-auth | 21.2.0 | AndroidX-based; compatible with compileSdk 34.
| UI Tests | androidx.test.ext:junit | 1.1.5 | Instrumentation test framework.
| UI Tests | androidx.test.espresso:espresso-core | 3.5.1 | UI interaction framework.
| UI Tests | androidx.test:rules | 1.5.0 | Test rules for ActivityScenario.
| UI Tests | androidx.test:runner | 1.5.2 | Instrumentation runner.

## Required Gradle Tasks
- `./gradlew clean`
- `./gradlew assembleDebug`
- `./gradlew testDebugUnitTest`
- `./gradlew connectedDebugAndroidTest`

## Device/Emulator Requirements
- API 34 emulator (x86_64), Google APIs image.
- Hardware acceleration enabled in CI (KVM on Linux runners).

## Espresso Test Coverage
- **Launch**: MainActivity launches successfully.
- **Interaction**: Main action button is displayed and clickable.
  - UI requirement: set `accessibilityLabel="main-action-button"` on the main button in React Native to satisfy the test.

## Notes
- Ensure `android.useAndroidX=true` is present in `gradle.properties`.
- If Firebase/Google Services are added later, include `google-services.json` or CI injection.
