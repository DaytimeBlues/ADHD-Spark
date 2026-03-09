# Android APK Release Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Android `APK-ready` status explicit and trustworthy through CI contract hardening, explicit signing boundaries, and aligned documentation.

**Architecture:** Strengthen the existing Android workflow, verifier, app bootstrap marker, and release docs instead of replacing the pipeline.

**Tech Stack:** GitHub Actions, Bash, React Native, Android Gradle, Jest, Markdown docs

---

## Status Update

Completed:

- Task 1: formalized the release smoke contract in tests, workflow naming, and verifier checks
- Task 2: added the in-app `APP_READY` marker from `App.tsx`
- Task 3: added signed sideload helper and signing-boundary tests
- Task 4: aligned release docs, tech spec, audit, and test matrix

Verification completed:

- focused Android contract tests pass
- TypeScript `npx tsc --noEmit` passes
- `npm run admin:android-health` passes

Open follow-up:

- `npm run lint` still fails on pre-existing repo-wide warnings outside this batch
- no merge to `main` yet, so GitHub Pages remains unchanged

## Next Session Checklist

1. Review `docs/ANDROID_AUDIT_2026-03-09.md`
2. Review current branch diff
3. Decide whether to fix repo-wide lint warnings or document them as pre-existing
4. Commit branch changes
5. Push `codex/android-apk-release`
6. Merge to `main` if approved
7. Confirm GitHub Actions and, after merge, GitHub Pages state
