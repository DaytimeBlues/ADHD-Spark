# ADHD-CADDI - React Native and Android

> [!IMPORTANT]
> Active release path: Android is the authoritative deployment and verification target. Web tooling remains available for local/shared development, but GitHub Pages is not the production release path.

## Deployment Status

- Release verification path: `.github/workflows/android.yml` builds debug and release APK artifacts on CI
- Local install paths: `npm run install:android:dev` and `npm run install:android:preview`
- Web remains available as a local development surface via `npm run web`

## Features

- Ignite: 5-minute focus timer with brown noise
- Fog Cutter: break overwhelming tasks into micro-steps
- Pomodoro: classic Pomodoro technique
- Anchor: breathing exercises
- Check In: mood and energy tracking
- Brain Dump: quick capture for racing thoughts
- Calendar: simple monthly view
- Theme variants: Linear, Cosmic, and Night Awe

## Getting Started (Web)

Use this for local development and shared UI iteration.

Offline/PWA status: web remains a local development surface and is still online-first. Service worker registration is intentionally disabled, so do not treat web as a supported offline/PWA release surface.

### Prerequisites

- Node.js 20

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run web
```

The app will be available at `http://localhost:3000`.

Useful direct routes during web development:

- Diagnostics: `http://localhost:3000/diagnostics`
- Pomodoro: `http://localhost:3000/pomodoro`

### Running Checks

```bash
# Unit tests
npm test

# Lint and type-check
npm run lint
npx tsc --noEmit

# Lightweight admin checks
npm run admin:check
```

### Branch Workflow

1. Create a branch from `main`.
2. Run local checks.
3. Push the branch for review.
4. Merge to `main` only when ready for Android CI verification.

If the change is isolated or experimental, do not push directly to `main`.

## Advanced: Native Android

The native Android shell is a secondary wrapper used for platform-specific features like system-wide overlays. Android Studio is not required for general web or shared-feature development.

### Extras in Native Mode

- Floating Menu (Android): an expandable quick-action menu that floats over other apps

### Native Setup

1. Install JDK 17 and Android Studio.
2. `npm install`
3. `npm run android:clean`
4. `npm run android`

### Android Phone-Only Deployment

If you only want to run the app on your own Android phone, use these local profiles.

```bash
# Development profile (fastest, debuggable)
npm run install:android:dev

# Preview profile (release-like, installable without release keystore)
npm run install:android:preview

# Production profile (requires release keystore env vars)
npm run build:android:prod
```

Profile package IDs:

- Dev: `com.adhdcaddi`
- Preview: `com.adhdcaddi.preview`
- Production: `com.adhdcaddi`

### Backend Options for Personal Use

- Default API endpoint is `https://spark-adhd-api.vercel.app`
- If the API is unavailable, core app flows still work; AI sorting shows a graceful error
- For a zero-cloud personal workflow, use the local features and avoid AI sort

### Native Tests

```bash
# UI tests (requires emulator)
npm run test:e2e:android
```

## Tech Stack

- Framework: React Native Web plus React Native
- Logic: TypeScript
- State/Storage: AsyncStorage
- Testing: Jest plus Playwright
- Release verification: Android CI / local Android install flows

## Config and Operations

- Public client config lives in `EXPO_PUBLIC_*` variables.
- Real secrets must stay on the server side.
- Direct client-side AI providers are for development/staging only and stay blocked for production builds.
- Admin checks are documented in [docs/ops-admin.md](docs/ops-admin.md).

## Dependency Policy

This repo does not fully pin every dependency version yet. The lockfile is the main reproducibility control, and some packages intentionally use semver ranges such as `^`.

## License

MIT
