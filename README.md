# ADHD-CADDI - Web App and React Native

A behavioral activation tool for ADHD, designed primarily for the browser with an optional React Native mobile bridge.

> [!IMPORTANT]
> Primary workflow: most development should happen in the web path. It gives the full app experience in a browser and is the main deployment target.

## Deployment Status

- Live web app: [https://daytimeblues.github.io/ADHD-CADDI/](https://daytimeblues.github.io/ADHD-CADDI/)
- Production deploy path: push reviewed changes to `main` and let `.github/workflows/pages.yml` publish GitHub Pages
- Android verification path: `.github/workflows/android.yml` builds debug and release APK artifacts on CI

## Features

- Ignite: 5-minute focus timer with brown noise
- Fog Cutter: break overwhelming tasks into micro-steps
- Pomodoro: classic Pomodoro technique
- Anchor: breathing exercises
- Check In: mood and energy tracking
- Brain Dump: quick capture for racing thoughts
- Calendar: simple monthly view
- Cosmic Theme: default deep-space visual treatment

## Getting Started (Web)

This is the recommended way to run and test the app.

Offline/PWA status: the app is currently web-first and online-first. Service worker registration is intentionally disabled, so treat the deployed site as an online web app rather than a supported PWA or offline surface.

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

### Running Checks

```bash
# Unit tests
npm test

# Lint and type-check
npm run lint
npx tsc --noEmit

# Browser smoke test
npm run e2e:smoke

# Lightweight admin checks
npm run admin:check
```

### Deploying

```bash
git push origin main
```

`npm run deploy` still exists as a manual `gh-pages` helper, but the production site now deploys through the GitHub Actions Pages workflow instead of that script.

### Branch Workflow

1. Create a branch from `main`.
2. Run local checks.
3. Push the branch for review.
4. Merge to `main` only when ready for CI and Pages deployment.

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
- Deployment: GitHub Pages

## Config and Operations

- Public client config lives in `EXPO_PUBLIC_*` variables.
- Real secrets must stay on the server side.
- Direct client-side AI providers are for development/staging only and stay blocked for production builds.
- Admin checks are documented in [docs/ops-admin.md](docs/ops-admin.md).

## Dependency Policy

This repo does not fully pin every dependency version yet. The lockfile is the main reproducibility control, and some packages intentionally use semver ranges such as `^`.

## License

MIT
