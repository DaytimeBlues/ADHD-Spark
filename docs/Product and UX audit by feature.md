## **Product and UX audit by feature**

This section is organized by the features you named, plus the repo’s documented constraints. For each area: current state, issues, recommendations (short/medium/long), effort \[Inference\], and implementation steps.

Purpose and target users (adult ADHD needs)

Current state in artifacts

The PRD positions the app as a centralized hub to bypass ADHD roadblocks, with personas like “Overwhelmed Professional” (needs micro-step breakdown) and “Distressed Student” (needs immediate grounding \+ mood tracking). It also states a UX philosophy of minimizing cognitive load by isolating each tool to its own screen and keeping the home grid simple to avoid overwhelm.

Concrete issues found

The product purpose is internally coherent, but evidence communication is not yet consistently surfaced in UI copy (what is “evidence,” what is heuristic, what is optional). Your internal research addendum explicitly requires evidence labels, but the visible UI pattern for those labels is not established as a reusable component in the design system artifacts.

Recommendations

Short term \[Inference: effort low to medium\] Define a single “CADDI principles” page accessible from Home (or CBT Guide) that explains: what each mode is for, how to use it, and evidence labeling (3-tier labels). Anchor it as a calm, skim-friendly reference.

Medium term \[Inference: effort medium\] Add “re-entry” patterns into every mode: “resume,” “restart gently,” “save and exit,” and “you didn’t fail” framing. Your internal research requirements explicitly point to re-entry flows and low-shame restart prompts as retention-by-design needs.

Long term \[Inference: effort medium to high\] Subtype-aware defaults: allow the app to default to the most likely helpful flow for ADHD-inattentive users (initiation, activation, procrastination), while keeping other behavior supports optional.

Implementation steps

Create a small taxonomy of user intents: start, stuck, overwhelmed, dysregulated, time-blind, and “post-failure re-entry.” Map each mode to exactly one primary intent plus a fallback.

Create a reusable “EvidenceBadge” component and require it for any educational claim or recommendation panel.

Ignite (5-minute focus timer)

Current state in artifacts

README: “Ignite – 5-minute focus timer with brown noise.”

PRD: emphasizes meaningful, non-annoying notifications; haptic preferred.

Audit: duplicated timer logic across screens is called out as a key integrity risk, with recommendation to consolidate behind useTimer.

Concrete issues found

Timer reliability and drift are common issues across platforms; your repo already flags timer duplication as a risk. For adults with ADHD, inconsistent timers or unclear timer states create disproportionate frustration.

Brown noise implementation exists for native via react-native-sound, but web sound service is stubbed; this creates an experience gap between web-first and native.

Recommendations

Short term \[Inference: effort medium\] Unify Ignite/Pomodoro/Anchor timers behind useTimer, and standardize timer state machine naming (“running,” “paused,” “break,” “complete,” “interrupted”).

Medium term \[Inference: effort medium\] Implement a “re-entry after interruption” pattern: if the app backgrounded, show “Continue 2:14 remaining” rather than resetting. (This is supportive for time-blindness and interruption-heavy lives.)

Long term \[Inference: effort high\] If you need background-resilient timers on Android, formalize strategy: exact alarms vs foreground service vs WorkManager, depending on user expectations and battery impact. Android discourages overuse of exact alarms, and newer Android versions constrain background work. 

Implementation steps (engineers)

Define a single timer reducer with events: START(duration), PAUSE, RESUME, TICK(now), COMPLETE, RESET, APP\_BACKGROUND(now), APP\_FOREGROUND(now).

In React Native, use AppState to detect backgrounding and compute remaining time using timestamps rather than relying on setInterval accuracy.

Fog Cutter (micro-step breakdown)

Current state in artifacts

README: “Fog Cutter – break overwhelming tasks into micro-steps.”

PRD persona and story: supports task initiation by breaking complex tasks into manageable steps.

Concrete issues found

Micro-step tools can accidentally become “planning procrastination” if they encourage endless decomposition without a “start now” boundary. This is a product risk, not a feature request.

Data model and storage consistency: the audit identifies storage/schema normalization work needed.

Recommendations

Short term \[Inference: effort low\] Add a strict “first step must be do-able in 2–5 minutes” constraint and a button: “Start step 1 now (Ignite 5).” This preserves core features while improving initiation linkage.

Medium term \[Inference: effort medium\] Add an explicit “Done is enough” completion flow: once 1–3 steps are captured, prompt user to start rather than add more steps.

Long term \[Inference: effort medium\] Optional integration: convert a micro-step to a Google Task only when the user explicitly chooses (avoids silent coupling and preserves autonomy).

Implementation steps

Create a “FogCutterStep” component with a single required field \+ optional notes; enforce max text length to keep steps readable.

Add a “handoff” object that Ignite can accept: label \+ target duration.

Pomodoro (25/5)

Current state in artifacts

README: “Pomodoro – classic 25/5.”

Test strategy emphasizes central timer engine (useTimer).

Concrete issues found

Classic Pomodoro can be counterproductive for some ADHD users if breaks become “task abandonment cliffs” (the repo even includes an ADHD-specific Pomodoro reflection artifact in sources; also common in ADHD discourse). 

Recommendations

Short term \[Inference: effort low\] Keep classic 25/5, but add a “break with guardrails” screen: one primary break action (stand up / drink water) and one “return to task” button. Avoid presenting choice overload.

Medium term \[Inference: effort medium\] Add “ADHD-friendly variants” without adding settings sprawl: offer 2 presets only (e.g., 25/5 and 50/10), chosen at the moment of starting, not buried in settings. This respects the PRD’s “avoid app overwhelm and deep options” mitigation.

Long term \[Inference: effort medium\] Add “re-entry cue” after breaks: show the micro-step you intended to resume, not just a generic “work.” (Requires light state linking Pomodoro ↔ Fog Cutter.)

Anchor (breathing and grounding)

Current state in artifacts

README: Anchor includes breathing exercises (4-7-8, box, energize).

PRD: distressed student persona needs tactile grounding exercises.

Concrete issues found

Grounding tools must be usable under stress: large tap targets, minimal reading, and stable audio/haptics. Web-first compatibility may dilute “tactile” experience unless carefully designed.

Recommendations

Short term \[Inference: effort low\] Standardize the Anchor screen on a single interaction primitive: tap to start/stop; no nested controls.

Medium term \[Inference: effort medium\] Add an “Anchor as overlay quick action” for Android overlay surface, but only after overlay permission is granted and stable (avoid early expansion of high-risk surface).

Long term \[Inference: effort medium\] Add optional “sensory profiles” (sound on/off, haptic on/off) as a lightweight per-session choice, not a settings labyrinth.

Check-In (mood and energy tracking with recommendations)

Current state in artifacts

README: “Check In – mood and energy tracking with recommendations.”

PRD includes success metrics expecting multiple daily check-ins/focus sessions.

Concrete issues found

“Recommendations” must not be presented as clinical guidance unless you can substantiate. Your evidence-label requirement strongly applies here.

Recommendations

Short term \[Inference: effort low\] Label recommendations as “suggestions” with evidence badge categories. Route users to crisis resources if they indicate severe distress, but do so carefully and region-specifically. 

Medium term \[Inference: effort medium\] Add a “pattern reflection” that is purely descriptive (no diagnosis): e.g., “you logged low energy 3 days this week.” This aligns with app evaluation approaches emphasizing transparency and avoiding inflated claims. 

Long term \[Inference: effort medium\] Add export/import so users can back up their check-ins; this is a trust feature and helps mitigate “data loss” risk named in the PRD.

Brain Dump (fast capture, AI sorting, transcription)

Current state in artifacts

README: “Brain Dump – quick capture … AI-powered sorting suggestions.”

Implementation includes recording and transcription via a PlaudService that calls a remote API base URL, and an AI sort service that POSTs text to an /api/sort endpoint hosted at a Vercel URL in config. Vercel

Concrete issues found

Privacy clarity gap: if audio/text is sent to a remote API, users need explicit disclosure, a consent/opt-out path, and a local-only degraded mode. Without that, you will likely fail mental health app evaluation criteria at the “privacy/security” step. 

Architecture cohesion: PlaudService mixes transcription and Google Tasks sync in one service. That increases coupling and makes testing and threat modeling harder.

Recommendations

Short term \[Inference: effort medium\] Add an explicit “Data leaving device” disclosure panel the first time Brain Dump AI/transcription is used, with evidence labels and plain language: what is sent, where, retention, and deletion. Align language with “integrity/privacy” priorities from mental health app evaluation frameworks. 

Medium term \[Inference: effort medium\] Split PlaudService into: TranscriptionService (remote), GoogleTasksSyncService (OAuth \+ Tasks API), and keep Brain Dump orchestrating. This also supports modularity and test isolation.

Long term \[Inference: effort high\] Offer local-only Brain Dump fallback: no cloud calls; allow manual categorization. This preserves the core Brain Dump feature even when offline and reduces privacy burden.

Calendar (simple monthly view) and Google Calendar integration

Current state in artifacts

README: “Calendar – simple monthly view.” The current CalendarScreen appears to be a local calendar UI, not a Google Calendar integration.

Concrete issues found

The user request includes “Google Tasks/Calendar integration,” but the code shows substantial Google Tasks integration work and “Keep API is limited” open questions; Google Calendar integration is not evidenced as implemented in the UI layer.

Recommendations

Short term \[Inference: effort low\] Rename UI labels for accuracy: “Calendar (local view)” vs “Google Calendar.” Do not imply integration until it exists.

Medium term \[Inference: effort medium\] If you integrate Google Calendar, treat it like Tasks: narrow scopes, explicit user intent, and fail gracefully.

Long term \[Inference: effort high\] Consider avoiding Google Calendar write capabilities entirely; read-only is often sufficient and reduces user trust risk.

Crisis Mode

Current state in artifacts

README and TECH\_SPEC list “Crisis Mode,” but the snapshot’s src/screens list does not include a Crisis screen; parity appears incomplete.

Concrete issues found

A “Crisis Mode” claim without a working, polished flow is actively harmful to trust. For mental health apps, crisis surfaces require high integrity, clear scope, and fast region-appropriate actions. 

Recommendations

Short term \[Inference: effort medium\] Either implement a minimal Crisis Mode properly or remove the tile/mention until it exists. “Minimal but correct” means: A single screen with: “If in immediate danger call emergency,” plus reputable crisis options by region.

Medium term \[Inference: effort medium\] Add region-aware crisis resources. For Australia, AIHW lists 000 and Lifeline; Lifeline’s Beyond Now safety plan is also a credible reference pattern for safety planning. 

Long term \[Inference: effort medium\] Add a “safety plan” feature only if you can do it with offline persistence, export, and strong privacy posture.

## **UX and design system audit, plus Figma deliverables**

Design system and token enforcement

Current state in artifacts

Design Rules insist “Token System (No Arbitrary Values),” canonical token file src/theme/tokens.ts, and explicit empty states with a primary action.

Audit notes token usage mismatch previously caused runtime issues (e.g., token shape mismatch) and recommends replacing literal sizes with token values.

Concrete issues found

Enforcement is partially social rather than automated: lint currently fails and there is backlog. The repo review notes tests pass but lint fails and output is noisy.

Recommendations

Short term \[Inference: effort medium\] Make token usage enforceable: Add an ESLint rule set to ban inline numeric styles except via Tokens, and gate new code with “lint:changed” rather than forcing an all-at-once cleanup.

Medium term \[Inference: effort medium\] Define a small component library: Card, ModeCard, PrimaryButton, SecondaryButton, EvidenceBadge, EmptyState, ReEntryPrompt. Require features to assemble from these.

Long term \[Inference: effort medium\] Add design tokens export/import between Figma and code (Style Dictionary or a simple JSON pipeline) once there is a stable Figma file.

Empty states and re-entry flows

Current state in artifacts

Design rules explicitly require empty states to be explicit components with a primary action.

Internal research requirements emphasize retention-by-design features like re-entry flows and low-shame restart prompts.

Concrete issues found

There is no single reusable “EmptyState” and “ReEntryPrompt” pattern evidenced as a shared component in the snapshot; they may be implemented ad hoc.

Recommendations

Short term \[Inference: effort low\] Create a single EmptyState component with: Title (1 line), body (max 2 lines), primary action (1), secondary action (optional, text-only).

Medium term \[Inference: effort medium\] Create a re-entry state machine across modes: If user exits mid-session, show “Resume” and “Restart” with “no shame” microcopy.

Evidence labeling in UI

Current state in artifacts

Internal research requirement R4 mandates in-app evidence labels to avoid evidence inflation (examples given: “RCT evidence”, “clinical best practice”, “framework hypothesis”).

External reference frameworks reinforce separation of privacy/security vs evidence vs engagement, and the need for disclaimers and transparency (APA evaluation model; NICE evidence standards). 

Concrete issues found

Evidence labels exist as a requirement, not as a design system element. That is a delivery gap.

Recommendations

Short term \[Inference: effort low\] Introduce an EvidenceBadge UI and require it wherever the app provides “recommendations,” “AI suggestions,” “CBT guidance,” or “crisis” guidance.

Figma deliverables options

Because there is no accessible CADDI Figma design file in the provided artifacts, I cannot produce a 1:1 recreation from Figma frames. What I can do is specify deliverables precisely so a designer can execute.

Comparison table: Figma delivery approach options

\[Inference\] The “estimated hours” below assume 1 experienced product designer with light engineering support and an existing screen set of roughly 8–10 screens, plus a small component library.

| Option | Pros | Cons | Deliverables | \[Inference\] estimated hours |
| :---- | :---- | :---- | :---- | :---- |
| 1:1 recreation | Fastest path to pixel parity if a Figma file already represents “truth”; easiest for QA and visual diff | Can preserve inconsistencies; token drift risk if Figma uses non-token values; harder to scale | Screen-by-screen recreation, redlines/specs, interaction notes, asset export, minimal component list | 30–60 |
| Token-driven redesign | Enforces UX consistency; reduces future dev cost; better accessibility/tap targets; systematic evidence labels/empty states/re-entry patterns | Requires design decisions; longer alignment; initial scope discipline required to avoid “designing forever” | Token map (colors/type/spacing/radius), component library, screen templates, empty state \+ re-entry patterns, evidence labeling system, accessibility notes | 60–120 |

Token mapping and component list (both options must include)

Token map: Colors, typography scale, spacing scale, radius, elevation/shadow rules, semantic colors (success/warn/danger), and interactive states (pressed/disabled).

Core components: ModeCard, LinearButton (primary/secondary), IconButton, InputField, TimerRing, EvidenceBadge, EmptyState, ReEntryPrompt, ModalSheet, Toast/Snackbar.

## **Code, architecture, Android specifics, testing, observability, security, and reliability**

Architecture and state management

Current state in artifacts

The repo’s audit calls out three integrity risks: storage access bypassing StorageService (historical), token shape mismatch, and duplicated timer logic across screens, recommending consolidation behind hooks/services.

There is a consolidation plan emphasizing single source of truth for persisted shapes and shared services.

Concrete issues found

Service coupling: PlaudService mixes concerns (transcription \+ Google Tasks).

Potential inconsistency across web vs native (SoundService stubs on web; overlay only on Android).

Recommendations

Short term \[Inference: effort medium\] Create a “platform abstraction layer” folder: services/platform/\* with SoundService.native.ts and SoundService.web.ts style patterns for any platform-specific capability, and keep UI components ignorant of platform decisions.

Medium term \[Inference: effort medium\] Refactor PlaudService into smaller services and define clear boundaries: TranscriptionService is “cloud,” TasksSyncService is “OAuth,” OverlayService is “Android-only.”

Long term \[Inference: effort high\] Local-first export/import: Implement export to JSON and import with schema validation. This directly addresses PRD “data loss” risk and supports user trust.

Offline-first/local-first data and backup strategy

Current state in artifacts

TECH\_SPEC explicitly cuts “cloud sync/multi-device” for local-first philosophy. Storage is via AsyncStorage with JSON serialization, with a StorageService supporting versioning/migrations.

Concrete issues found

Without export/import, local-first becomes local-fragile: device loss, uninstall, or storage eviction equates to total data loss.

Recommendations

Short term \[Inference: effort medium\] Add “Export data (JSON)” in Settings (even if you avoid a heavy settings screen, you can add a single “Data” screen accessible from Home footer or CBT Guide). Keep it one action.

Medium term \[Inference: effort medium\] Add “Import data” with guardrails: Warn that importing overwrites local data unless user chooses merge.

Implementation steps (code sketch)

ts  
Copy  
*// Pseudocode outline (engineers): export*  
const keys \= Object.values(StorageService.STORAGE\_KEYS);  
const entries \= await Promise.all(keys.map(async (k) \=\> \[k, await StorageService.getJSON(k)\]));  
const payload \= { version: 1, exportedAt: new Date().toISOString(), data: Object.fromEntries(entries) };  
*// write payload to file (native) or download blob (web)*

Android overlay, permissions, battery, notifications, audio

Current state in artifacts

Overlay is positioned as a differentiator and has a stability validation plan with long-running tests, low-memory tests, and background restriction tests. The Android compatibility doc outlines required permissions and newer Android requirements.

External constraints (must design around)

Overlay permission: SYSTEM\_ALERT\_WINDOW is required to draw application overlay windows (TYPE\_APPLICATION\_OVERLAY), and users must explicitly grant it via settings; Android warns few apps should use it. 

Android 13+: runtime notification permission POST\_NOTIFICATIONS governs ability to show non-exempt notifications. 

Android 14+: foreground service types are required if targeting Android 14; missing types can cause exceptions; special-use types require manifest properties. 

Android 12+: restrictions on starting foreground services from background can throw ForegroundServiceStartNotAllowedException. 

Android 15+: if relying on the SYSTEM\_ALERT\_WINDOW exemption to start a foreground service from background, the overlay must be visible first; otherwise you can get exceptions. 

Battery and Doze/App Standby: background work and network can be deferred; requesting battery-optimization exemptions is discouraged and restricted by Play policies unless core function is adversely affected. 

Concrete issues found

Overlay UX risk: permission acquisition is high-friction; if you do not nail the flow, ADHD users will churn at setup.

Reliability risk: overlay background restrictions and Doze can stop services; your own stability plan anticipates this.

Audio experience inconsistency between web and native risks breaking “brown noise” promise.

Recommendations

Short term \[Inference: effort medium\] Implement a permission “runway” flow: Explain benefit (one sentence), show example, then take user to settings; return and verify. Do not request everything at once; request only when needed (notification permission when user turns on notifications; overlay permission when enabling overlay). This matches Android guidance to time permission prompts after users understand the feature. 

Medium term \[Inference: effort medium\] Add Android 15 safety ordering: If starting a foreground service from background relying on overlay exemption, ensure overlay window is already visible before starting the service. 

Long term \[Inference: effort high\] Document and enforce a foreground-service strategy with service types and timeouts, and avoid over-broad permissions. Android 14/15 changes make “do whatever in background” untenable. 

Testing and CI

Current state in artifacts

Unit tests: Jest; E2E: Playwright; Android instrumentation tests in GitHub Actions; Test strategy aims for high coverage on core logic and uses web runtime as primary integration path.

CI workflows exist for Android CI, Playwright tests, and Pages deployment.

Lint: baseline indicates lint error involving eslint-plugin-prettier config mismatch; repo review notes lint fails with large formatting backlog.

Concrete issues found

CI signal quality: noisy tests (console errors in expected error-path tests) reduce triage speed.

Lint gating: all-or-nothing lint failure discourages incremental improvement.

Recommendations

Short term \[Inference: effort low\] Add a lint:changed script: Only lint changed files in PRs; keep lint as full check for scheduled cleanup.

Short term \[Inference: effort low\] Mute expected-console-noise in tests: Wrap expected error-path tests with a helper that spies on console and asserts calls without printing.

Medium term \[Inference: effort medium\] Add staged “format cleanup” PR cadence: Week-by-week, clean a bounded folder (e.g., src/services then src/screens) so the team can keep shipping.

CI pipeline mermaid flow (requested)

Pull request opened  
Install deps  
Unit tests (Jest)  
E2E (Playwright)  
Lint changed files  
Full lint (nightly or scheduled)  
Build Android (Gradle)  
Android emulator tests (connectedDebugAndroidTest)  
Upload artifacts (playwright-report)  
Show code  
Debugging, observability, analytics, and privacy

Current state in artifacts

There is a local UXMetricsService that stores a bounded event log in local storage, which is privacy-friendly by default. No crash reporting/remote analytics is evidenced in the snapshot.

Concrete issues found

Without crash reporting, Android overlay failures and permission-flow drop-offs will be hard to debug at scale.

Recommendations

Short term \[Inference: effort low\] Improve structured logging: Standardize log tags by feature/module; add “last action” breadcrumbs to storage for post-crash reconstruction (still local).

Medium term \[Inference: effort medium\] Add optional crash reporting with explicit opt-in: For a mental health adjacent app, do not default to “always on” analytics; let users choose. This aligns with privacy-first expectations in mental health app evaluation. 

Security and integrations (OAuth, token storage, least-privilege)

Current state in artifacts

Security checklist explicitly says: use least-privilege OAuth scopes for Google integrations; avoid storing tokens/secrets in AsyncStorage; use secure storage; run gitleaks scans.

Google Tasks API scopes are well-defined; Google recommends narrow scope selection and describes verification needs for sensitive scopes. 

Google’s OAuth guidance for installed apps supports PKCE (code verifier/challenge) and assumes installed apps can’t keep secrets. 

Concrete issues found

OAuth for web vs native is an open question in TECH\_SPEC.

If any tokens are stored in AsyncStorage, that conflicts with your own checklist (I cannot confirm token storage specifics beyond the checklist and service shapes in the snapshot).

Recommendations

Short term \[Inference: effort medium\] Use Authorization Code \+ PKCE for any OAuth flow that can lead to long-lived access, and use external user agents for native patterns (RFC 8252). 

Short term \[Inference: effort low\] Scope discipline: Prefer tasks.readonly unless you must create/update tasks, then escalate to tasks only when user explicitly enables write-back. 

Medium term \[Inference: effort medium\] Secure storage: Use platform keychain/keystore for tokens; on web, rely on in-memory tokens where possible and avoid localStorage for bearer tokens.

Performance and reliability

Current state in artifacts

Baseline notes web build can produce asset size warnings.

Overlay stability plan proposes monitoring memory/CPU and handling service death gracefully.

Android and Doze can defer work; services must handle restarts and restrictions. 

Recommendations

Short term \[Inference: effort low\] Startup performance: Defer loading AI/transcription modules until user enters Brain Dump.

Medium term \[Inference: effort medium\] Timers: Compute remaining time from timestamps; do not rely on intervals for correctness (reduces drift and improves perceived reliability).

Long term \[Inference: effort high\] If you ever target Android 15/16+ constraints heavily, review foreground service timeouts and restrictions, and shift non-user-facing work to WorkManager. 

Accessibility and localization

Current state in artifacts

Design rules emphasize readable typography and token scales, but there is not an explicit accessibility checklist in the snapshot.

Recommendations

Short term \[Inference: effort low\] Add an accessibility acceptance checklist per screen: Tap target size, focus order, text scaling, contrast (semantic colors), reduced motion.

Medium term \[Inference: effort medium\] Implement localization scaffolding: Centralize strings, even if you ship en-US only initially; ADHD users often rely on consistent phrasing and predictable labels.

