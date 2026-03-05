# Road to 90 Baseline (2026-03-05)

This document captures the baseline before Road-to-90 execution.

## Gate command baseline

- `npm run lint`: pass, `0` errors, `44` warnings.
- `npx tsc --noEmit`: pass.
- `npm test -- --runInBand --coverage`: pass.
- `npm run build:web`: pass, webpack performance warnings.
- `npm run e2e:smoke`: fail, Playwright webServer timeout at `300000ms`.

## Coverage baseline

- Lines: `50.55%`
- Statements: `50.22%`
- Functions: `48.94%`
- Branches: `37.87%`

## Product score baseline (100-point rubric)

- UX & Design Psychology: `14/20`
- Performance & Efficiency: `10/20`
- Accessibility & Inclusivity: `14/20`
- Architecture & Code Health: `10/20`
- Security / Reliability: `15/20`
- Total: `63/100`

## Technical score baseline (90-point rubric)

- Test Suite: `7/10`
- Test Coverage: `5/10`
- Architecture / SRP: `4/10`
- Error Handling: `7/10`
- Platform Abstraction: `6/10`
- Repo Hygiene: `5/10`
- Documentation: `4/10`
- CI / Tooling: `6/10`
- Build & Dev Env: `6/10`
- Total: `50/90`

## Baseline hotspot counts

- Hardcoded `#8B5CF6`: `69`
- Files over 400 lines: `18`
- Bare `catch {}` blocks: `15`
- Silent `.catch(() => ...)` patterns: `8`
- Tracked diagnostic artifacts in git: `10`
