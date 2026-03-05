# Contributor Workflow

## Branching

1. Create feature branches from `main` using `codex/*` naming.
2. For multi-stream work, use dedicated stream branches and merge into
   `codex/road-to-90-integration` first.
3. Merge to `main` only from a green integration branch.

## Required Local Gate

Run this before opening or updating a PR:

```bash
npm run quality:gate
```

This runs:

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm test -- --runInBand --coverage`
4. `npm run build:web`
5. `npm run check:bundle-size`
6. `npm run e2e:smoke`

## Coverage Policy

Current enforced global threshold (Step A):

1. Branches: `45`
2. Functions: `50`
3. Lines: `55`
4. Statements: `55`

If coverage cannot be raised safely in the current sprint, do not lower
thresholds. Track deltas in `docs/road-to-90-status.md`.

## Logging and Error Contract

1. Use `LoggerService.{info|warn|error}` for operational logging.
2. Include payload shape:
   - `service`
   - `operation`
   - `message`
   - optional `error`
   - optional `context`
3. Avoid bare `catch {}` and silent `.catch(() => ...)` in app logic.

## UI and Accessibility Contract

1. Use semantic theme tokens, not hardcoded accent colors.
2. Shared interactive controls must meet `44px` minimum hit targets.
3. Web focus states must remain visible for keyboard navigation.

## Architecture Contract

1. Keep screens primarily declarative.
2. Move side effects and orchestration into hooks/services.
3. No critical flow file should exceed `450` lines after refactors.
