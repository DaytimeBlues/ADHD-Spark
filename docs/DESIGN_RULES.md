# Design Rules (Web-First, Android Web Compatible)

This repo uses a strict set of UI/UX rules to avoid arbitrary design decisions and keep the UI consistent, readable, and maintainable.

The key idea: define the "rules of the universe" (tokens + patterns) before generating or refactoring screens.

## Scope

- Primary target: Web.
- Must also work on Android web (Chrome).
- React Native + react-native-web.

## Feature-First Workflow

1. Do not start by building an application shell (nav, sidebar, global layout).
2. Start with one core feature screen in isolation (e.g., Home, Brain Dump).
3. Only after the core feature UI is stable, wrap it in navigation and shared layout.

## Token System (No Arbitrary Values)

All styling must snap to tokens.

Canonical token file:
- `src/theme/tokens.ts`

### Spacing

Only use values from `Tokens.spacing`.

Approved scale (px): 0, 4, 8, 12, 16, 24, 32, 48, 64, 96

Rules:
- No ad-hoc margin/padding numbers.
- Group spacing: spacing between groups must be >= 2x spacing within a group.

### Typography

Only use values from `Tokens.type`.

Rules:
- No random font sizes.
- Use color/weight for hierarchy before increasing size.
- Keep line-height readable (target 1.5 for body text).
- Avoid center-aligning mixed-size text on a single line; use baseline alignment.

### Color

Only use values from `Tokens.colors`.

Rules:
- Use palette shades (8-10 shades per family) rather than single hexes.
- Use HSL strings for harmony and predictable adjustments.
- Avoid opacity-based contrast for primary text; choose a proper shade.
- Do not make every destructive action bright red; reserve high-contrast red for primary destructive actions.

### Elevation / Shadows

Only use `Tokens.elevation`.

Rules:
- Use a consistent light source (top-down).
- Interactive press states reduce elevation (button looks "pressed").

### Radii

Only use `Tokens.radii`.

Rules:
- Use pill radius for pill buttons, md/lg for cards.
- Do not invent new radii.

### Component Sizes

Rules:
- Tap targets must be >= 44x44px (prefer 48x48px on touch).
- Prefer max-width containers for readable content (do not stretch everything to full width).

## Visual Hierarchy Rules

- De-emphasize secondary information (lighter color / lower weight) instead of making primary content bigger.
- Avoid "Label: Value" when the value is self-evident (e.g., emails).
- Links should not default to blue+underline everywhere; use subtle styling and reveal affordance on interaction.
- Empty states must be explicit components with a primary action.

## Interaction & UX Laws (Enforced)

- Fitts: ensure tap targets >= 44px and padding creates hit area even for icons.
- Hick: if >5 options, provide a recommended option or progressive disclosure.
- Miller: if forms have many inputs, split into groups (fieldsets/sections).
- Postel: accept flexible user input (trim whitespace, normalize formatting).
- Zeigarnik: visualize progress for multi-step flows.
- Peak-End: success states should feel rewarding and clear.

## Web + Android Web Requirements

### Viewport / Safe Area

- Set viewport: `width=device-width, initial-scale=1, viewport-fit=cover`.
- Avoid fixed bottom bars without accounting for safe-area insets.

### Dynamic Viewport Height

- Prefer `100dvh` semantics in web CSS (when applicable).

### Touch Devices

- Prefer comfortable tap targets (48x48).
- Ensure at least 8px spacing between targets.

### Pointer Modes

- Use pointer events; do not rely on legacy touch events.
- For desktop web, add hover/cursor affordances where appropriate.

## Code Cleanliness Rules

- No magic numbers: values must come from tokens or named constants.
- Small functions: extract nested logic into named helpers.
- SRP: keep business logic out of view components; use hooks/services.
- Delete dead code; do not comment out old code.
- One language per file (avoid embedding HTML/JS inside native strings).

## Naming Conventions

- Prefer intention-revealing names.
- Use standard pattern names when helpful (Factory, Decorator, Command) for design intent.

## Enforcement Checklist (PR Review)

- All spacing uses `Tokens.spacing` (or named constants derived from it).
- All font sizes use `Tokens.type`.
- No new hex literals in UI code (use `Tokens.colors`).
- Tap targets meet >=44px (>=48px on touch-heavy surfaces).
- Text blocks use max-width for readability.
- Group spacing follows 2x rule.
- No new duplicate UI primitives; extend existing components.
- Web works on Android Chrome (manual smoke: nav, scroll, inputs, modals).

## Migration Strategy (Repo-Wide)

- Phase A: Create and stabilize tokens (`src/theme/tokens.ts`).
- Phase B: Update shared UI primitives (MetroButton/MetroTile/MetroCard) to consume tokens.
- Phase C: Feature-first refactor of Home + Brain Dump.
- Phase D: Sweep remaining screens, then do cleanup (split large files, remove duplicates).
