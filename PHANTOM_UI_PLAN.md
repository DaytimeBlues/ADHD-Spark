# Persona 5 "Phantom Thief" UI — Exhaustive Implementation Plan

> **Branch**: `new-ui-v2` (already created, already checked out)
> **Rule**: DO NOT merge into `master` without explicit user permission.
> **Audience**: This plan is written for a less-advanced LLM to execute step-by-step.

---

## 1. Architecture Overview

### 1.1 How Themes Work Today

The app has a **theme variant system** in [themeVariant.ts](file:///c:/Users/Steve/OneDrive/Desktop/Github%20Repos/spark-adhd/src/theme/themeVariant.ts):

```typescript
export type ThemeVariant = 'linear' | 'cosmic';
```

- Each screen has a `getStyles(isCosmic: boolean)` function that returns theme-aware `StyleSheet`.
- The [ThemeProvider.tsx](file:///c:/Users/Steve/OneDrive/Desktop/Github%20Repos/spark-adhd/src/theme/ThemeProvider.tsx) hook (`useTheme()`) exposes `{ variant, isCosmic, isLinear, t }`.
- Token files: `linearTokens.ts` (monochrome), `cosmicTokens.ts` (space/glow aesthetic).
- Cosmic UI primitives live in `src/ui/cosmic/`: `CosmicBackground`, `GlowCard`, `ChronoDigits`, `RuneButton`, `HaloRing`, `BottomSheet`.

### 1.2 Strategy: Add a Third Theme Variant — `'phantom'`

Instead of overwriting existing themes, we **add** a new variant:

```typescript
export type ThemeVariant = 'linear' | 'cosmic' | 'phantom';
```

This allows:

- Zero risk to existing `linear` and `cosmic` themes.
- Users can toggle to `phantom` in settings.
- Every `getStyles(isCosmic)` gets updated to `getStyles(isCosmic, isPhantom)`.

---

## 2. Visual Design Rules (From User's Stitch Mockups)

### 2.1 Color Palette

| Token Name | Hex | Usage |
|---|---|---|
| `signalRed` | `#D80000` | Primary accent, CTAs, urgent items |
| `pureBlack` | `#000000` | Primary background |
| `pureWhite` | `#FFFFFF` | Text on dark, card backgrounds |
| `deepNavy` | `#0A0A1A` | Secondary background, depth layers |
| `halftoneRed` | `#8B0000` | Halftone patterns, secondary red |
| `crimson` | `#DC143C` | Hover/active states |

### 2.2 Typography

| Role | Font | Style |
|---|---|---|
| Headlines | `Impact` or custom "ransom note" | Uppercase, `skewX(-5deg)`, irregular letter spacing |
| Body | `Arial Black` or `Inter-Bold` | Italic, high-contrast |
| Timer digits | `Impact` | Massive size (64px+), black on white burst |
| Labels | `Georgia` bold | Slanted, all-caps |

### 2.3 Shape Language

- **No rounded corners**: `borderRadius: 0` globally.
- **Jagged containers**: Use `transform: [{ rotate: '-2deg' }, { skewX: '-5deg' }]` on cards.
- **Overlapping elements**: Negative margins, `zIndex` stacking.
- **Clip-path equivalent in RN**: Use `react-native-svg` `<Polygon>` or angled `View` composites with `overflow: 'hidden'` and rotated inner views.

### 2.4 Motion

- **Entry**: "Slam down" — `translateY(-100%) → translateY(0)` with 200ms overshoot.
- **Pulse**: Timer elements pulse at `scale(1.0) → scale(1.05)` loop.
- **Transition timing**: `cubic-bezier(0.18, 0.89, 0.32, 1.28)` — snappy with overshoot.

---

## 3. Files to Create (NEW)

### 3.1 Theme Token File

#### [NEW] `src/theme/phantomTokens.ts`

Create a complete token file mirroring `cosmicTokens.ts` structure with P5 colors:

```typescript
export const phantomColors = {
  signalRed: '#D80000',
  pureBlack: '#000000',
  pureWhite: '#FFFFFF',
  deepNavy: '#0A0A1A',
  halftoneRed: '#8B0000',
  crimson: '#DC143C',
};

// Export a PhantomTokens object matching the shape of CosmicTokens:
// - colors: { neutral, brand, semantic, utility }
// - spacing (reuse cosmicSpacing)
// - radii: ALL values set to 0 (no rounded corners)
// - elevation: sharp drop-shadows (offset, no blur)
// - typography: Impact/Arial Black font families
```

> **CRITICAL**: The `PhantomTokens` object MUST have the same TypeScript shape as `CosmicTokens` so the `useTheme().t` property works with either.

### 3.2 Phantom UI Primitives

#### [NEW] `src/ui/phantom/index.ts`

Barrel export for all P5 primitives.

#### [NEW] `src/ui/phantom/PhantomBackground.tsx`

Replaces `CosmicBackground`. A pure black background with:

- A subtle halftone radial pattern (red dots on navy).
- Optional slow-rotating red starburst SVG behind content.

#### [NEW] `src/ui/phantom/JaggedCard.tsx`

The core P5 container. Replaces `GlowCard` in phantom mode.

**Props**: `children`, `rotation` (default `-2deg`), `skew` (default `-5deg`), `variant` (`'black'|'red'|'white'`).

**Implementation**:

```
<View style={{ transform: [{ rotate }, { skewX }] }}>
  <View style={{ backgroundColor, borderWidth: 3, borderColor: '#FFF' }}>
    {children}
  </View>
</View>
```

#### [NEW] `src/ui/phantom/StarburstTimer.tsx`

Replaces `ChronoDigits` + `HaloRing` for the focus timer in phantom mode.

**Visual**: White jagged polygon background, massive black Impact digits, red drop-shadow. Pulses when active.

#### [NEW] `src/ui/phantom/PhantomButton.tsx`

Replaces `RuneButton` and `LinearButton` in phantom mode.

**Visual**: Skewed rectangle, red or white fill, uppercase Impact text, sharp black border. Scales down on press.

#### [NEW] `src/ui/phantom/CallingCard.tsx`

A notification banner for urgent tasks:

- Slams down from top with overshoot animation.
- Red background, jagged edges, "ransom note" text.
- Auto-dismisses after 5 seconds.

#### [NEW] `src/ui/phantom/PhantomNavBar.tsx`

Custom bottom tab bar for phantom theme:

- Tilted square icons (each rotated -10deg).
- Red active indicator.
- Labels in uppercase Impact.

### 3.3 Screen-Level Changes (12 Screens)

For EACH screen, the existing `getStyles(isCosmic: boolean)` function becomes `getStyles(isCosmic: boolean, isPhantom: boolean)`. When `isPhantom` is true, return the P5 style overrides.

---

## 4. Files to Modify (EXISTING)

### 4.1 Theme System

#### [MODIFY] `src/theme/themeVariant.ts`

```diff
-export type ThemeVariant = 'linear' | 'cosmic';
+export type ThemeVariant = 'linear' | 'cosmic' | 'phantom';

 export const THEME_VARIANTS = {
   LINEAR: 'linear' as const,
   COSMIC: 'cosmic' as const,
+  PHANTOM: 'phantom' as const,
 };

 // Add to LEGACY_THEME_MAP:
+  phantom: 'phantom',

 // Add to THEME_METADATA:
+  phantom: {
+    label: 'Phantom',
+    description: 'High-energy Persona 5 style with jagged shapes and signal red',
+    preview: {
+      background: '#000000',
+      accent: '#D80000',
+      text: '#FFFFFF',
+    },
+  },
```

#### [MODIFY] `src/theme/ThemeProvider.tsx`

```diff
+import { PhantomTokens } from './phantomTokens';

 export function useTheme(): ThemeContextValue {
   const { variant, setVariant, _hasHydrated } = useThemeStore();

   return {
     variant,
     setVariant: async (v: ThemeVariant) => setVariant(v),
-    t: variant === 'cosmic' ? CosmicTokens : LinearTokens,
+    t: variant === 'cosmic' ? CosmicTokens : variant === 'phantom' ? PhantomTokens : LinearTokens,
     isCosmic: variant === 'cosmic',
     isLinear: variant === 'linear',
+    isPhantom: variant === 'phantom',
     isLoaded: _hasHydrated,
     metadata: THEME_METADATA[variant],
   };
 }
```

Also update `ThemeContextValue` interface to add `isPhantom: boolean`.

#### [MODIFY] `src/theme/tokens.ts`

Export `PhantomTokens` and its sub-tokens from `phantomTokens.ts`.

### 4.2 Navigation

#### [MODIFY] `src/navigation/AppNavigator.tsx`

- In `TabNavigator()`: When `isPhantom`, use `PhantomNavBar` as the custom `tabBar` component.
- Update background colors for phantom: `backgroundColor: '#000000'`.
- Update tab bar icon colors: active = `#D80000`, inactive = `#FFFFFF`.

### 4.3 All 12 Screens

Each screen follows the same modification pattern. Here is the exact change for each:

---

#### [MODIFY] `src/screens/HomeScreen.tsx` (971 lines)

**Current visual**: Grid of `ModeCard` or `GlowCard` tiles (Focus, Brain Dump, Fog Cutter, Ignite, Calendar, Chat).

**P5 transformation** (matching user's Stitch mockup — Image 1 "Kinetic Persona 5 Spark Variant"):

- Background: `PhantomBackground` (black + halftone).
- Top: A massive `StarburstTimer` showing "25:00 FOCUS NOW" as the dominant element.
- Middle: Two `JaggedCard` tiles — "IGNITE / START TASKS" and "FOG CUTTER / BREAK IT DOWN".
- Bottom: `PhantomNavBar`.
- All text uppercase Impact.
- Each card rotated -2 to 3 degrees alternating.

**Code changes**:

1. Import `useTheme` and destructure `isPhantom`.
2. Update `getStyles` signature to `getStyles(isCosmic, isPhantom)`.
3. Add `isPhantom` conditional block in the JSX return for the phantom layout.
4. Use `PhantomBackground` instead of `CosmicBackground` when `isPhantom`.
5. Replace `GlowCard` with `JaggedCard` when `isPhantom`.

---

#### [MODIFY] `src/screens/BrainDumpScreen.tsx` (856 lines)

**Current visual**: Text input + sorted item list with priority badges.

**P5 transformation** (matching Image 3 "Brain Dump Now"):

- Background: Chaotic collage of red + black torn paper shapes.
- Central element: Large white speech-bubble polygon with "BRAIN DUMP. NOW." text.
- Category icons (Star, Dagger, Mask) become red P5-style stamps.
- "SEND" button: Red starburst explosion shape.
- Input: White jagged container with black text.

**Code changes**:

1. Add `isPhantom` branching to `getStyles`.
2. Replace `BrainDumpInput` wrapper with `JaggedCard variant="white"`.
3. Replace action bar buttons with `PhantomButton`.
4. Category badges become red star/stamp icons (emoji or SVG).

---

#### [MODIFY] `src/screens/FogCutterScreen.tsx` (827 lines)

**Current visual**: Task list with micro-steps, AI breakdown feature.

**P5 transformation** (matching Image 5 "Which One Takes Priority?"):

- Background: Red radial sunburst pattern.
- Header: Jagged red banner "WHICH ONE TAKES PRIORITY?" with mask icon.
- Tasks displayed as massive overlapping black banners with white text.
- Bottom nav: P5 style with "FOG CUTTER / DAILY BRIEF / TASKS / PROJECTS / PROFILE" labels.

**Code changes**:

1. Add `isPhantom` branch.
2. Task items become full-width `JaggedCard` elements with large bold text.
3. The "Add task" input uses a `PhantomButton`.
4. Micro-steps are hidden behind a "DRILL DOWN" jagged button.

---

#### [MODIFY] `src/screens/PomodoroScreen.tsx` (420 lines)

**Current visual**: Circular timer with `ChronoDigits`, `HaloRing`, session controls.

**P5 transformation** (similar to "Focus Battle"):

- Background: Rotating halftone red/navy.
- Timer: `StarburstTimer` — white jagged polygon with massive black digits.
- "TARGET:" banner below timer with current task name.
- Buttons: "EXECUTE!" (red) and "ABANDON" (white) in `PhantomButton`.
- When active, the starburst pulses.

**Code changes**:

1. Replace `ChronoDigits` + `HaloRing` with `StarburstTimer` when `isPhantom`.
2. Replace `RuneButton` with `PhantomButton`.
3. Update background to `PhantomBackground`.

---

#### [MODIFY] `src/screens/IgniteScreen.tsx` (601 lines)

**Current visual**: 5-minute sprint timer with task selection.

**P5 transformation**:

- Same pattern as PomodoroScreen but with shorter timer.
- "IGNITE!" header in red starburst.
- Sprint progress shown as a jagged red progress bar (not circular).

---

#### [MODIFY] `src/screens/CalendarScreen.tsx` (804 lines)

**Current visual**: Month grid with event list.

**P5 transformation** (matching Image 4 "Calendar"):

- Background: Deep navy with subtle blue pattern.
- Header: Red jagged banner "SPARK ★ CALENDAR".
- Month title: White "OCTOBER 2024" with irregular letter spacing.
- Day cells: White squares with black borders, each slightly rotated.
- Today marker: Red starburst behind the date number.
- Bottom section: Three comic-panel cards for Morning/Afternoon/Evening.

---

#### [MODIFY] `src/screens/CheckInScreen.tsx` (477 lines)

**P5 transformation**:

- "HOW ARE YOU FEELING, PHANTOM?" header in jagged banner.
- Emotion buttons become jagged red/black tiles with P5 icons.
- Submit button is a red starburst.

---

#### [MODIFY] `src/screens/AnchorScreen.tsx` (383 lines)

**P5 transformation**:

- "TAKE A BREATH" as a massive jagged white banner.
- Breathing animation: Red pulsing circle with starburst edges.
- Instructions in white Impact text on black.

---

#### [MODIFY] `src/screens/CBTGuideScreen.tsx` (397 lines)

**P5 transformation**:

- "COGNITIVE REFRAME" header in red.
- Guide steps presented as numbered "mission objectives" in jagged cards.
- Progress: Red star stamps for completed steps.

---

#### [MODIFY] `src/screens/ChatScreen.tsx` (181 lines)

**P5 transformation**:

- Chat bubbles become speech-bubble polygons (jagged edges).
- User messages: Red background, white text.
- AI messages: White background, black text, slight rotation.
- Input: Black bar with white text, red "SEND" starburst button.

---

#### [MODIFY] `src/screens/InboxScreen.tsx` (604 lines)

**P5 transformation** (matching Image 2 "Urgent Message From Your Brain"):

- Urgent items: Full-width red `CallingCard` banner.
- "CURRENT OBJECTIVE" in white Impact text.
- "IT'S TIME!" urgency badge with target icon.
- Daily log items in black jagged cards.

---

#### [MODIFY] `src/screens/DiagnosticsScreen.tsx` (782 lines)

**P5 transformation**:

- "SYSTEM STATUS" header in jagged red.
- Diagnostic items as stacked jagged cards.
- Settings toggles with red/white P5 styling.

---

### 4.4 Shared Components

#### [MODIFY] `src/components/home/ModeCard.tsx`

Add `isPhantom` branch: render as `JaggedCard` with P5 typography.

#### [MODIFY] `src/components/ui/LinearButton.tsx`

Add `isPhantom` branch: render as skewed rectangle with P5 colors.

#### [MODIFY] `src/components/ui/LinearCard.tsx`

Add `isPhantom` branch: render as `JaggedCard`.

#### [MODIFY] `src/components/ui/EmptyState.tsx`

P5 empty state: "NO MISSIONS YET..." in jagged banner.

#### [MODIFY] `src/components/capture/CaptureBubble.tsx`

P5 variant: Red starburst floating action button instead of circular bubble.

---

## 5. Execution Order (Step-by-Step for LLM)

> **IMPORTANT**: Execute in this exact order. Each step depends on the previous.

### Phase A: Foundation (Do First)

1. Create `src/theme/phantomTokens.ts` — the complete token file.
2. Modify `src/theme/themeVariant.ts` — add `'phantom'` variant.
3. Modify `src/theme/ThemeProvider.tsx` — add `isPhantom`, import `PhantomTokens`.
4. Modify `src/theme/tokens.ts` — export phantom tokens.
5. Run `npx tsc --noEmit` — must pass with 0 errors.

### Phase B: UI Primitives (Do Second)

1. Create `src/ui/phantom/PhantomBackground.tsx`.
2. Create `src/ui/phantom/JaggedCard.tsx`.
3. Create `src/ui/phantom/StarburstTimer.tsx`.
4. Create `src/ui/phantom/PhantomButton.tsx`.
5. Create `src/ui/phantom/CallingCard.tsx`.
6. Create `src/ui/phantom/PhantomNavBar.tsx`.
7. Create `src/ui/phantom/index.ts` (barrel export).
8. Run `npx tsc --noEmit` — must pass.

### Phase C: Screen Integration (Do Third, One at a Time)

1. Modify `HomeScreen.tsx` — add phantom layout.
2. Modify `PomodoroScreen.tsx` — add phantom timer.
3. Modify `IgniteScreen.tsx` — add phantom sprint.
4. Modify `BrainDumpScreen.tsx` — add phantom dump.
5. Modify `FogCutterScreen.tsx` — add phantom priority.
6. Modify `CalendarScreen.tsx` — add phantom calendar.
7. Modify `InboxScreen.tsx` — add phantom inbox.
8. Modify `CheckInScreen.tsx` — add phantom check-in.
9. Modify `AnchorScreen.tsx` — add phantom anchor.
10. Modify `CBTGuideScreen.tsx` — add phantom guide.
11. Modify `ChatScreen.tsx` — add phantom chat.
12. Modify `DiagnosticsScreen.tsx` — add phantom settings.
13. Run `npx tsc --noEmit` after each screen.

### Phase D: Navigation & Shared Components (Do Fourth)

1. Modify `AppNavigator.tsx` — phantom tab bar and colors.
2. Modify `ModeCard.tsx`, `LinearButton.tsx`, `LinearCard.tsx`.
3. Modify `CaptureBubble.tsx`, `EmptyState.tsx`.
4. Final `npx tsc --noEmit` — must pass.

### Phase E: Polish (Do Last)

1. Add sound effect hooks (optional).
2. Add entry/exit animations to phantom components.
3. Test on device with `adb reverse` + Metro.

---

## 6. Verification Checklist

After every phase, verify:

- [ ] `npx tsc --noEmit` passes with 0 errors.
- [ ] App launches on device/emulator.
- [ ] Existing `cosmic` and `linear` themes still work.
- [ ] Switching to `phantom` shows the P5 aesthetic.
- [ ] Every container has rotation/skew (no plain rectangles).
- [ ] Signal Red (#D80000) is the dominant accent color.
- [ ] All text is high-contrast and legible despite the chaos.
- [ ] Bottom navigation is functional and styled.

---

## 7. Dependencies

### Required (Already in project)

- `react-native` — core rendering.
- `react-native-reanimated` — animations (if installed, otherwise use `Animated`).

### Potentially Needed

- `react-native-svg` — for complex jagged polygon shapes (if `clip-path` equivalent is needed). Check if already in `package.json`.
- Custom fonts — Impact/Earwig Factory. If not available, fallback to system `Impact` on Android (`fontFamily: 'Impact'`) or `Arial Black`.

---

## 8. Risk Assessment

| Risk | Mitigation |
|---|---|
| TypeScript errors from new variant | Match `PhantomTokens` shape exactly to `CosmicTokens` |
| Breaking existing themes | All changes are additive (`isPhantom` branches) |
| Performance from animations | Use `useNativeDriver: true` on all `Animated` calls |
| Font availability on Android | Bundle Impact.ttf in `android/app/src/main/assets/fonts/` OR fallback to system bold |
| Jagged shapes hard in RN (no clip-path) | Use rotated `View` composites or `react-native-svg` polygons |
