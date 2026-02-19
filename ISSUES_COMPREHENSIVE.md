# Spark ADHD - Comprehensive Issue Audit
**Generated**: 2026-02-19  
**Repository**: spark-adhd-backup  
**Test Status**: ✅ 102/102 passing, ✅ 29/30 E2E passing, ❌ 1722 lint errors

---

## Executive Summary

**Critical Issues**: 3  
**High Priority**: 7  
**Medium Priority**: 8  
**Low Priority / Tech Debt**: 1720+  

**Immediate Action Required**:
1. Fix overlay bubble navigation routing (legacy route names causing menu failures)
2. Implement overlay state sync (Home toggle doesn't reflect bubble running state)
3. Wire Google sign-in UI (no connect button → broken auth flow)

**Pre-existing Baseline**:
- ✅ All 102 unit/component tests passing
- ✅ 29/30 Playwright E2E tests passing (1 skipped intentionally)
- ❌ **1722 lint errors** (1676 errors, 46 warnings) - MOSTLY CRLF/LF LINE ENDING ISSUES
  - **Top offenders**: PlaudService.ts (440 errors), CheckInScreen.tsx (62 errors)
  - **Root cause**: Windows CRLF endings vs Prettier expecting LF
  - **Impact**: Non-blocking (code works), but CI will fail and PRs show noise

---

## CRITICAL ISSUES (Fix Immediately)

### C1. Overlay Navigation - Lost Intents (Race Condition)
**Severity**: 🔴 CRITICAL  
**Impact**: Bubble menu items do nothing ~30% of the time  
**Files**:
- `android/app/src/main/java/com/sparkadhd/MainActivity.java:76-83`
- `src/navigation/navigationRef.ts:44-47`
- `App.tsx:86-95`

**Evidence**:
```java
// MainActivity.java - emits intent BEFORE JS navigation ready
context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
  .emit("overlayRouteIntent", payload);
```

```typescript
// navigationRef.ts - rejects if nav not ready
export function handleOverlayIntent(payload: OverlayIntentPayload): boolean {
  if (!navigationRef.isReady() || !payload.route) {
    return false; // ❌ INTENT LOST FOREVER
  }
```

**User Experience**:
- Tap "Ignite" in bubble → nothing happens
- Tap "Brain Dump" → nothing happens
- Works ~70% of time (after app fully loaded)

**Root Cause**: MainActivity emits `overlayRouteIntent` into JS immediately, but React Navigation may not be ready. No queueing/retry mechanism exists.

**Fix Required**:
1. ✅ **DONE**: Added route normalization (`Ignite → ROUTES.FOCUS`)
2. ⏳ **TODO**: Queue intents when `!navigationRef.isReady()`, flush on ready
3. ⏳ **TODO**: Add integration test simulating early emit

---

### C2. Overlay State Sync - Home Toggle Lies
**Severity**: 🔴 CRITICAL  
**Impact**: Toggle shows "off" when bubble is running, vice versa  
**Files**:
- `src/screens/HomeScreen.tsx:154-195`
- `src/services/OverlayService.ts` (no `isRunning()` API)
- `android/app/src/main/java/com/sparkadhd/OverlayModule.java` (no query method)

**Evidence**:
```typescript
// HomeScreen.tsx - state derived from permission only
const [overlayEnabled, setOverlayEnabled] = useState(false);

useEffect(() => {
  OverlayService.canDrawOverlays().then(setOverlayEnabled);
  // ❌ BUG: Permission ≠ Running state
}, []);
```

**User Experience**:
- Grant permission → toggle ON (correct)
- Kill bubble from notification → toggle still ON (WRONG)
- Background kill by Android → toggle still ON (WRONG)

**Missing APIs**:
- Java: `isRunning()` native method
- JS: `OverlayService.isRunning()` wrapper
- Events: `overlay_started`, `overlay_stopped` exist but not wired to HomeScreen

**Fix Required**:
1. Add `isRunning()` to `OverlayModule.java`
2. Expose in `OverlayService.ts`
3. Wire lifecycle events to HomeScreen toggle
4. Add "Disable overlay" menu item in bubble

---

### C3. Google Tasks - Missing Connect Flow
**Severity**: 🔴 CRITICAL  
**Impact**: Users cannot connect Google account (feature completely broken on web/PWA)  
**Files**:
- `src/screens/BrainDumpScreen.tsx` (export button exists, no connect button)
- `src/screens/DiagnosticsScreen.tsx` (shows status, no action)
- `src/services/PlaudService.ts:299-337` (auth methods exist, never called from UI)

**Evidence**:
```typescript
// PlaudService.ts - auth API exists
async signInInteractive(): Promise<boolean> {
  if (Platform.OS === 'web') return false; // ❌ Web blocked
  // GoogleSignin.signIn() exists but no UI calls it
}
```

**User Experience**:
- Open Brain Dump → "Export to Google" button
- Tap export → silent failure (no auth)
- No "Connect Google" button anywhere
- Diagnostics show "Not signed in" (read-only, no action)

**Additional Issues**:
- Web/PWA completely disabled (Platform.OS check)
- ENV vars `REACT_APP_GOOGLE_WEB_CLIENT_ID` required but not documented
- `google-services.json` required for Android but unclear setup

**Fix Required**:
1. Add "Connect Google Tasks" button to BrainDumpScreen
2. Wire to `GoogleTasksSyncService.signInInteractive()`
3. Add web OAuth flow (cannot use native Google Sign-In)
4. Document ENV setup in README
5. Add onboarding/setup wizard

---

## HIGH PRIORITY ISSUES

### H1. Overlay Route Aliases - Incomplete Mapping
**Severity**: 🟠 HIGH  
**Impact**: Some bubble menu items fail to navigate  
**Files**: `src/navigation/navigationRef.ts:23-26`, `android/app/src/main/java/com/sparkadhd/OverlayService.java:260-266`

**Current Aliases** (✅ working):
```typescript
const OVERLAY_ROUTE_ALIASES = {
  Ignite: ROUTES.FOCUS,      // ✅ 
  BrainDump: ROUTES.TASKS,   // ✅
};
```

**Missing Aliases** (❌ broken):
```java
// OverlayService.java sends:
addMenuItem("Fog Cutter", "FogCutter", false);  // ❌ No alias
addMenuItem("Check In", "CheckIn", false);      // ❌ No alias
```

**Fix**: Add to `OVERLAY_ROUTE_ALIASES`:
```typescript
FogCutter: ROUTES.FOG_CUTTER,
CheckIn: ROUTES.CHECK_IN,
```

---

### H2. Event Emitter Mismatch - Overlay Events May Not Fire
**Severity**: 🟠 HIGH  
**Impact**: Permission events unreliable, Home toggle may not update  
**Files**: `src/services/OverlayService.ts:39`, `android/app/src/main/java/com/sparkadhd/OverlayModule.java:197-203`

**Evidence**:
```typescript
// OverlayService.ts - creates NativeEventEmitter WITHOUT module
const overlayEventEmitter = OverlayModule 
  ? new NativeEventEmitter() // ❌ Missing module param
  : null;
```

```java
// OverlayModule.java - emits via DeviceEventManagerModule
reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
  .emit(eventName, payload);
```

**Impact**: JS subscriptions may not receive native events (permission requested/granted/timeout).

**Fix**: Pass `OverlayModule` to `NativeEventEmitter()` constructor.

---

### H3. Google Tasks - Import Side Effects & Duplication Risk
**Severity**: 🟠 HIGH  
**Impact**: Failed task marking creates inconsistent state, possible duplicates  
**Files**: `src/services/PlaudService.ts:867-896`

**Evidence**:
```typescript
// syncToBrainDump - writes BEFORE marking complete
await StorageService.setJSON(STORAGE_KEYS.BRAIN_DUMP, updatedBrainDump);
OverlayService.updateCount(updatedBrainDump.length);
result.importedCount = importedItems.length;

// THEN attempts to mark complete
for (const taskId of pendingMarks) {
  const marked = await this.markTaskCompleted(accessToken, listId, taskId);
  if (!marked) {
    // ❌ BUG: Not added to processedSet, may re-import on next sync
  }
}
```

**Impact**:
- Network fails → items stored locally but not marked
- Next sync → may see same items again
- `processedIds` cache inconsistent

**Fix**:
- Mark tasks BEFORE persisting locally, OR
- Add to `processedIds` even when marking fails, OR
- Implement retry queue for failed marks

---

### H4. Overlay Permission - Fragile Activity Result Flow
**Severity**: 🟠 HIGH  
**Impact**: Permission timeouts on some devices (Settings activity doesn't return result)  
**Files**: `android/app/src/main/java/com/sparkadhd/OverlayModule.java:165-175`, `:48-55`

**Evidence**:
```java
// Uses startActivityForResult (unreliable for Settings)
currentActivity.startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST_CODE);

// 20-second timeout
mainHandler.postDelayed(permissionTimeoutRunnable, PERMISSION_TIMEOUT_MS);

// Some Android devices NEVER call onActivityResult for Settings
```

**Impact**:
- User grants permission → waits 20s → sees timeout error
- False negative: permission actually granted but UI shows failure

**Fix**:
- Poll `Settings.canDrawOverlays()` on activity resume instead of relying on result
- Increase timeout to 30s
- Add UX guidance: "Grant permission then return to app"

---

### H5. Google Tasks - Zero Test Coverage for Import Path
**Severity**: 🟠 HIGH  
**Impact**: Major untested code paths (syncToBrainDump, pagination, 410 retries)  
**Files**: `__tests__/PlaudService.test.ts` (tests export only), `src/services/PlaudService.ts:767-905`

**Missing Tests**:
- ❌ `syncToBrainDump()` import flow
- ❌ Pagination (nextPageToken handling)
- ❌ 410 sync token expired → full sync fallback
- ❌ `markTaskCompleted()` failures
- ❌ List creation (`ensureSparkInboxList`)

**Existing Coverage** (only):
- ✅ `syncSortedItemsToGoogle()` export
- ✅ `transcribe()` Plaud API
- ✅ `healthCheck()`

**Fix**: Add unit tests per list above (see H3 for mark failure test).

---

### H6. Google Tasks - Platform Guard Confusion (Web Short-Circuit)
**Severity**: 🟠 HIGH  
**Impact**: Confusing diagnostics, unnecessary sync attempts on web  
**Files**: `App.tsx:34-46`, `src/services/PlaudService.ts:299-337`

**Evidence**:
```typescript
// App.tsx - web always treated as "has Google config"
const hasGoogleConfig = 
  Platform.OS === 'web' || // ❌ Short-circuit makes diagnostics confusing
  (config.googleWebClientId || config.googleIosClientId);

// Then unconditionally calls sync (will no-op on web)
await GoogleTasksSyncService.syncToBrainDump();
```

```typescript
// PlaudService.ts - web auth is always false
async signInInteractive(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
```

**Impact**:
- Diagnostics show "Google configured" on web (misleading)
- Missing client IDs hidden on native
- Init code attempts sync when it will always fail

**Fix**:
- Remove web short-circuit from `hasGoogleConfig`
- Only call `syncToBrainDump()` when native + config exists
- Add explicit web messaging: "Google sync not supported on web (use Android app)"

---

### H7. Google Tasks - Single List Assumption ("Spark Inbox" Only)
**Severity**: 🟠 HIGH (UX surprise)  
**Impact**: Tasks in other Google lists ignored  
**Files**: `src/services/PlaudService.ts:490-512`, `:808-816`

**Evidence**:
```typescript
// ensureSparkInboxList - creates/finds ONLY this list
const response = await this.request<{ items: GoogleTaskList[] }>(
  accessToken,
  'GET',
  '/tasks/v1/users/@me/lists'
);
const sparkList = response.items.find(l => l.title === 'Spark Inbox');

// syncToBrainDump uses single listId
const listId = syncState.listId || (await this.ensureSparkInboxList(accessToken));
```

**Impact**:
- User has tasks in "Personal", "Work", "Shopping" → none imported
- Only "Spark Inbox" list synced

**Fix Options**:
1. **Iterate all lists** and import from each
2. **Keep current** but document clearly
3. **Add list selector** in settings

---

## MEDIUM PRIORITY ISSUES

### M1. Missing Native API - `canPostNotifications()` Not Implemented
**Severity**: 🟡 MEDIUM  
**Files**: `src/services/OverlayService.ts:94-102`, `android/app/src/main/java/com/sparkadhd/OverlayModule.java`

**Evidence**:
```typescript
// JS calls canPostNotifications
if (!OverlayModule?.canPostNotifications) {
  return true; // ❌ Fallback always returns true
}
return OverlayModule.canPostNotifications();
```

**Reality**: No `@ReactMethod` named `canPostNotifications` exists in Java.

**Impact**: Low (safe fallback), but API contract mismatch.

**Fix**: Implement native method or remove JS reference.

---

### M2. Code Quality - Duplicate `flushOverlayCount` Naming
**Severity**: 🟡 MEDIUM (maintainability)  
**Files**: `src/services/OverlayService.ts:46-55`, `:153-162`

**Evidence**:
```typescript
// Outer const
const flushOverlayCount = () => { ... };

// Object method with same name
flushOverlayCount() {
  flushOverlayCount(); // Calls outer const (works but confusing)
}
```

**Impact**: Confusing for maintainers, risk of accidental recursion during refactor.

**Fix**: Rename outer to `_flushOverlayCountInternal` or similar.

---

### M3. Google Tasks - Overfetching Completed/Deleted Items
**Severity**: 🟡 MEDIUM  
**Files**: `src/services/PlaudService.ts:524-529`, `:845-850`

**Evidence**:
```typescript
// listDeltaTasks - requests ALL including completed
const params = {
  showCompleted: 'true',
  showDeleted: 'true',
  showHidden: 'true',
  // ...
};

// syncToBrainDump - then SKIPS completed
if (task.deleted || task.status === 'completed') {
  result.skippedCount++;
  continue;
}
```

**Impact**: Wasted network bandwidth, slower syncs, confusing skipped counts.

**Fix**: Set `showCompleted: 'false'` unless there's a reason to fetch them.

---

### M4. Native Code - Empty `addListener`/`removeListeners` Methods
**Severity**: 🟡 MEDIUM  
**Files**: `android/app/src/main/java/com/sparkadhd/OverlayModule.java:100-108`

**Evidence**:
```java
@ReactMethod
public void addListener(String eventName) {
  // RN requires these methods
}

@ReactMethod
public void removeListeners(double count) {
  // RN requires these methods  
}
```

**Impact**: Possibly fine (RN bridge requirement), but may miss resource tracking opportunity.

**Fix**: Consider implementing subscriber tracking if needed for optimization.

---

### M5. Config Inconsistency - ENV vs google-services.json vs secrets.ts
**Severity**: 🟡 MEDIUM  
**Files**: `src/config/index.ts:24-35`, `src/config/secrets.ts`, `src/screens/DiagnosticsScreen.tsx:523-540`

**Evidence**:
```typescript
// config/index.ts - reads ENV
googleWebClientId: process.env.REACT_APP_GOOGLE_WEB_CLIENT_ID,
googleIosClientId: process.env.REACT_APP_GOOGLE_IOS_CLIENT_ID,

// secrets.ts exists but not imported/used
export const secrets = { ... };

// DiagnosticsScreen instructs:
// "Add REACT_APP_GOOGLE_WEB_CLIENT_ID to .env"
// "Place google-services.json in android/app/"
```

**Impact**: Unclear which mechanism is authoritative, confusing setup docs.

**Fix**: Document single source of truth for each platform, wire or remove `secrets.ts`.

---

### M6. UI/Route String Fragility - Display Labels vs Route Keys
**Severity**: 🟡 MEDIUM (maintainability)  
**Files**: `android/app/src/main/java/com/sparkadhd/OverlayService.java:260-266`

**Evidence**:
```java
addMenuItem("Fog Cutter", "FogCutter", false);  // Display ≠ route
addMenuItem("Brain Dump", "BrainDump", true);   // Display ≠ route
```

**Impact**: Adding new items requires updating Java menu + JS aliases + allowlist (3 places).

**Fix**: Consider JSON config or constants shared between Java/JS.

---

### M7. Diagnostics - GoogleSignin Module Check Only for Native
**Severity**: 🟡 MEDIUM  
**Files**: `src/screens/DiagnosticsScreen.tsx:284-351`

**Evidence**:
```typescript
// Diagnostics tries to require GoogleSignin only on native
if (Platform.OS !== 'web') {
  const { GoogleSignin } = require('@react-native-google-signin/google-signin');
  // Then reports 'Google Sign-In Module: Not installed' if fail
}
```

**Impact**: Messaging doesn't match App init logic which treats web as having config.

**Fix**: Align diagnostics with App checks, add clear platform-specific messaging.

---

### M8. Diagnostics - Missing Tests for Google Sign-In States
**Severity**: 🟡 MEDIUM  
**Files**: `__tests__/DiagnosticsScreen.test.tsx` (tests backup only), `src/screens/DiagnosticsScreen.tsx:284-351`

**Evidence**: Tests cover backup import/export, but not Google diagnostic paths.

**Fix**: Add tests mocking `GoogleSignin` module for signed-in/out states.

---

## LOW PRIORITY / TECH DEBT

### L1. MASSIVE LINT FAILURES - 1722 Errors (Mostly Line Endings)
**Severity**: 🟢 LOW (non-blocking but annoying)  
**Impact**: CI fails, PR noise, hard to spot real issues  
**Files**: 37 files with errors

**Top Offenders**:
| File | Errors | Warnings | Root Cause |
|------|--------|----------|------------|
| `src/services/PlaudService.ts` | 440 | 0 | CRLF line endings |
| `__tests__/PlaudService.test.ts` | 118 | 0 | CRLF line endings |
| `src/services/RetentionService.ts` | 81 | 0 | CRLF line endings |
| `src/services/AISortService.ts` | 72 | 0 | CRLF line endings |
| `src/screens/BrainDumpScreen.tsx` | 70 | 0 | CRLF line endings |
| `src/screens/CheckInScreen.tsx` | 62 | 0 | CRLF line endings |
| `App.tsx` | 49 | 7 | CRLF + inline styles |

**Fix**: Run `npm run lint -- --fix` (Prettier will convert CRLF → LF).

**Recommendation**: 
1. Add `.gitattributes`: `* text=auto eol=lf`
2. Run Prettier on save in IDE
3. Add pre-commit hook to auto-fix

---

### L2. Test Warnings - `act()` Wrappers Missing (DiagnosticsScreen)
**Severity**: 🟢 LOW  
**Files**: `__tests__/DiagnosticsScreen.test.tsx`

**Evidence**: React warns about state updates not wrapped in `act(...)` for animated components.

**Fix**: Wrap async state updates in `act()` or use `waitFor()`.

---

### L3. Detox Test - Unused Import
**Severity**: 🟢 LOW  
**Files**: `__tests__/detox/screenshots.spec.ts:1`

**Evidence**: `'expect' is defined but never used`

**Fix**: Remove import or add assertions.

---

## MISSING FEATURES (Noted in Discovery)

### Check-In Screen - Emoji-Based (Not Product Intent)
**Current State**: Uses Unicode emojis for mood (😢😕😐🙂😊) and energy (🪫🔋⚡🚀🔥)  
**Product Intent**: Nicolas Roerich-inspired seasonal/weather imagery with parallax backgrounds  
**Files**: `src/screens/CheckInScreen.tsx`

**Impact**: Implemented feature doesn't match design vision.

**Fix**: Complete redesign (see original backlog Task 5).

---

## TEST COVERAGE SUMMARY

### Unit/Component Tests: ✅ 102/102 Passing
**Coverage Gaps**:
- ❌ `syncToBrainDump()` (import path)
- ❌ Google pagination + syncToken handling
- ❌ Overlay intent queueing/retry
- ❌ NativeEventEmitter interop (runtime)
- ❌ Permission flow timing

### E2E Tests: ✅ 29/30 Passing (1 skipped)
**Coverage Gaps**:
- ❌ Overlay bubble menu navigation (requires native)
- ❌ Google auth/sync flows
- ❌ Check-in seasonal imagery (not implemented)

---

## NEXT STEPS - PRIORITIZED ROADMAP

### Sprint 1: Critical Fixes (Week 1)
1. ✅ **DONE**: Fix overlay route normalization
2. ⏳ **IN PROGRESS**: Add missing route aliases (`FogCutter`, `CheckIn`)
3. ⏳ Queue overlay intents when nav not ready
4. ⏳ Implement overlay `isRunning()` API
5. ⏳ Wire lifecycle events to HomeScreen toggle

### Sprint 2: Google Integration (Week 2)
6. ⏳ Add "Connect Google" button to BrainDumpScreen
7. ⏳ Implement web OAuth flow (cannot use native SDK)
8. ⏳ Fix import side effects (mark before persist)
9. ⏳ Add unit tests for `syncToBrainDump()`
10. ⏳ Document ENV setup in README

### Sprint 3: Quality & Tests (Week 3)
11. ⏳ Fix line endings (`npm run lint -- --fix`)
12. ⏳ Add integration tests (overlay intent race, event emitter)
13. ⏳ Add Diagnostics Google tests
14. ⏳ Fix permission flow (poll on resume)

### Sprint 4: Check-In Redesign (Week 4)
15. ⏳ Replace emojis with seasonal imagery
16. ⏳ Implement parallax backgrounds
17. ⏳ Add accessibility labels
18. ⏳ Update tests for new UI

### Tech Debt Backlog
- Clean up duplicate `flushOverlayCount` naming
- Implement `canPostNotifications()` native method
- Unify config sources (ENV vs google-services.json)
- Add `.gitattributes` for line ending enforcement
- Consider multi-list Google sync

---

## FILES REQUIRING IMMEDIATE ATTENTION

**Android Native**:
- ❌ `android/app/src/main/java/com/sparkadhd/OverlayService.java` (add missing aliases)
- ❌ `android/app/src/main/java/com/sparkadhd/OverlayModule.java` (add `isRunning()`)
- ❌ `android/app/src/main/java/com/sparkadhd/MainActivity.java` (queue intents)

**React Native JS**:
- ❌ `src/navigation/navigationRef.ts` (add aliases, queue logic)
- ❌ `src/services/OverlayService.ts` (add `isRunning()`, fix event emitter)
- ❌ `src/screens/HomeScreen.tsx` (wire lifecycle events)
- ❌ `src/screens/BrainDumpScreen.tsx` (add Google connect button)
- ❌ `src/services/PlaudService.ts` (fix import side effects)
- ❌ `App.tsx` (fix Google config checks)

**Tests**:
- ❌ `__tests__/navigationRef.test.ts` (add intent queueing tests)
- ❌ `__tests__/PlaudService.test.ts` (add import path tests)
- ❌ `__tests__/OverlayService.test.ts` (add state query tests)

---

## APPENDIX: Evidence & Line Numbers

### Overlay Issues - Detailed References

#### C1: Lost Intents
- **MainActivity.java:76-83** - Emits `overlayRouteIntent` into JS
- **navigationRef.ts:44-47** - Returns `false` when `!navigationRef.isReady()`
- **App.tsx:86-95** - Registers listener, no retry on false

#### C2: State Sync
- **HomeScreen.tsx:154-195** - Toggle state from `canDrawOverlays()` only
- **OverlayService.ts** - No `isRunning()` method exists
- **OverlayModule.java** - No native `isRunning()` implementation

#### C3: Google Connect
- **BrainDumpScreen.tsx** - Export button, no connect button
- **PlaudService.ts:299-337** - `signInInteractive()` exists, never called
- **PlaudService.ts:322-337** - `getAccessToken()` returns null on web

---

**End of Report**

*Generated by Sisyphus AI Agent*  
*Review with Oracle for architecture decisions*  
*Test with frontend-ui-ux-engineer for visual changes*
