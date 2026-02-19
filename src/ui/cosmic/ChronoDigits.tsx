/**
 * ChronoDigits
 * 
 * Timer numerals with tabular-nums and optional glow effects.
 * Prevents layout shift during countdown with fixed-width digits.
 */

import React, { memo, useMemo } from 'react';
import { Text, StyleSheet, TextStyle, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { cosmicTypography, textGlowStyles } from '../../theme/cosmicTokens';
import { TimerSize, TimerColor, GlowLevel } from './types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ChronoDigitsProps {
  /** Time value as formatted string (e.g., "25:00", "05:30.5") */
  value: string;
  /** Size variant */
  size?: TimerSize;
  /** Glow effect level */
  glow?: GlowLevel;
  /** Color variant */
  color?: TimerColor;
  /** Test ID for testing */
  testID?: string;
  /** Custom styles */
  style?: TextStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Chrono Digits Component
 * 
 * Displays timer values with:
 * - Tabular numbers (fixed width, prevents layout shift)
 * - Configurable glow effects
 * - Size variants for different contexts
 * - Color variants for different states
 * 
 * @example
 * // Hero timer display
 * <ChronoDigits 
 *   value={formattedTime} 
 *   size="hero" 
 *   glow="strong"
 *   color="default"
 * />
 * 
 * @example
 * // Small inline timer
 * <ChronoDigits 
 *   value={elapsedTime} 
 *   size="sm" 
 *   color="success"
 * />
 */
export const ChronoDigits = memo(function ChronoDigits({
  value,
  size = 'lg',
  glow = 'none',
  color = 'default',
  testID,
  style,
}: ChronoDigitsProps) {
  const { isCosmic, t } = useTheme();

  // Get font size based on size variant
  const getFontSize = useMemo(() => {
    switch (size) {
      case 'sm': return 24;
      case 'md': return 36;
      case 'lg': return 48;
      case 'hero': return 72;
      default: return 48;
    }
  }, [size]);

  // Get font weight based on size
  const getFontWeight = useMemo((): TextStyle['fontWeight'] => {
    switch (size) {
      case 'sm': return '400';
      case 'md': return '400';
      case 'lg': return '600';
      case 'hero': return '700';
      default: return '600';
    }
  }, [size]);

  // Get text color based on variant
  const getColor = useMemo(() => {
    if (!isCosmic) {
      // Linear theme colors
      switch (color) {
        case 'success': return t.colors.utility?.success || '#2DD4BF';
        case 'warning': return t.colors.utility?.warning || '#F6C177';
        case 'neutral': return t.colors.neutral.light;
        case 'default':
        default: return t.colors.neutral.lightest;
      }
    }

    // Cosmic theme colors
    switch (color) {
      case 'success': return '#2DD4BF'; // auroraTeal
      case 'warning': return '#F6C177'; // starlightGold
      case 'neutral': return '#B9C2D9'; // mist
      case 'default':
      default: return '#EEF2FF'; // starlight
    }
  }, [isCosmic, t, color]);

  // Get glow text shadow style
  // Per research spec: use textGlowStyles from tokens
  const getGlowStyle = useMemo((): TextStyle => {
    if (!isCosmic || glow === 'none') {
      return {};
    }

    // Use textGlowStyles from cosmicTokens for consistency
    const baseGlow = textGlowStyles[glow] || {};
    
    // Adjust color based on variant
    if (color === 'success') {
      return Platform.select({
        web: {
          textShadow: '0 0 18px rgba(45, 212, 191, 0.40)',
        },
        default: {},
      }) || {};
    }
    
    if (color === 'warning') {
      return Platform.select({
        web: {
          textShadow: '0 0 18px rgba(246, 193, 119, 0.40)',
        },
        default: {},
      }) || {};
    }
    
    return baseGlow;
  }, [isCosmic, glow, color]);

  // Combine all styles
  // Per research spec: Space Grotesk for timer in cosmic theme
  const textStyle = useMemo((): TextStyle => ({
    fontSize: getFontSize,
    fontWeight: isCosmic ? '400' : getFontWeight,
    color: getColor,
    fontFamily: isCosmic 
      ? cosmicTypography.timer.fontFamily
      : Platform.select({
          web: 'JetBrains Mono, Fira Code, SF Mono, Consolas, monospace',
          ios: 'Menlo',
          android: 'monospace',
          default: 'monospace',
        }),
    // Tabular nums prevents layout shift during countdown
    fontVariant: ['tabular-nums'],
    letterSpacing: isCosmic ? cosmicTypography.timer.letterSpacing : (size === 'hero' ? -0.02 : 0),
    ...getGlowStyle,
  }), [getFontSize, getFontWeight, getColor, getGlowStyle, size, isCosmic]);

  return (
    <Text
      testID={testID}
      style={[textStyle, style]}
      accessibilityLabel={`Timer: ${value}`}
      accessibilityRole="timer"
    >
      {value}
    </Text>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Styles are computed dynamically in the component
});

export default ChronoDigits;
