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
  const getBackgroundColor = useMemo(() => {
    if (!isCosmic) {
      return t.colors.neutral.dark;
    }

    switch (tone) {
      case 'base':
        return '#111A33'; // deepSpace
      case 'raised':
        return '#111A33'; // deepSpace with subtle highlight
      case 'sunken':
        return '#0B1022'; // midnight
      default:
        return '#111A33';
    }
  }, [isCosmic, t, tone]);

  // Get glow shadow styles
  const getGlowStyle = useMemo((): ViewStyle => {
    if (!isCosmic || glow === 'none') {
      return {};
    }

    const glowColor = '#8B5CF6'; // nebulaViolet

    switch (glow) {
      case 'soft':
        return Platform.select({
          web: {
            boxShadow: `0 0 16px ${glowColor}40`,
          },
          default: {
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          },
        }) as ViewStyle;

      case 'medium':
        return Platform.select({
          web: {
            boxShadow: `0 0 24px ${glowColor}80, 0 0 48px ${glowColor}40`,
          },
          default: {
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
            elevation: 8,
          },
        }) as ViewStyle;

      case 'strong':
        return Platform.select({
          web: {
            boxShadow: `0 0 32px ${glowColor}, 0 0 64px ${glowColor}80`,
          },
          default: {
            shadowColor: glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 32,
            elevation: 16,
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
  const getBorderStyle = useMemo((): ViewStyle => {
    if (!isCosmic) {
      return {
        borderWidth: 1,
        borderColor: t.colors.neutral.medium,
      };
    }

    return {
      borderWidth: 1,
      borderColor: 'rgba(42, 53, 82, 0.3)', // slate at 30% opacity
      ...(tone === 'raised' && Platform.OS === 'web' && {
        borderTopColor: 'rgba(255, 255, 255, 0.05)', // Subtle inner highlight
      }),
    };
  }, [isCosmic, t, tone]);

  // Combine all styles
  const containerStyle = useMemo((): ViewStyle => ({
    backgroundColor: getBackgroundColor,
    borderRadius: 12, // lg
    ...getGlowStyle,
    ...getPaddingStyle,
    ...getBorderStyle,
  }), [getBackgroundColor, getGlowStyle, getPaddingStyle, getBorderStyle]);

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
