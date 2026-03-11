# Historical Reports

This folder contains stale review and generated diagnostic artifacts that were previously in the repository root.

## Contents

- **CODEBASE_REVIEW.md** - Historical codebase review retained for context only
- **lint_errors.txt**, **lint_errors_utf8.txt** - Old lint error logs
- **tsc_errors.txt**, **tsc_errors_utf8.txt** - Old TypeScript error logs
- **build_errors.txt**, **build_errors2.txt**, **build_errors3.txt**, **build_log.txt** - Old web build logs
- **android_build_debug.log**, **android_build_debug_after_clean.log**, **android_build_after_builddir_fix.log** - Old Android build logs
- **pw_log.txt**, **pw_log_utf8.txt** - Old Playwright logs
- **eslint2.txt** - Old ESLint output
- **test_output.raw.txt**, **test_prompt.txt** - Debug artifacts

## How To Use This Folder

- Treat every file here as historical output, not as the current state of the repo.
- Check `package.json` for the current scripts and `.github/workflows/` for current automation.
- If you need to know whether a check passes today, run the command again instead of trusting an archived log.
