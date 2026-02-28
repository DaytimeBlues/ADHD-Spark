# Persona 5 UI — LLM Prompt Framework

This document contains the **exact prompts** you should copy and paste to the less-advanced LLM to ensure it executes the Persona 5 (P5) UI overhaul perfectly without breaking your existing codebase.

Because the other LLM might lose context or make assumptions, we break the implementation into focused "Missions" (prompts).

## Pre-requisites for the Other LLM

Before giving it the first prompt, ensure the other LLM has access to:

1. The `spark-adhd` codebase (read and write access).
2. The `PHANTOM_UI_PLAN.md` file (which I just created in the root of your repo).
3. Any Google Stitch mockups/pictures you have (attach them as images to the prompt).

---

## 🛑 Prompt 1: System Context & Rules (The "System Prompt")

**Purpose:** Ground the LLM in the rules of the mission. It must not touch existing themes and must act precisely.
**Action:** Copy the text below and send it to the other LLM.

```text
You are an expert React Native developer. I am attaching screenshots of a Persona 5 ("Phantom Thief") style UI mockup from Google Stitch, and a file called `PHANTOM_UI_PLAN.md` containing the architectural plan to implement this UI in my app.

CRITICAL RULES FOR YOU TO FOLLOW:
1. DO NOT modify or overwrite the existing `linear` or `cosmic` themes.
2. We are ADDING a third theme called `phantom`. All your changes will be behind `if (isPhantom)` checks or added as new additions to the theme types.
3. You will implement this in exactly 4 phases, and wait for my instruction between each phase.
4. The aesthetic rules are strict: NO rounded corners (borderRadius: 0), use the exact colors specified in the plan (Signal Red, Pure Black, Pure White), and use jagged shapes (via transform rotate/skew) rather than standard rectangles.
5. All new components must go in `src/ui/phantom/`.

Read `PHANTOM_UI_PLAN.md` completely. 
Reply "I AM READY: PHANTOM THIEF MODE ENGAGED" when you have read the plan and understand the 5 rules above. Do not write any code yet.
```

---

## 🏃 Prompt 2: Phase A (Foundation)

**Purpose:** Set up the global theme variables and types safely.
**Action:** Once the LLM says it is ready, give it this prompt.

```text
Let's begin Phase A: Foundation. 

1. Create `src/theme/phantomTokens.ts`. Read `src/theme/cosmicTokens.ts` first, and ensure `PhantomTokens` exports the exact same TypeScript shape, but using the P5 colors, spacing, typography, and 0px border-radii defined in `PHANTOM_UI_PLAN.md`.
2. Update `src/theme/themeVariant.ts` to add `'phantom'` to the `ThemeVariant` type, constants, and migration maps.
3. Update `src/theme/ThemeProvider.tsx` to import `PhantomTokens` and return `isPhantom: variant === 'phantom'` and the correct `t` tokens in the hook.
4. Update `src/theme/tokens.ts` to export the new phantom variables.

Write and execute the code for these 4 steps now. After editing, run `npx tsc --noEmit` and confirm there are no type errors before showing me the result.
```

---

## 📐 Prompt 3: Phase B (UI Primitives)

**Purpose:** Create the reusable jagged building blocks without touching the screens yet.

```text
Great. Now let's do Phase B: UI Primitives. 
Look at the components in `src/ui/cosmic/` and create their Phantom equivalents in a new folder `src/ui/phantom/`. 

Create the following files EXACTLY as described in `PHANTOM_UI_PLAN.md`:
1. `PhantomBackground.tsx` (pitch black with halftone or stark gradient).
2. `JaggedCard.tsx` (the main container using `transform: [{ rotate }, { skewX }]`).
3. `StarburstTimer.tsx` (Impact font, sharp edges).
4. `PhantomButton.tsx` (skewed, crisp borders, red/white/black).
5. `CallingCard.tsx` (urgent notification banner that drops from the top).
6. `PhantomNavBar.tsx` (angled icons, red indicators).
7. `index.ts` (barrel export).

Ensure these use the `useTheme` hook but are visually distinct (no soft glows, only hard offset shadows). Run `npx tsc --noEmit` after creation. Show me `JaggedCard.tsx` as an example when done.
```

---

## 🎨 Prompt 4: Phase C (Screen Integration — The Tricky Part)

**Purpose:** Because there are 12 screens, tell the LLM to do them in small batches so it doesn't get confused or hit output limits.

```text
Phase C: Screen Integration. We must do this carefully. 
We need to update the `getStyles(isCosmic)` functions in the screens to be `getStyles(isCosmic, isPhantom)`.

Let's do the first 3 screens only right now:
1. `src/screens/HomeScreen.tsx`
2. `src/screens/PomodoroScreen.tsx`
3. `src/screens/BrainDumpScreen.tsx`

For each file:
- Import the new primitives from `../ui/phantom`.
- Get `isPhantom` from `useTheme()`.
- If `isPhantom` is true, render the Phantom layout described in `PHANTOM_UI_PLAN.md`.
- Keep the existing `isCosmic` and linear renders completely intact.

Write the code for these three screens. Check your work with TypeScript.
```

*(You will then repeat Prompt 4 for the remaining screens in batches: Ignite/FogCutter/Calendar; then Inbox/CheckIn/Anchor; then CBTGuide/Chat/Diagnostics).*

---

## 🔗 Prompt 5: Phase D (Navigation & Final Polish)

**Purpose:** Connect the tab bar and wrap up shared components.

```text
Phase D: Navigation and Shared Components.

1. Modify `src/navigation/AppNavigator.tsx`. When `isPhantom` is active from the theme hook, use the `PhantomNavBar` as the custom tab bar, and set the background colors to pure black.
2. Modify `src/components/home/ModeCard.tsx` to use `JaggedCard` when `isPhantom` is true.
3. Modify `src/components/ui/LinearButton.tsx` and `LinearCard.tsx` to render their Phantom variants when `isPhantom` is true.

Run a final `npx tsc --noEmit`. 
```

---

## 💡 How to Provide Your Stitch Mockups

When you start the conversation with the other LLM using **Prompt 1**, simply drag and drop the `.png` or `.jpg` exports from Google Stitch into the chat. Add a quick note like:

> *"Here are the Stitch mockups. Notice the jagged edges, skewed text, and stark red/black contrast. Use these as your absolute source of truth for the visual rules in Phase B and Phase C."*
