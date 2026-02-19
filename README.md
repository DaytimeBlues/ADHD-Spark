# Spark ADHD - PWA & React Native

A behavioral activation tool for ADHD, designed as a high-performance **PWA (Progressive Web App)** with an optional React Native mobile bridge.

> [!IMPORTANT]
> **Primary Workflow**: Most developers should use the **Web/PWA** version. It provides the full app experience through any mobile browser and can be "Installed" as a standalone app on your home screen.

## Deployment Status

- **Live PWA**: [https://DaytimeBlues.github.io/spark-adhd-backup](https://DaytimeBlues.github.io/spark-adhd-backup)

## Features

- **Ignite** - 5-minute focus timer with brown noise
- **Fog Cutter** - Break overwhelming tasks into micro-steps
- **Pomodoro** - Classic Pomodoro technique (25/5)
- **Anchor** - Breathing exercises (4-7-8, Box, Energize)
- **Check In** - Mood and energy tracking with recommendations
- **Brain Dump** - Quick capture for racing thoughts with AI-powered sorting suggestions
- **Security** - Built-in security checklist and secret scanning (gitleaks) support
- **Calendar** - Simple monthly view

## Getting Started (Web/PWA)

This is the recommended way to run and test the app.

### Prerequisites

- Node.js 18+

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run web
```

The app will be available at `http://localhost:3000`.

### Running Tests

```bash
# Verify JavaScript "Brain" logic
npm test

# E2E Browser Testing (Mobile emulation)
npm run e2e
```

### Deploying

```bash
npm run deploy  # Pushes to GitHub Pages
```

---

## 🚀 Advanced: Native Android (Future Option)

The native Android shell is a secondary wrapper used for platform-specific features like system-wide overlays. **Android Studio is NOT required for general feature development.**

### Extras in Native Mode

- **Floating Menu (Android)** - An expandable quick-action chat-head style menu that floats over other apps for rapid access to core features.

### Native Setup (If needed)

1. Install JDK 17 and Android Studio.
2. `npm install`
3. `cd android && ./gradlew clean`
4. `npm run android`

### Android Phone-Only Deployment (No Store)

If you only want to run Spark on your own Android phone, use the local profiles below.

1. Connect phone with USB debugging enabled.
2. Build/install one of the profiles:

```bash
# Development profile (fastest, debuggable)
npm run install:android:dev

# Preview profile (release-like, installable without release keystore)
npm run install:android:preview

# Production profile (requires release keystore env vars)
npm run build:android:prod
```

Profile package IDs:

- Dev: `com.sparkadhd.dev`
- Preview: `com.sparkadhd.preview`
- Production: `com.sparkadhd`

### Backend Options for Personal Use

- Default API endpoint is `https://spark-adhd-api.vercel.app` (used for AI sorting).
- If the API is unavailable, core app flows still work; AI sort shows a graceful error.
- For a zero-cloud personal workflow, avoid AI sort and use local features (timers, notes, check-in, routines).

### Native Tests

```bash
# UI Tests (Requires Emulator)
npm run test:e2e:android
```

## Tech Stack

- **Framework**: React Native Web (allows single codebase for PWA + Native)
- **Logic**: TypeScript
- **State/Storage**: AsyncStorage
- **Testing**: Jest + Playwright (E2E)
- **Deployment**: GitHub Pages

## License

MIT
