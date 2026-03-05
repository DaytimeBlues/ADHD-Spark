# Road to 90 Status

Last updated: 2026-03-05

## Locked targets

- Technical score: `>= 90/90`
- Product score: `>= 90/100`

## Stream completion

- `W1` Tests + Coverage: **DONE**
  - Expanded tests for `TasksScreen`, `OAuthService`, `OAuthService.web`, `GoogleAuthService`, `LoggerService`.
  - Raised Jest global branches threshold from `40` to `45` (Step A ratchet in progress).
- `W2` Accessibility + UX Tokens: **MERGED**
- `W3` Reliability + Security: **MERGED**
- `W4` Architecture Splits: **MERGED**
  - Confirmed line counts after split:
    - `src/components/capture/CaptureDrawer.tsx`: `166`
    - `src/screens/InboxScreen.tsx`: `134`
    - `src/screens/CalendarScreen.tsx`: `148`
    - `src/services/GoogleSyncOrchestrator.ts`: `429`
- `W5` CI + Docs + Hygiene: **DONE**
  - Added unified `quality:gate`.
  - Added bundle budget check and CI enforcement.
  - Removed tracked diagnostic artifacts.
  - Added contributor workflow docs.

## Gate evidence (integration branch)

- `npm run quality:gate`: **PASS**
- `npm run lint`: **PASS** (warnings only)
- `npx tsc --noEmit`: **PASS**
- `npm test -- --runInBand --coverage`: **PASS**
- `npm run build:web`: **PASS** (webpack size warnings remain)
- `npm run check:bundle-size`: **PASS** (`4582.9KB` total, `761.5KB` largest under `5000/800` limits)
- `npm run e2e:smoke`: **PASS**

## Hotspot delta vs baseline

- Hardcoded `#8B5CF6`: `69 -> 64` (`51` still in `src` outside theme/test files)
- Files over 400 lines: `18 -> 13`
- Bare `catch {}` blocks in `src`: `15 -> 5`
- Silent `.catch(() => ...)` patterns in `src`: `8 -> 6`
- Tracked diagnostic artifacts in git: `10 -> 0`

## Current score snapshot

- Technical score: `74/90`
- Product score: `70/100`

Status: improved substantially, but still below locked release targets.
