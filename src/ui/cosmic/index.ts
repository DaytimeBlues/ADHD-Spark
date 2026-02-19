/**
 * Cosmic UI Components
 * 
 * Cosmic-themed UI primitives for the Spark ADHD redesign.
 * Import from this barrel file for all cosmic components.
 */

// Components
export { CosmicBackground } from './CosmicBackground';
export { GlowCard } from './GlowCard';
export { RuneButton } from './RuneButton';
export { ChronoDigits } from './ChronoDigits';
export { HaloRing } from './HaloRing';

// Types
export type {
  // Glow system
  GlowLevel,
  SurfaceTone,
  // Background
  BackgroundVariant,
  // Button
  ButtonVariant,
  ButtonSize,
  // Timer
  HaloMode,
  TimerColor,
  TimerSize,
  // Card
  CardPadding,
  // Base props
  CosmicComponentProps,
  CosmicPressableProps,
} from './types';

// Component prop types
export type { CosmicBackgroundProps } from './CosmicBackground';
export type { GlowCardProps } from './GlowCard';
export type { RuneButtonProps } from './RuneButton';
export type { ChronoDigitsProps } from './ChronoDigits';
export type { HaloRingProps } from './HaloRing';
