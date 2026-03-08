# Ops and Admin Commands

These commands are the lightweight operator checks for this repo. They are not a full deployment platform. They are simple health checks you can run before shipping changes or when investigating a problem.

## Commands

- `npm run admin:config-check`
  - Checks the public runtime config shape.
  - Fails if the API URL is invalid or `.env.example` is missing the config labels.
- `npm run admin:storage-status`
  - Shows the current storage schema version and the migration IDs defined in code.
  - Useful when you need to confirm whether storage migrations changed.
- `npm run admin:backup-check`
  - Verifies that backup schema constants and the backup timestamp storage key are still wired correctly.
- `npm run admin:web-health`
  - Confirms the expected web build and smoke-test entrypoints exist.
- `npm run admin:android-health`
  - Confirms the Android health-check entrypoints exist.
  - On Windows, follow with `scripts/check_android_health.bat` for the actual SDK and Gradle check.

## When To Run Them

- Before a release candidate build
- After changing config handling
- After changing storage, backup, or diagnostics code
- When onboarding a new machine or CI environment

## Success and Failure

- Exit code `0` means the check passed.
- Non-zero means the command found a problem worth fixing before you rely on that area.
- Warnings explain degraded-but-usable setups, such as optional Google config being absent.

## Dependency Policy

This repo currently uses a mixed dependency policy:

- some packages are exact versions
- many packages use semver ranges with `^`

That is intentional for now. The lockfile remains the main reproducibility control, and a future pass can tighten runtime dependency pinning if install drift becomes a real problem.
