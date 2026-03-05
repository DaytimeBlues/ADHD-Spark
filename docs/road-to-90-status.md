# Road to 90 Status

Last updated: 2026-03-05

## Target

- Technical score: `>= 90/90`
- Product score: `>= 90/100`

## Stream status

- `W1` Tests + Coverage: **IN PROGRESS (implemented on integration branch)**
  - Added tests for `TasksScreen`, `OAuthService`, `OAuthService.web`, `GoogleAuthService`, `LoggerService`.
  - Coverage threshold ratcheted to:
    - branches `40`
    - functions `50`
    - lines `55`
    - statements `55`
- `W2` Accessibility + UX Tokens: **EXTERNAL LLM**
- `W3` Reliability + Security: **EXTERNAL LLM**
- `W4` Architecture Splits: **EXTERNAL LLM**
- `W5` CI + Docs + Hygiene: **IN PROGRESS (implemented on integration branch)**
  - Added unified quality-gate scripts.
  - Added bundle budget check.
  - Untracked diagnostic artifact files.
  - Added architecture docs + ADRs + contributing guide.

## Integration policy

1. External workers push to feature branches only.
2. Merge order:
   - `W1 -> W3 -> W2 -> W5 -> W4`
3. Merge to `main` only from `codex/road-to-90-integration` after gate pass.

## Current blocker

- `e2e:smoke` instability from webpack startup latency (Playwright web server timeout). Timeout was increased to `600s` in `playwright.config.ts`.
