# Architecture Overview

## Runtime layers

1. Presentation
- Screen components under `src/screens`.
- Shared UI primitives under `src/components` and `src/ui`.
- Theme-driven styling through token sets and `useTheme`.

2. Domain/state
- Zustand stores under `src/store` for app state (tasks, timer, capture, theme).
- Hooks under `src/hooks` orchestrate UI behavior and side effects.

3. Services/integration
- Service boundary under `src/services` for:
  - storage
  - network/API
  - auth/oauth
  - sync/orchestration
  - logging

4. Platform abstraction
- Shared platform helpers under `src/utils/PlatformUtils`.
- `.web.ts` service variants where behavior diverges significantly.

## Design constraints

- Keep screens mostly declarative: render + hook composition.
- Keep side effects in hooks/services, not inline in presentation components.
- Prefer semantic theme tokens over hardcoded values.
- Route operational logging through `LoggerService` only.

## Quality gates

- Local/CI gate command:
  - `npm run quality:gate`
- Core gate without E2E:
  - `npm run quality:gate:core`
- Bundle budget check:
  - `npm run check:bundle-size`

## Ongoing refactor targets

- Reduce oversized modules (`>450` lines) through hook/service extraction.
- Remove remaining silent-failure catch patterns.
- Increase branch coverage to support 90/90 technical score.
