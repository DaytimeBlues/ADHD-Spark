# Cosmic Theme Implementation Plan

**Branch**: `ui-ux-redesign`  
**Base**: `master`  
**Scope**: Complete UI/UX redesign following deep-research-report (2).md specification  
**Target**: Cosmic-Mystic aesthetic with Roerich-adjacent visual language

---

## Phase 1: Foundation (Tokens + ThemeProvider)

### 1.1 Create `src/theme/cosmicTokens.ts`

**Purpose**: Complete design token system for Cosmic theme

**Color Palette**:
```typescript
// Neutrals
obsidian: '#070712',      // Deepest background
midnight: '#0B1022',      // Secondary background  
deepSpace: '#111A33',     // Card surfaces
slate: '#2A3552',         // Borders, dividers
mist: '#B9C2D9',          // Secondary text
starlight: '#EEF2FF',     // Primary text

// Accents (semantic)
nebulaViolet: '#8B5CF6',  // Primary (matches existing brand[500])
deepIndigo: '#243BFF',    // Links, secondary actions
auroraTeal: '#2DD4BF',    // Success, breathing states, focusRing
starlightGold: '#F6C177', // Warnings, calendar highlights
cometRose: '#FB7185',     // Errors, destructive actions
```

**Glow Definitions**:
```typescript
glowSoft: {
  shadowColor: '#8B5CF640',  // 25% opacity
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 8,
  elevation: 4
},
glowMedium: {
  shadowColor: '#8B5CF680',  // 50% opacity
  shadowRadius: 16,
  elevation: 8
},
glowStrong: {
  shadowColor: '#8B5CF6',    // 100% opacity
  shadowRadius: 32,
  elevation: 16
}
```

**Typography Scale** (same structure as linearTokens, different values):
- Body: Inter (existing font family)
- Headers: Space Grotesk (need to add to assets or use Inter as fallback)
- Timer: monospace with `tabular-nums` font variant
- Use same numeric key structure as linearTokens: 12, 14, 16, 18, 20, 24, 32, 48, 64

**Border Radius** (different from Linear - use rounded vs sharp):
- sm: 4, md: 8, lg: 12, xl: 16, 2xl: 24, full: 9999

**Implementation Requirements**:
- Export `CosmicTokens` object matching shape of `LinearTokens`
- Include both `spacing` and `radii` with same numeric key pattern
- Include `glow` definitions as shadow configurations
- Export TypeScript interfaces for type safety

### 1.2 Create `src/theme/cosmicMotion.ts`

**Purpose**: Cosmic-themed animation timing and easing

**Duration Tokens**:
```typescript
press: 100,      // 80-120ms range
hover: 150,      // 120-180ms range
screen: 400,     // 320-480ms range
breathing: 6000, // 4-6s range
```

**Easing Curves**:
- Use ease-out for entering elements
- Use ease-in-out for breathing animations
- Respect reduced motion preferences via `useReducedMotion()`

### 1.3 Create `src/theme/themeVariant.ts`

**Purpose**: Type definitions and variant utilities

**Content**:
```typescript
export type ThemeVariant = 'linear' | 'cosmic';

export const THEME_VARIANTS = {
  LINEAR: 'linear' as const,
  COSMIC: 'cosmic' as const
};

// Migration helper for legacy theme values
export function migrateThemeVariant(value: string | null): ThemeVariant {
  if (value === 'cosmic') return 'cosmic';
  // Any other legacy value defaults to linear
  return 'linear';
}
```

### 1.4 Create `src/theme/ThemeProvider.tsx`

**Purpose**: Context provider with AsyncStorage persistence

**API Design**:
```typescript
interface ThemeContextValue {
  variant: ThemeVariant;
  setVariant: (v: ThemeVariant) => Promise<void>;
  t: typeof Tokens;  // Resolved tokens object
  isCosmic: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode });
export function useTheme(): ThemeContextValue;
```

**Implementation Requirements**:
1. On mount, read `STORAGE_KEYS.theme` from AsyncStorage
2. Parse value through `migrateThemeVariant()` for backwards compatibility
3. Export `t` that resolves to correct token set based on variant
4. `setVariant` persists to AsyncStorage and updates state
5. Handle errors gracefully (default to linear on read failure)

**Storage Schema**:
- Key: `theme` (already exists in STORAGE_KEYS)
- Value: `'cosmic'` | `'linear'`

### 1.5 Update `src/theme/tokens.ts`

**Purpose**: Make tokens dynamic based on theme variant

**Changes**:
```typescript
// Re-export both token sets
export { LinearTokens } from './linearTokens';
export { CosmicTokens } from './cosmicTokens';
export { ThemeVariant, migrateThemeVariant } from './themeVariant';

// Default export stays LinearTokens for backwards compatibility
// ThemeProvider will provide the correct variant via useTheme().t
```

---

## Phase 2: Primitives (Cosmic UI Components)

### 2.1 Create `src/ui/cosmic/CosmicBackground.tsx`

**Purpose**: Screen atmosphere wrapper with background variants

**API**:
```typescript
interface CosmicBackgroundProps {
  children: React.ReactNode;
  variant: 'ridge' | 'nebula' | 'moon';
  dimmer?: boolean;  // Darken for focus screens
  style?: ViewStyle;
}

export function CosmicBackground({ 
  variant, 
  dimmer = false, 
  children,
  style 
}: CosmicBackgroundProps);
```

**Background Implementations**:

**Ridge** (Home, FogCutter, CBTGuide, Diagnostics):
- Web: CSS linear-gradient with mountain silhouette overlay (SVG data URI or pure CSS shapes)
- Colors: obsidian → midnight gradient
- Subtle texture overlay using repeating gradient

**Nebula** (Ignite, Pomodoro):
- Web: Radial gradient centered, luminous center
- Colors: deepSpace center → obsidian edges
- Optional: Subtle animated gradient shift (very subtle, respect reduced motion)

**Moon** (Anchor, CheckIn, Calendar, Tasks, BrainDump):
- Web: Radial gradient with soft halo from center-top
- Colors: midnight center → obsidian edges
- Calm, grounded feeling

**Native Degradation**:
- All variants degrade to solid `Colors.obsidian` on native
- Use `Platform.OS === 'web'` guards for CSS gradient styles

**Implementation Pattern**:
```typescript
const backgroundStyles = {
  ridge: Platform.select({
    web: {
      background: 'linear-gradient(180deg, #070712 0%, #0B1022 50%, #111A33 100%)',
      // Additional CSS for texture
    },
    default: { backgroundColor: Colors.obsidian }
  }),
  // ... nebula, moon
};
```

### 2.2 Create `src/ui/cosmic/GlowCard.tsx`

**Purpose**: Semantic surface container with glow levels

**API**:
```typescript
type GlowLevel = 'none' | 'soft' | 'medium' | 'strong';
type SurfaceTone = 'base' | 'raised' | 'sunken';

interface GlowCardProps {
  children: React.ReactNode;
  glow?: GlowLevel;
  tone?: SurfaceTone;
  testID?: string;
  style?: ViewStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
}

export function GlowCard({
  glow = 'none',
  tone = 'base',
  children,
  ...props
}: GlowCardProps);
```

**Visual Specifications**:

**Glow Levels**:
- `none`: No shadow, just surface
- `soft`: 8px blur, 25% opacity violet (selected/hover/active)
- `medium`: 16px blur, 50% opacity violet (primary action available)
- `strong`: 32px blur, 100% opacity violet (ongoing active state - timer running)

**Surface Tones**:
- `base`: `Colors.deepSpace` background
- `raised`: `Colors.deepSpace` with subtle inner highlight (border-top: 1px rgba(255,255,255,0.05))
- `sunken`: `Colors.midnight` background (pressed states, inputs)

**Border**:
- Always 1px border using `Colors.slate` at 30% opacity
- Border radius: `radii.lg` (12px)

**Implementation Notes**:
- Use `Platform.select` for web shadow styles
- On native, use `elevation` from glow definitions
- Ensure 48px minimum touch target when onPress provided

### 2.3 Create `src/ui/cosmic/RuneButton.tsx`

**Purpose**: Themed button with focus ring and glow states

**API**:
```typescript
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface RuneButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  glow?: GlowLevel;  // Override automatic glow
  testID?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function RuneButton({ ... }: RuneButtonProps);
```

**Visual Specifications**:

**Variant Styles**:
- `primary`: nebulaViolet background, starlight text, glowMedium on idle
- `secondary`: transparent background, violet border, violet text
- `ghost`: transparent background, mist text, subtle hover background
- `danger`: cometRose background tint (subtle), cometRose text

**Size Heights**:
- `sm`: 32px
- `md`: 44px
- `lg`: 56px

**Focus Ring** (Web Only):
- 2px solid auroraTeal
- 2px offset (outline-offset style via box-shadow on web)
- Only visible on keyboard focus, not mouse/touch

**Press State**:
- Scale to 0.98
- Duration: 100ms
- Use `useReducedMotion()` to skip scale animation

**Haptics**:
- Light haptic on press (same as LinearButton)

**Implementation Pattern**:
```typescript
// Web focus ring detection
const [isFocused, setIsFocused] = useState(false);
const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);

// On web, detect if focus came from keyboard vs mouse
const handleFocus = (e: FocusEvent) => {
  setIsFocused(true);
  if (e.nativeEvent.detail === 0) {  // Keyboard focus
    setIsKeyboardFocused(true);
  }
};

const handleBlur = () => {
  setIsFocused(false);
  setIsKeyboardFocused(false);
};
```

### 2.4 Create `src/ui/cosmic/ChronoDigits.tsx`

**Purpose**: Timer numerals with tabular-nums and optional glow

**API**:
```typescript
interface ChronoDigitsProps {
  value: string;  // Formatted time string (e.g., "25:00")
  size?: 'sm' | 'md' | 'lg' | 'hero';
  glow?: 'none' | 'soft' | 'strong';
  color?: 'default' | 'success' | 'warning';
  testID?: string;
}

export function ChronoDigits({ ... }: ChronoDigitsProps);
```

**Visual Specifications**:

**Typography**:
- Font: monospace (system font)
- fontVariant: ['tabular-nums'] (prevents layout shift during countdown)
- Weights: 400 (sm/md), 600 (lg), 700 (hero)

**Sizes**:
- `sm`: 24px (inline timers)
- `md`: 36px (compact displays)
- `lg`: 48px (standard timer)
- `hero`: 72px (Ignite/Pomodoro main display)

**Colors**:
- `default`: starlight
- `success`: auroraTeal (break time, completed states)
- `warning`: starlightGold (last few seconds)

**Glow**:
- `soft`: Subtle text-shadow glow
- `strong`: Bright text-shadow glow (running state)

**Web Text Shadow**:
```typescript
// In style:
textShadow: glow === 'strong' 
  ? '0 0 32px rgba(139, 92, 246, 0.8), 0 0 64px rgba(139, 92, 246, 0.4)'
  : glow === 'soft'
  ? '0 0 16px rgba(139, 92, 246, 0.5)'
  : undefined
```

### 2.5 Create `src/ui/cosmic/HaloRing.tsx`

**Purpose**: Timer progress ring + breathing ring with Reanimated

**API**:
```typescript
type HaloMode = 'progress' | 'breath';

interface HaloRingProps {
  mode: HaloMode;
  progress: number;  // 0-1 for progress mode
  size?: number;     // Default: 280
  strokeWidth?: number;  // Default: 8
  glow?: 'none' | 'soft' | 'medium' | 'strong';
  testID?: string;
}

export function HaloRing({ ... }: HaloRingProps);
```

**Visual Specifications**:

**Progress Mode** (Ignite, Pomodoro):
- SVG circle with stroke-dasharray animation
- Background track: slate at 20% opacity
- Progress arc: nebulaViolet with gradient
- Glow on progress arc matching glow prop

**Breath Mode** (Anchor):
- Two animated rings:
  1. Outer "inhale" ring: expands/contracts with 4s cycle
  2. Inner "hold" indicator: opacity pulse
- Animation controlled by Reanimated
- Must respect `useReducedMotion()` - disable animation if true

**Breath Animation Spec**:
- Inhale: 4s (scale 1 → 1.1, opacity 0.5 → 1)
- Hold: 2s (maintain)
- Exhale: 4s (scale 1.1 → 1, opacity 1 → 0.5)
- Loop indefinitely

**Reanimated Implementation**:
```typescript
const breathing = useSharedValue(0);

useEffect(() => {
  if (mode === 'breath' && !reduceMotion) {
    breathing.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
      -1,  // Infinite
      true  // Reverse
    );
  }
}, [mode, reduceMotion]);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: 1 + breathing.value * 0.1 }],
  opacity: 0.5 + breathing.value * 0.5
}));
```

### 2.6 Create `src/ui/cosmic/index.ts`

**Purpose**: Public API barrel export

**Content**:
```typescript
export { CosmicBackground } from './CosmicBackground';
export { GlowCard } from './GlowCard';
export { RuneButton } from './RuneButton';
export { ChronoDigits } from './ChronoDigits';
export { HaloRing } from './HaloRing';

// Re-export types
export type { 
  GlowLevel, 
  SurfaceTone,
  ButtonVariant,
  ButtonSize,
  HaloMode 
} from './types';
```

### 2.7 Create `src/ui/cosmic/types.ts`

**Purpose**: Shared type definitions for cosmic components

**Content**:
```typescript
export type GlowLevel = 'none' | 'soft' | 'medium' | 'strong';
export type SurfaceTone = 'base' | 'raised' | 'sunken';
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type HaloMode = 'progress' | 'breath';
```

---

## Phase 3: Screen Integration

### Integration Strategy

For each screen:
1. Wrap root content in `CosmicBackground` with correct variant
2. Replace `LinearCard` usages with `GlowCard`
3. Replace `LinearButton` usages with `RuneButton`
4. Update timer displays to use `ChronoDigits`
5. Update timer rings to use `HaloRing`
6. Maintain all business logic, handlers, navigation, testIDs
7. Keep all rationaleCards (they're part of the UX)

### Screen-by-Screen Plan

#### 3.1 HomeScreen (`src/screens/HomeScreen.tsx`)

**Background**: `ridge`
**Changes**:
1. Wrap main content in `CosmicBackground variant="ridge"`
2. `ModeCard` components: Wrap in `GlowCard glow="soft"` when hovered/focused
3. Resume CTA (if exists): `RuneButton variant="primary"` with `glow="medium"`
4. Header text: Use `Colors.starlight`
5. Subtitle text: Use `Colors.mist`

**Glow Strategy**:
- `glowSoft` on hovered ModeCard
- `glowMedium` on resume CTA if session exists

**Preserve**:
- All `ModeCard` logic (onPress, evidenceTier, mode)
- `ReEntryPrompt` component usage
- `useReducedMotion` hook usage
- All testIDs

#### 3.2 IgniteScreen (`src/screens/IgniteScreen.tsx`)

**Background**: `nebula` with `dimmer=true`
**Changes**:
1. Wrap in `CosmicBackground variant="nebula" dimmer`
2. Replace timer display with `ChronoDigits size="hero"`
3. Replace progress ring with `HaloRing mode="progress"`
4. Start button: `RuneButton variant="primary"` with `glow="medium"` when idle
5. During running: Timer gets `glow="strong"`, button loses glow

**Glow Strategy**:
- Idle: Button `glowMedium`, timer `glowNone`
- Running: Timer `glowStrong`, button drops to `glowNone`

**Preserve**:
- `useTimer` hook usage
- `formattedTime` calculation
- All sound effect calls
- Background timer logic

#### 3.3 FogCutterScreen (`src/screens/FogCutterScreen.tsx`)

**Background**: `ridge` with `dimmer=true`
**Changes**:
1. Wrap in `CosmicBackground variant="ridge" dimmer`
2. Current step card: `GlowCard glow="soft"`
3. Next step button: `RuneButton variant="primary"` with `glow="medium"`
4. Step list items: `GlowCard glow="none"` (default)

**Glow Strategy**:
- "Next step" button: `glowMedium`
- Current step card: `glowSoft`

**Preserve**:
- Step progression logic
- Haptic feedback
- All testIDs

#### 3.4 PomodoroScreen (`src/screens/PomodoroScreen.tsx`)

**Background**: `nebula`
**Changes**:
1. Wrap in `CosmicBackground variant="nebula"`
2. Same pattern as IgniteScreen for timer/ring
3. Break state: Shift accent to `auroraTeal` (ChronoDigits color="success")

**Glow Strategy**:
- Same as Ignite

**Preserve**:
- Cycle state management (work/break/longBreak)
- Auto-advance logic

#### 3.5 AnchorScreen (`src/screens/AnchorScreen.tsx`)

**Background**: `moon`
**Changes**:
1. Wrap in `CosmicBackground variant="moon"`
2. Replace breathing circle with `HaloRing mode="breath"`
3. Timer display: `ChronoDigits` during guided session
4. Begin button: `RuneButton` with `glow="medium"`

**Glow Strategy**:
- Begin: Button `glowMedium`
- Active: Ring `glowStrong`

**Preserve**:
- Breathing animation logic
- Cycle counting
- `useReducedMotion` handling

#### 3.6 BrainDumpScreen (`src/screens/BrainDumpScreen.tsx`)

**Background**: `moon` with `dimmer=true`
**Changes**:
1. Wrap in `CosmicBackground variant="moon" dimmer`
2. Capture card: `GlowCard glow="soft"`
3. AI sort button: `RuneButton variant="primary"` with `glow="medium"` when suggestions available
4. Task list items: `GlowCard glow="none"`

**Glow Strategy**:
- AI sort available: `glowMedium`
- Capture card focused: `glowSoft`

**Preserve**:
- All task management logic
- AI sorting integration
- Drag-and-drop (if present)

#### 3.7 CheckInScreen (`src/screens/CheckInScreen.tsx`)

**Background**: `moon`
**Changes**:
1. Wrap in `CosmicBackground variant="moon"`
2. Single card layout: `GlowCard glow="soft"`
3. Save button: `RuneButton variant="primary"` with `glow="medium"`

**Glow Strategy**:
- Save button: `glowMedium`

**Preserve**:
- Mood/symptom tracking logic
- EvidenceBadge usage
- Calendar integration

#### 3.8 CalendarScreen (`src/screens/CalendarScreen.tsx`)

**Background**: `moon` with `dimmer=true`
**Changes**:
1. Wrap in `CosmicBackground variant="moon" dimmer`
2. Calendar header: Use `Colors.starlightGold` for "Today" marker
3. Day cells: `GlowCard` with conditional glow
4. Event cards: `GlowCard glow="soft"`

**Glow Strategy**:
- Today marker: `starlightGold` accent
- Selected day: `glowSoft`

**Preserve**:
- Calendar navigation logic
- Event display logic

#### 3.9 CBTGuideScreen (`src/screens/CBTGuideScreen.tsx`)

**Background**: `ridge`
**Changes**:
1. Wrap in `CosmicBackground variant="ridge"`
2. Content scroll card: `GlowCard glow="soft"`
3. Continue button: `RuneButton variant="primary"` with `glow="medium"`

**Glow Strategy**:
- Continue: `glowMedium`

**Preserve**:
- CBT content structure
- Progress tracking
- EvidenceBadge usage

#### 3.10 DiagnosticsScreen (`src/screens/DiagnosticsScreen.tsx`)

**Background**: `ridge` with `dimmer=true`
**Changes**:
1. Wrap in `CosmicBackground variant="ridge" dimmer`
2. Summary card: `GlowCard glow="soft"`
3. Copy/export buttons: `RuneButton` with `glow="medium"`
4. Theme toggle: Add new section at bottom (see Phase 5)

**Glow Strategy**:
- Copy/export: `glowMedium`

**Preserve**:
- All diagnostic data display
- Log clearing functionality
- Storage debugging

---

## Phase 4: Navigation Theming

### 4.1 Update `src/navigation/AppNavigator.tsx`

**Changes**:
1. Wrap navigator in `ThemeProvider`
2. Access theme via `useTheme()` hook
3. Update tab bar styling to use cosmic tokens when variant === 'cosmic'

**Tab Bar Styling**:
```typescript
// In Tab.Navigator screenOptions
tabBarStyle: {
  backgroundColor: isCosmic ? Colors.midnight : Tokens.colors.neutral.darkest,
  borderTopColor: isCosmic ? Colors.slate : Tokens.colors.neutral.light,
  // ... other styles
},
tabBarActiveTintColor: isCosmic ? Colors.nebulaViolet : Tokens.colors.brand[500],
tabBarInactiveTintColor: isCosmic ? Colors.mist : Tokens.colors.neutral.medium,
```

### 4.2 Update `src/navigation/WebNavBar.tsx`

**Changes**:
1. Use cosmic tokens for background, text colors
2. Update button styles to match theme

---

## Phase 5: Theme Toggle UI

### 5.1 Add Theme Toggle to DiagnosticsScreen

**Location**: New section at bottom of screen, above "Clear All App Data"

**UI**:
1. Section title: "Appearance"
2. Two options displayed as cards:
   - "Linear" (current aesthetic)
   - "Cosmic" (new aesthetic)
3. Selected state indicated with checkmark and `glowSoft`
4. Tap to switch, persists immediately

**Implementation**:
```typescript
const { variant, setVariant } = useTheme();

// In render:
<GlowCard 
  glow={variant === 'cosmic' ? 'soft' : 'none'}
  onPress={() => setVariant('cosmic')}
>
  <Text style={styles.optionTitle}>Cosmic</Text>
  <Text style={styles.optionDescription}>Mystical dark theme with subtle glows</Text>
  {variant === 'cosmic' && <CheckmarkIcon />}
</GlowCard>
```

---

## Phase 6: Testing

### 6.1 Unit Tests for New Components

Create `__tests__/cosmic/` directory:

**`CosmicBackground.test.tsx`**:
- Test all three variants render correctly
- Test dimmer prop
- Test Platform.OS guards

**`GlowCard.test.tsx`**:
- Test all glow levels
- Test all surface tones
- Test onPress handling
- Test accessibility props

**`RuneButton.test.tsx`**:
- Test all variants render
- Test disabled state
- Test loading state
- Test haptics (mock)

**`ChronoDigits.test.tsx`**:
- Test all sizes
- Test tabular-nums font variant
- Test glow levels

**`HaloRing.test.tsx`**:
- Test progress mode
- Test breath mode
- Test reduced motion respect

### 6.2 Update Screen Tests

All existing screen tests should pass because:
- testIDs are preserved
- Business logic is unchanged
- Only presentation layer changed

Run existing tests to verify no regressions:
```bash
npm test
npm run e2e
```

---

## File Checklist

### New Files to Create:

**Theme (5 files)**:
- [ ] `src/theme/cosmicTokens.ts`
- [ ] `src/theme/cosmicMotion.ts`
- [ ] `src/theme/themeVariant.ts`
- [ ] `src/theme/ThemeProvider.tsx`
- [ ] `src/theme/index.ts` (update to re-export)

**Components (7 files)**:
- [ ] `src/ui/cosmic/types.ts`
- [ ] `src/ui/cosmic/CosmicBackground.tsx`
- [ ] `src/ui/cosmic/GlowCard.tsx`
- [ ] `src/ui/cosmic/RuneButton.tsx`
- [ ] `src/ui/cosmic/ChronoDigits.tsx`
- [ ] `src/ui/cosmic/HaloRing.tsx`
- [ ] `src/ui/cosmic/index.ts`

**Tests (5+ files)**:
- [ ] `__tests__/cosmic/CosmicBackground.test.tsx`
- [ ] `__tests__/cosmic/GlowCard.test.tsx`
- [ ] `__tests__/cosmic/RuneButton.test.tsx`
- [ ] `__tests__/cosmic/ChronoDigits.test.tsx`
- [ ] `__tests__/cosmic/HaloRing.test.tsx`

### Files to Modify:

**Screens (10 files)**:
- [ ] `src/screens/HomeScreen.tsx` - ridge
- [ ] `src/screens/IgniteScreen.tsx` - nebula + dimmer
- [ ] `src/screens/FogCutterScreen.tsx` - ridge + dimmer
- [ ] `src/screens/PomodoroScreen.tsx` - nebula
- [ ] `src/screens/AnchorScreen.tsx` - moon
- [ ] `src/screens/BrainDumpScreen.tsx` - moon + dimmer
- [ ] `src/screens/CheckInScreen.tsx` - moon
- [ ] `src/screens/CalendarScreen.tsx` - moon + dimmer
- [ ] `src/screens/CBTGuideScreen.tsx` - ridge
- [ ] `src/screens/DiagnosticsScreen.tsx` - ridge + dimmer + theme toggle

**Navigation (2 files)**:
- [ ] `src/navigation/AppNavigator.tsx` - ThemeProvider wrap, tab bar styling
- [ ] `src/navigation/WebNavBar.tsx` - Theme-aware styling

**Theme (1 file)**:
- [ ] `src/theme/tokens.ts` - Re-export cosmic tokens

---

## Critical Implementation Notes

### 1. Backwards Compatibility
- Default theme is `linear` (existing aesthetic)
- All existing screens work without ThemeProvider
- ThemeProvider provides tokens that match LinearTokens shape

### 2. Platform Guards
- All CSS gradient styles guarded with `Platform.OS === 'web'`
- Native degrades gracefully to solid colors
- Test on both platforms (or at least verify via code review)

### 3. Performance
- Use `React.memo()` on all cosmic components
- Use `useMemo()` for computed styles
- Reanimated worklets for breath animation (not JS thread)

### 4. Accessibility
- 4.5:1 contrast ratio minimum (starlight on obsidian passes)
- 48px minimum touch targets
- Visible focus rings on web (auroraTeal)
- Respect reduced motion preferences

### 5. Token Shape Compatibility
Ensure CosmicTokens exports EXACT same shape as LinearTokens:
```typescript
// LinearTokens has:
{
  colors: { neutral: {...}, brand: {...}, utility: {...} },
  spacing: { 1: 4, 2: 8, ... },  // numeric keys
  radii: { sm: 0, md: 0, ... },  // named keys
  elevation: { sm: {...}, ... },
  typography: { heading: {...}, body: {...} }
}

// CosmicTokens must match this structure exactly
```

### 6. Glow Implementation Notes
- Web: Use `boxShadow` with spread/blur
- Native: Use `shadow*` properties from StyleSheet
- Test on real devices - glow may need adjustment per platform

---

## Success Criteria

- [ ] All 108 unit tests pass
- [ ] All 30 E2E tests pass (or same number passing as before)
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] Theme toggle works and persists
- [ ] All 10 screens display with cosmic aesthetic when theme is cosmic
- [ ] Reduced motion respected throughout
- [ ] Web and native both functional
- [ ] No console warnings in dev

---

## Appendix: Color Token Mapping Reference

| Linear Token | Cosmic Token | Usage |
|--------------|--------------|-------|
| `neutral.darkest` | `obsidian` | Backgrounds |
| `neutral.dark` | `midnight` | Card backgrounds |
| `neutral.medium` | `slate` | Borders |
| `neutral.light` | `mist` | Secondary text |
| `neutral.lightest` | `starlight` | Primary text |
| `brand[500]` | `nebulaViolet` | Primary accent |
| N/A | `auroraTeal` | Success, focus, breathing |
| N/A | `starlightGold` | Warning, highlights |
| N/A | `cometRose` | Error, danger |

