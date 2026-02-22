/**
 * GlowCard
 * 
 * Semantic surface container with configurable glow levels and surface tones.
 * Used for cards, panels, and interactive surfaces in the cosmic theme.
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { LinearTokens } from '../../theme/linearTokens';
import { surfaceColors, webBoxShadows } from '../../theme/cosmicTokens';
import { GlowLevel, SurfaceTone, CosmicPressableProps, CardPadding } from './types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GlowCardProps extends CosmicPressableProps {
  /** Child elements */
  children: React.ReactNode;
  /** Glow intensity level */
  glow?: GlowLevel;
  /** Surface tone variant */
  tone?: SurfaceTone;
  /** Padding preset */
  padding?: CardPadding;
  /** Whether card is in a pressed/hovered state (for controlled glow) */
  isActive?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Glow Card Component
 * 
 * A card container with configurable glow effects for the cosmic theme.
 * Can be used as a static container or as a pressable button.
 * 
 * @example
 * // Static card
 * <GlowCard glow="soft" tone="raised">
 *   <Text>Card content</Text>
 * </GlowCard>
 * 
 * @example
 * // Pressable card
 * <GlowCard 
 *   glow="medium" 
 *   onPress={handlePress}
 *   accessibilityLabel="Task card"
 * >
 *   <Text>Pressable content</Text>
 * </GlowCard>
 */
export const GlowCard = memo(function GlowCard({
  children,
  glow = 'none',
  tone = 'base',
  padding = 'md',
  isActive,
  onPress,
  disabled,
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  accessibilityState,
}: GlowCardProps) {
  const { isCosmic, t } = useTheme();

  // Get surface background color based on tone
  // Per research spec: use RGBA surface colors for depth
  const getBackgroundColor = useMemo(() => {
    if (!isCosmic) {
      return t.colors.neutral.dark;
    }

    switch (tone) {
      case 'base':
        return surfaceColors.base; // rgba(14, 20, 40, 0.78)
      case 'raised':
        return surfaceColors.raised; // rgba(18, 26, 52, 0.86)
      case 'sunken':
        return surfaceColors.sunken; // rgba(10, 14, 30, 0.82)
      default:
        return surfaceColors.base;
    }
  }, [isCosmic, t, tone]);

  // Get glow shadow styles
  // Per research spec: use multi-layer webBoxShadows
  const getGlowStyle = useMemo((): ViewStyle => {
    if (!isCosmic || glow === 'none') {
      return {};
    }

    const glowColor = '#8B5CF6'; // nebulaViolet

    switch (glow) {
      case 'soft':
        return Platform.select({
          web: {
            boxShadow: webBoxShadows.soft,
          },
          default: {
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 2,
          },
        }) as ViewStyle;

      case 'medium':
        return Platform.select({
          web: {
            boxShadow: webBoxShadows.medium,
          },
          default: {
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.22,
            shadowRadius: 16,
            elevation: 4,
          },
        }) as ViewStyle;

      case 'strong':
        return Platform.select({
          web: {
            boxShadow: webBoxShadows.strong,
          },
          default: {
            shadowColor: '#2DD4BF', // auroraTeal for strong glow per spec
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.28,
            shadowRadius: 22,
            elevation: 6,
          },
        }) as ViewStyle;

      default:
        return {};
    }
  }, [isCosmic, glow]);

  // Get padding style
  const getPaddingStyle = useMemo((): ViewStyle => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: 12 };
      case 'md':
        return { padding: 16 };
      case 'lg':
        return { padding: 24 };
      default:
        return { padding: 16 };
    }
  }, [padding]);

  // Get border style
  // Per research spec: use surfaceColors.border (rgba(185, 194, 217, 0.16))
  const getBorderStyle = useMemo((): ViewStyle => {
    if (!isCosmic) {
      // Cast is safe: !isCosmic guarantees t is LinearTokens
      const lt = t as typeof LinearTokens;
      return {
        borderWidth: 1,
        borderColor: lt.colors.neutral.borderSubtle,
      };
    }

    return {
      borderWidth: 1,
      borderColor: 'rgba(185, 194, 217, 0.12)', // Subtle default border
      ...(tone === 'raised' && {
        borderTopColor: 'rgba(255, 255, 255, 0.2)', // Concept #43: Top highlight
        borderBottomColor: 'rgba(7, 7, 18, 0.4)', // Concept #43: Bottom shadow
        borderTopWidth: 1.5,
      }),
    };
  }, [isCosmic, t, tone]);

  // Combine all styles
  // Per research spec: radii.lg = 16
  const containerStyle = useMemo((): ViewStyle => ({
    backgroundColor: getBackgroundColor,
    borderRadius: isCosmic ? 24 : 8, // Softer curves (squricle-esq) per ADHD guidelines
    ...getGlowStyle,
    ...getPaddingStyle,
    ...getBorderStyle, ...(onPress && Platform.OS === "web" ? { cursor: "pointer", transition: "all 0.2s ease-in-out" } as any : {}),
  }), [getBackgroundColor, getGlowStyle, getPaddingStyle, getBorderStyle, isCosmic, onPress]);

  // Render as Pressable if onPress provided, otherwise as View
  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        disabled={disabled}
        style={[containerStyle, style]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      testID={testID}
      style={[containerStyle, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Base styles are computed dynamically above
});

export default GlowCard;
