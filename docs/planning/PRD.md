# Product Requirements Document (PRD): Spark ADHD

---

## 1. Project Overview (Logical Thinking)

**What is this app?**
Spark ADHD is a specialized productivity, focus, and cognitive offloading application designed specifically for neurodivergent individuals, focusing on those with Attention Deficit Hyperactivity Disorder (ADHD).

**Overarching Goal & Primary Function:**
The overarching goal of the system is to bypass executive dysfunction and alleviate cognitive overwhelm. Its primary function is a dual-layered approach:

1. **Frictionless Capture:** A floating "Capture Bubble" architecture allows users to instantly offload fleeting thoughts, tasks, or anxiety triggers without interrupting their current context.
2. **Structured Execution:** A suite of targeted "Modes" (like Pomodoro timers, "Fog Cutter", and "Brain Dump") that guide users into productive states using tailored sensory environments.

---

## 2. Skills & Tech Stack (Analytical Thinking)

**How does one use/play this app, and what is the main objective?**
Users utilize the app as an always-on companion. The main objective is to offload working memory rapidly to the "Inbox" and utilize the built-in structured timers (Pomodoro/Ignite modes) to initiate and sustain focus on tasks.

**Exact Tech Stack:**

* **Core Framework:** React Native CLI (Bare implementation, v0.74.3) yielding full control over native binaries.
* **Language:** TypeScript (Strict typing for robust domain services).
* **Routing & Navigation:** React Navigation (`@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/stack`).
* **State Management:** Zustand (for lightweight, performant global state such as Theme and Capture tracking) alongside legacy React Context where appropriate.
* **Data Persistence:** Offline-first architecture utilizing `@react-native-async-storage/async-storage`.
* **Styling & UI:** Custom styling engine utilizing React Native `StyleSheet` paired with a sophisticated runtime Design Token system (`Tokens.ts`, `cosmicTokens.ts`). Complex animations are driven by `react-native-reanimated`.
* **Observability & Error Handling:** Sentry (`@sentry/react-native`) for real-time error tracking, full stack-trace monitoring, and exception capture via custom Error Boundaries.
* **Quality Assurance:** Exhaustive End-to-End (E2E) UI testing via Playwright and Detox, unit testing via Jest.

---

## 3. Key Features & Milestones (Computational Thinking)

The application logic breaks down into robust local-first state patterns that govern sensory UI feedback and data capture pipelines.

### Milestone 1: Minimal Viable Product (MVP)

*The absolute core functionalities required to achieve the cognitive offloading loop. "Nice-to-have" features like advanced theming or complex calendar integrations are explicitly excluded here.*

* **Global Capture Integration:** A persistent "Capture Bubble" component available across the app overlay that intercepts user inputs (Text and Voice abstraction).
* **Capture Inbox Queue:** A `FlatList`-optimized triage screen where captured items are temporarily stored as "Unreviewed" until the user acts upon them (Promote to Task, Promote to Note, or Discard).
* **Local Storage Engine:** A robust, offline-first SQLite/AsyncStorage bridge (`CaptureService` & `StorageService`) ensuring no thought is lost to a network failure.
* **Core Focus Timer (Pomodoro):** A standalone, highly accurate countdown timer with explicit Play/Pause/Break lifecycle handling decoupled from UI re-renders.

### Milestone 2: Advanced Features & Contextual Integrations

* **Drift Check (Cognitive Interruption):** An hourly recurring popup (utilizing the floating overlay) that interrupts the user to ask "What are you doing?" and "What should you be doing?". This combats screen-lock/doom-scrolling and logs distractions as diagnostic data for later review.
* **Third-Party Hardware Ingestion (Plaud Pro):** A cloud-sync webhook bridge allowing Zapier to catch transcripts from external AI hardware (like the Plaud Pro) and push them directly into the Appwrite database, where the mobile app synchronizes them down as "Unreviewed" meeting notes.
* **Advanced Sensory Theming:** Dynamic switching between distinct interface profiles, such as a traditional "Linear" mode and an immersive "Cosmic" mode featuring glassmorphism, glowing halos (`<HaloRing>`), and animated celestial backgrounds.
* **Cognitive Intervention Modes:** Dedicated workflow screens like "Fog Cutter" (for breaking down overwhelming tasks) and "Brain Dump" (for rapid anxiety clearing).
* **Check-In System:** Mood and energy logging featuring literary vignettes to help baseline the user's executive function capacity.
* **Telemetry & Edge-Case Protection:** Sentry SDK deployment capturing silent unhandled promises or component crashes in production.

---

## 4. Target Audience & UX Excellence (Procedural Thinking)

**Target Audience:**
Neurodivergent individuals, specifically those struggling with ADHD symptoms like time blindness, working memory deficits, task paralysis, and executive dysfunction.

**Strategies for UX Excellence (How to Excel):**

* **Sensory Accommodations:** The app explicitly rejects harsh, industrial, sharp-angled UI components (like strict squares). Instead, it implements "squircles" (e.g., highly rounded cards up to 24px) to promote a feeling of safety and reduce perceived rigidity.
* **Interactivity & Affordances:** UI elements do not rely on subtle color shifts. Instead, actionable cards utilize physical scale transforms (e.g., scaling down to 0.98 upon press), providing undeniable tactile feedback to ground the user.
* **Zero-Friction Cognitive Offloading:** The implementation of the Capture Drawer features generous hit-slops and non-blocking asynchronous data saves. A user can open it, type a word, and close it in under three interactions without waiting for server spinners.
* **Immersive Depth:** The "Cosmic" design tokens rely on calculating deep overlapping spatial layers—using opacity, blurs (`backdropFilter`), and accented top-borders to emulate a real-world light source. This captures the user's attention safely without over-stimulating them with chaotic colors.
* **Error Tolerance:** The application handles errors with grace. By utilizing comprehensive `ErrorBoundary` wrappers paired with Sentry, users are shown gentle "Oops" screens with soft recovery options ("Try Again") rather than being thrown out to the OS home screen.
