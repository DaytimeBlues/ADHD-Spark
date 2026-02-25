# AGENTS.md — Spark ADHD (React Native)

Coding-agent reference for the `spark-adhd` React Native app.
Current branch: `ui-ux-redesign` (Cosmic theme active).

---

## Repository Structure

```bash
spark-adhd/
├── src/
│   ├── screens/        # One file per feature screen (PascalCase)
│   ├── components/     # Reusable UI: home/, metro/, ui/
│   ├── ui/cosmic/      # Cosmic-theme primitive components
│   ├── services/       # StorageService, SoundService, OverlayService, etc.
│   ├── hooks/          # useTimer, useReducedMotion
│   ├── theme/          # Tokens, ThemeProvider, variant types
│   ├── navigation/     # AppNavigator, routes, navigationRef
│   └── config/         # caddi.ts, secrets.example.ts
├── __tests__/          # Jest unit & component tests (*.test.ts/tsx)
│   ├── __mocks__/      # Module mocks (reanimated, etc.)
│   ├── detox/          # Native E2E specs (run separately)
│   └── setup.ts        # Global test setup
├── android/            # Native Android module
├── e2e/                # Playwright web E2E tests
└── scripts/            # Utility shell scripts
```

---

## Commands

### Development

```bash
npm start                        # Metro bundler
npm run android                  # Run on Android device/emulator
npm run web                      # Webpack dev server
npm run build:web                # Production web build
```

### Testing

```bash
npm test                         # All Jest tests
npm run test:watch               # Jest in watch mode
npm run test:coverage            # Coverage report

# Run a SINGLE test file:
npx jest __tests__/HomeScreen.test.tsx

# Run a SINGLE test by name:
npx jest --testNamePattern="renders without crashing" __tests__/HomeScreen.test.tsx

# E2E (Playwright - web):
npm run e2e
npm run e2e:ui                   # Interactive UI mode

# E2E (Detox - Android native):
npm run test:e2e:android
```

### Lint & Type-check

```bash
npm run lint                     # ESLint across entire project
npx tsc --noEmit                 # Type-check without emitting
```

### Android Builds

```bash
npm run build:android            # Debug APK
npm run build:android:prod       # Release APK
npm run install:android:dev      # Build & install debug on device
```

---

## TypeScript

- **Config**: `tsconfig.json` extends `@react-native/typescript-config`
- **Strict mode**: `strict: true` — no `any` shortcuts
- **Path alias**: `@/*` → `src/*` (e.g. `import Foo from '@/components/Foo'`)
- **typeRoots**: `./types` then `node_modules/@types`
- Never use `as any`, `@ts-ignore`, or `@ts-expect-error`
- Prefer explicit return types on exported functions and hooks
- Use `interface` for object shapes, `type` for unions/aliases

---

## Code Style

### Imports (order)

1. React (`import React, { ... } from 'react'`)
2. React Native core (`View`, `Text`, `StyleSheet`, …)
3. Third-party libraries (`@react-navigation/...`, `expo-av`, …)
4. Internal absolute imports via alias (`@/services/...`, `@/theme/...`)
5. Relative imports (`../services/...`, `./styles`)

### Formatting (Prettier)

- **Single quotes** for strings
- `endOfLine: 'auto'` (CRLF on Windows is acceptable)
- Enforced via `eslint-plugin-prettier` — run lint before committing

### Components

- Functional components only — no class components
- Name files and components in **PascalCase** (`HomeScreen.tsx`, `GlowCard.tsx`)
- Export components as **named exports** where possible; screens use default exports
- Props interfaces named `<ComponentName>Props`

### Naming

| Entity | Convention | Example |
| :--- | :--- | :--- |
| Files (components/screens) | PascalCase | `FogCutterScreen.tsx` |
| Files (services/hooks/utils) | camelCase | `StorageService.ts`, `useTimer.ts` |
| Variables & functions | camelCase | `handlePress`, `isLoaded` |
| Constants (module-level) | UPPER_SNAKE_CASE | `ANIMATION_DURATION` |
| Types / Interfaces | PascalCase | `ThemeVariant`, `ModeCardMode` |
| Route names | UPPER_SNAKE_CASE string consts | `ROUTES.HOME` |

### Async / Error Handling

- Always `async/await` — never raw `.then()` chains
- Wrap async operations in `try/catch`; log errors with `console.error('[Module] message:', error)`
- Never use empty catch blocks `catch(e) {}`
- Async effects use a mounted-guard pattern: `let isMounted = true; return () => { isMounted = false; }`

---

## Theme System

Two variants: **`linear`** (monochrome/sharp) and **`cosmic`** (deep space, default).

```ts
// Consuming theme in a component:
import { useTheme } from '@/theme/ThemeProvider';
const { t, isCosmic, variant } = useTheme();
<View style={{ backgroundColor: t.colors.neutral.darkest }} />
```

- All spacing, color, typography, radii, elevation → **tokens only**. Never hard-code hex or px values.
- Linear tokens: `src/theme/linearTokens.ts`
- Cosmic tokens: `src/theme/cosmicTokens.ts`
- Barrel export: `src/theme/tokens.ts`
- Cosmic UI primitives (`CosmicBackground`, `GlowCard`, `RuneButton`, `HaloRing`, `ChronoDigits`) live in `src/ui/cosmic/`

---

### Services & Hooks

| Service / Hook | Purpose | Note |
| :--- | :--- | :--- |
| `StorageService` | AsyncStorage wrapper | Use `STORAGE_KEYS` constants; never call AsyncStorage directly |
| `SoundService` | Native audio | Platform file: `SoundService.web.ts` for web |
| `OverlayService` | Android system overlay | Requires manifest permission |
| `ActivationService` | Session tracking | Source of truth for streaks/completions |
| `RetentionService` | Re-entry prompts | Returns `ReentryPromptLevel` |
| `useTimer` | Shared countdown/up timer | Reuse instead of inline `setInterval` |
| `useReducedMotion` | Respects a11y preference | Check before running animations |

---

## Testing Conventions

- All Jest tests live under `__tests__/` — the Jest config (`testMatch`) only picks up files there
- Test files: `<Subject>.test.ts` or `<Subject>.test.tsx`
- Use `@testing-library/react-native` (`render`, `screen`, `fireEvent`, `waitFor`, `act`)
- Mock all services with `jest.mock(...)` using `__esModule: true` + `default:` pattern (see `HomeScreen.test.tsx`)
- Never use real `AsyncStorage` in tests — always mock `StorageService`
- Detox specs (`__tests__/detox/`) run via `npm run test:e2e:android`, never via Jest
- Coverage thresholds enforced for `helpers.ts`, `StorageService.ts`, `useTimer.ts` (≥90%)

---

## Platform & Web Compatibility

- Guard web-only styles: `if (Platform.OS === 'web') { ... }`
- Use `.web.ts` platform extension files for web-specific implementations
- Metro bundler resolves platform extensions automatically
- Web bundle entry: `index.web.js` → webpack; native entry: `index.js` → Metro

---

## Android Specifics

- **minSdkVersion**: 26 | **targetSdkVersion**: 34
- Release signing uses env vars: `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` — never hardcode
- Overlay permission required in `AndroidManifest.xml` for `OverlayService`
- Build via Gradle: `cd android && gradlew.bat assembleDebug`

---

## Anti-Patterns — Never Do These

- ❌ Add hex colors or spacing values outside token files
- ❌ Call `AsyncStorage` directly — use `StorageService`
- ❌ Duplicate timer logic — use `useTimer`
- ❌ Use `as any`, `@ts-ignore`, or `@ts-expect-error`
- ❌ Place Jest tests outside `__tests__/`
- ❌ Run Detox specs through Jest
- ❌ Hardcode signing credentials in Gradle files
- ❌ Loosen `network_security_config.xml` beyond local dev hosts
- ❌ Commit without running `npm run lint` and `npx tsc --noEmit`
