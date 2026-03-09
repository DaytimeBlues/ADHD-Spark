# Release Process and Rollback Strategy

## Release Workflow

### Pre-Release Checklist

**Code Quality:**

- [ ] All tests passing (`npm test`, `npm run e2e`)
- [ ] Lint clean (`npm run lint`)
- [ ] No console errors in development build
- [ ] TypeScript compilation successful (`tsc --noEmit`)

**Functional Validation:**

- [ ] Core user flows tested manually (web + Android if applicable)
- [ ] No regressions in existing features
- [ ] New features documented in `CHANGELOG.md`

**Dependency Audit:**

- [ ] Run `npm audit` and address critical vulnerabilities
- [ ] Verify no deprecated dependencies blocking build

---

## Web/PWA Release (Primary)

### GitHub Pages Deployment

**Current source of truth: push to `main`**

1. **Prepare and validate the release candidate on a branch first:**

   ```bash
   git checkout -b fix/my-change
   npm run lint
   npx tsc --noEmit
   npm test -- --runInBand
   npm run e2e:smoke
   git push origin fix/my-change
   ```

2. **Merge to main branch:**

   ```bash
   git checkout main
   git merge feature-branch
   git push origin main
   ```

3. **Wait for the Pages workflow to finish:**

   - Workflow: `.github/workflows/pages.yml`
   - URL: `https://daytimeblues.github.io/ADHD-CADDI/`
   - Expected jobs: quality gates, web E2E smoke, build, deploy, post-deploy validation

4. **Confirm the deployed site matches the latest `main` release commit.**

**Validation:**

- Open deployed URL in browser
- Test core features (Ignite, Fog Cutter, etc.)
- Test at least one direct route reload, such as `https://daytimeblues.github.io/ADHD-CADDI/tasks`
- Check browser console for errors
- Verify service worker updates (if PWA)

**Rollback:**

```bash
# Revert the bad change on main, then let Pages redeploy
git checkout main
git log  # Find the bad commit or last good point
git revert <commit-hash>
git push origin main
```

---

## Android Native Release (Secondary)

### Android Release Status

`CI release smoke`

- Means the CI-built release APK uses CI smoke signing, launches successfully, reports `APP_READY`, and remains alive in the emulator.
- It is not a production-signed artifact.

`sideload release`

- Means a keystore-signed APK can be built with the documented sideload path.
- The output is a keystore-signed APK intended for tester handoff, not Play Store publishing.

### Prerequisites

- JDK 17 installed and `JAVA_HOME` set (see `docs/ANDROID_BUILD_BLOCKERS.md`)
- Local `android/app/google-services.json` present (or provisioned by CI)
- For production release builds only: keystore file present at `android/app/release.keystore`
- Environment variables set:
  ```bash
  export KEYSTORE_PASSWORD=<your-password>
  export KEY_ALIAS=<your-alias>
  export KEY_PASSWORD=<your-key-password>
  ```

### Build Sideloadable APKs

GitHub Actions already performs two useful Android checks on `main`:

- `Android Build and E2E Tests`: installs dependencies, runs Jest, assembles debug, uploads debug APK and reports
- `Android Release Build Check`: assembles a release APK with CI smoke signing and verifies that it launches in an emulator, reports `APP_READY`, and remains alive long enough to count as app-shell-ready

**Preview APK (recommended for direct install / non-Play-Store testing):**

```bash
npm run build:android:preview

# Output: android/app/build/outputs/apk/preview/
```

**Release APK (signed sideload release):**

```bash
npm run build:android:sideload

# Output: android/app/build/outputs/apk/sideload/adhd-caddi-<versionName>+<versionCode>-<buildTag>.apk
```

This path produces a keystore-signed APK when the required keystore environment variables are present.
It is the documented sideload release path.

### Build Release AAB (Google Play)

```bash
cd android
./gradlew :app:bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Version Bumping

**Before building:**

1. Update `android/app/build.gradle`:

   ```gradle
   versionCode 2  // Increment by 1
   versionName "1.1.0"  // Follow semver
   ```

2. Update `package.json`:

   ```json
   "version": "1.1.0"
   ```

3. Tag release:
   ```bash
   git tag -a v1.1.0 -m "Release 1.1.0"
   git push origin v1.1.0
   ```

### Distribution

**Direct install / sideload:**

- USB install from local machine
- Share keystore-signed APK artifacts from the sideload path for tester installs
- Use the `preview` build for easiest install without release keystore distribution

**Internal Testing:**

- Upload APK to Firebase App Distribution
- Share link with testers via email

**Google Play Store:**

1. Upload AAB to Play Console
2. Create release in "Internal Testing" track
3. Promote to "Production" after validation

### Android Release Checklist

Future agents and engineers should follow this order:

1. read current Android audit
2. inspect latest Android CI run
3. run local health checks if touching native code
4. update the audit after changes

### Phase 2: Non-APK Work

- Google Play publishing
- Play Console rollout steps
- automated signed-release distribution
- expanded device certification matrix

**Rollback (Google Play):**

- Halt rollout at any percentage
- Revert to previous version in Play Console
- Google serves old APK to new installs

---

## Rollback Decision Tree

```
Production Issue Detected
        |
        v
    Critical?  (Crashes, data loss, security)
     /    \
   YES     NO
    |       |
    v       v
Rollback  Monitor
Immediately  (Fix in next release)
```

**Critical Issues:**

- App crashes on launch
- Data corruption
- Security vulnerability
- Feature completely broken for >50% users

**Non-Critical:**

- UI glitch affecting <10% users
- Performance regression <20%
- Non-blocking feature bug

---

## Monitoring Post-Release

### Web Metrics (via Analytics)

If Google Analytics or similar integrated:

- Page load time
- JavaScript errors
- User flow drop-offs

**Manual checks (first 24 hours):**

- Browser console errors (Chrome DevTools)
- Network tab for failed requests
- Lighthouse audit score

### Android Metrics

**Google Play Console:**

- Crash rate (target: < 0.5%)
- ANR rate (target: < 0.1%)
- Uninstall rate
- User reviews/ratings

**Firebase Crashlytics (if integrated):**

- Top crashes by occurrence
- Affected devices/OS versions

---

## Hotfix Process

**When rollback isn't immediate option:**

1. **Create hotfix branch:**

   ```bash
    git checkout main
    git checkout -b hotfix/critical-bug-fix
   ```

2. **Apply minimal fix** (no refactoring, no scope creep)

3. **Test hotfix:**

   ```bash
   npm test
   npm run e2e
   ```

4. **Fast-track merge:**

   ```bash
    git checkout main
    git merge hotfix/critical-bug-fix
    git push origin main
   ```

5. **Deploy immediately** (web via Actions, Android via manual build)

6. **Backport to feature branches if needed**

---

## Communication Protocol

### User-Facing Issues

**Severity 1 (Critical):**

- Post banner on app homepage
- Email notification (if user base has emails)
- Social media update

**Severity 2 (Major):**

- In-app notice on next launch
- GitHub release notes

**Severity 3 (Minor):**

- Mentioned in changelog only

### Internal Team

**Slack/Discord:**

- `#releases` channel for deploy notifications
- `#incidents` channel for critical issues

**GitHub:**

- Create issue for post-mortem
- Tag with `incident` label
- Assign to release manager

---

## Versioning Strategy

Follow **Semantic Versioning (semver):**

- `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)

**Rules:**

- `MAJOR`: Breaking changes (e.g., storage schema incompatibility)
- `MINOR`: New features (backward compatible)
- `PATCH`: Bug fixes only

**Pre-release tags:**

- `1.2.0-beta.1` for beta testing
- `1.2.0-rc.1` for release candidates

---

## Changelog Maintenance

**Update `CHANGELOG.md` BEFORE merging to main:**

```markdown
## [1.2.0] - 2026-02-15

### Added

- Typed navigation constants for route safety
- Environment-based config for API URLs
- Storage schema versioning system

### Fixed

- Android SDK 34 foreground service compliance
- Overlay permission flow AppState sync

### Changed

- Updated overlay UX copy for clarity
```

**Categories:**

- `Added` - new features
- `Changed` - changes to existing features
- `Deprecated` - soon-to-be-removed features
- `Removed` - removed features
- `Fixed` - bug fixes
- `Security` - vulnerability patches

---

## Disaster Recovery

**If main branch corrupted:**

```bash
# Create a restore branch from the last known good commit
git checkout -b restore/<date> <last-good-commit-hash>
# Open a PR back to main or coordinate an administrative restore
```

**If production data lost (AsyncStorage):**

- No server-side backups (local-first app)
- Guide users to re-enter data
- Communicate issue transparently

**If keystore lost (Android):**

- **CRITICAL:** Cannot update existing Play Store app
- Must create new app listing with new package name
- Migrate users via in-app notice

**Prevention:**

- Store keystore in encrypted password manager
- Document keystore password in team vault
- Keep backup keystore in secure offline storage

---

## Automation Opportunities

**Current State:** Workflow-driven Pages deploys from `main`; Android artifacts are built in GitHub Actions and locally via Gradle/package scripts

**Future Enhancements:**

- **CI/CD for Android:** GitHub Actions workflow for APK/AAB builds
- **Automated version bumping:** Script to sync versions across files
- **Release notes generation:** Auto-generate from commit messages
- **Smoke test suite:** Run critical path tests before deploy

---

**Last Updated:** 2026-03-07  
**Owner:** Release Manager  
**Review Cycle:** Update after each major release
