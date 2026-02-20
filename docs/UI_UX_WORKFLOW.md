# UI/UX Redesign Workflow

**Formal process for experimenting with UI/UX changes without breaking production code.**

---

## Overview

This document establishes a safe, systematic workflow for UI/UX experimentation. It allows for rapid iteration, side-by-side comparison, and zero-risk experimentation.

### Core Principles

1. **Never Touch Working Code** — Always build new versions in `lab/` folders first
2. **Branch Per Experiment** — Each major redesign gets its own git branch
3. **Theme-Based Switching** — Use the theme system to toggle between old/new designs
4. **Component Variants** — Build V2 components alongside V1, swap via theme
5. **Dev-Only Tools** — Theme switcher and component showcase only appear in `__DEV__`

---

## Quick Start

### Starting a New UI/UX Experiment

```bash
# 1. Create a new branch for the experiment
git checkout -b ui-ux-experiment-[NAME]
# Example: git checkout -b ui-ux-experiment-neon-theme

# 2. Create lab structure (if not exists)
mkdir -p src/ui/lab src/theme/lab src/screens/lab

# 3. Add your experimental theme variant
# See "Creating a New Theme" below

# 4. Build components in lab/ folder
# See "Component Variants Pattern" below

# 5. Test with ThemeSwitcher and ComponentShowcase
# See "Dev Tools" below
```

### Switching Between Designs

During development, use the ThemeSwitcher UI to toggle instantly:
- `linear` — Original monochrome theme
- `cosmic` — Current deep space theme  
- `lab-*` — Your experimental themes

---

## Folder Structure

```
src/
├── ui/
│   ├── cosmic/           # Current production components
│   │   ├── Button.tsx
│   │   ├── GlowCard.tsx
│   │   └── ...
│   ├── lab/              # EXPERIMENTAL COMPONENTS (gitignored suggestions)
│   │   ├── ButtonV2.tsx
│   │   ├── CardNeon.tsx
│   │   └── ...
│   └── Button.tsx        # Smart switcher (routes to cosmic/ or lab/)
├── theme/
│   ├── cosmicTokens.ts   # Current production tokens
│   ├── linearTokens.ts   # Original tokens
│   ├── lab/              # EXPERIMENTAL THEMES
│   │   ├── neonTokens.ts
│   │   ├── minimalTokens.ts
│   │   └── ...
│   ├── ThemeProvider.tsx # Theme context provider
│   └── themeVariant.ts   # Theme variant definitions
└── screens/
    ├── HomeScreen.tsx    # Current production screen
    └── lab/
        └── HomeScreenV2.tsx  # EXPERIMENTAL SCREEN
```

---

## The Lab Folder Convention

### What Goes in `lab/`?

| Type | Location | Examples |
|------|----------|----------|
| Experimental themes | `src/theme/lab/` | `neonTokens.ts`, `glassmorphismTokens.ts` |
| Experimental components | `src/ui/lab/` | `ButtonV2.tsx`, `FloatingCard.tsx` |
| Experimental screens | `src/screens/lab/` | `HomeScreenRedesigned.tsx` |
| Dev tools | `src/components/dev/` | `ThemeSwitcher.tsx`, `ComponentShowcase.tsx` |

### Lab Folder Rules

1. **Never import from `lab/` in production code** — Only the theme switcher imports lab items
2. **Lab items can import from production** — Experimental ButtonV2 can use production hooks
3. **Keep lab experiments self-contained** — One theme = one file with all tokens
4. **Document your experiments** — Add JSDoc comments explaining what you're testing
5. **Clean up old experiments** — Delete lab files when experiment concludes

---

## Creating a New Theme

### Step 1: Create Theme Tokens

**`src/theme/lab/neonTokens.ts`**:
```typescript
/**
 * Neon Theme Experiment
 * 
 * Testing: High-contrast neon accents on dark backgrounds
 * Hypothesis: Better visibility for ADHD users
 * Date: 2024-01-15
 * Status: Active experiment
 */

import { Platform } from 'react-native';

export const NeonTokens = {
  colors: {
    // Completely different palette
    primary: '#FF00FF',     // Magenta neon
    secondary: '#00FFFF',   // Cyan neon
    background: '#0A0A0A',  // Near-black
    surface: '#141414',     // Slightly lighter
    // ... define all colors
  },
  spacing: {
    // Different spacing scale
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 48,  // More dramatic spacing
  },
  // ... rest of tokens
} as const;

export type NeonTokensType = typeof NeonTokens;
```

### Step 2: Register Theme Variant

**`src/theme/themeVariant.ts`** (add to existing file):
```typescript
export const THEME_VARIANTS = ['linear', 'cosmic', 'lab-neon'] as const;

export const THEME_METADATA = {
  'linear': { name: 'Linear', description: 'Monochrome professional' },
  'cosmic': { name: 'Cosmic', description: 'Deep space ethereal' },
  'lab-neon': { name: 'Neon (Lab)', description: 'Experimental high-contrast' },
} as const;
```

### Step 3: Update ThemeProvider

**`src/theme/ThemeProvider.tsx`** (modify token resolution):
```typescript
import { NeonTokens } from './lab/neonTokens';

// In the tokens useMemo:
const tokens = useMemo(() => {
  switch (variant) {
    case 'cosmic': return CosmicTokens;
    case 'lab-neon': return NeonTokens;  // Add this case
    default: return LinearTokens;
  }
}, [variant]);
```

---

## Component Variants Pattern

### The Smart Component Switcher

**`src/ui/Button.tsx`** (production file):
```typescript
import React from 'react';
import { Button as CosmicButton } from './cosmic/Button';
import { ButtonV2 } from './lab/ButtonV2';
import { useTheme } from '../theme/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = (props) => {
  const { variant: themeVariant } = useTheme();
  
  // Route to experimental version for lab themes
  if (themeVariant.startsWith('lab-')) {
    return <ButtonV2 {...props} />;
  }
  
  // Default to production component
  return <CosmicButton {...props} />;
};
```

### Creating Component Variants

**`src/ui/lab/ButtonV2.tsx`**:
```typescript
/**
 * ButtonV2 Experiment
 * 
 * Changes from V1:
 * - Larger touch targets (56px vs 44px)
 * - Animated gradient backgrounds
 * - Haptic feedback on press
 * 
 * Date: 2024-01-15
 * Author: @yourname
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export const ButtonV2: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary' 
}) => {
  const { t } = useTheme();
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: variant === 'primary' ? t.colors.primary : t.colors.secondary }
      ]}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,  // Larger than V1
    paddingHorizontal: 24,
    borderRadius: 12,
    minHeight: 56,        // Larger touch target
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

---

## Dev Tools

### ThemeSwitcher Component

**`src/components/dev/ThemeSwitcher.tsx`**:
```typescript
/**
 * ThemeSwitcher - Development Only
 * 
 * Floating UI to toggle between themes instantly.
 * Only renders in __DEV__ mode.
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme, ThemeVariant } from '../../theme/ThemeProvider';
import { THEME_VARIANTS } from '../../theme/themeVariant';

export const ThemeSwitcher: React.FC = () => {
  // Only show in development
  if (!__DEV__) return null;
  
  const { variant, setVariant } = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎨 Theme</Text>
      {THEME_VARIANTS.map((v) => (
        <TouchableOpacity
          key={v}
          onPress={() => setVariant(v as ThemeVariant)}
          style={[
            styles.button,
       
