/**
 * GlowCard
 *
 * Semantic surface container with configurable glow levels and surface tones.
 * Used for cards, panels, and interactive surfaces in the cosmic theme.
 */

import React, { memo, useMemo, useRef, useState, useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { surfaceColors, webBoxShadows } from '../../theme/cosmicTokens';
import {
  GlowLevel,
  SurfaceTone,
  CosmicPressableProps,
  CardPadding,
} from './types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GlowCardProps extends CosmicPressableProps {
  /** Child elements */
  children: React.ReactNode;
  renderContent?: (props: { isActive: boolean }) => React.ReactNode;
  /** Glow intensity level */
  glow?: GlowLevel;
  /** Surface tone variant */
  tone?: SurfaceTone;
  /** Padding preset */
  padding?: CardPadding;
  /** Whether card is in a pressed/hovered state (for controlled glow) */
  isActive?: boolean;
}

type WebInteractiveStyle = ViewStyle & {
  cursor?: 'pointer';
  transition?: string;
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Glow Card Component
 *
 * A card container with configurable glow effects for the cosmic theme.
 */
export const GlowCard = memo(function GlowCard({
  children,
  glow = 'none',
  tone = 'base',
  padding = 'md',
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

  // Handle press animation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Track press state for internal logic
  const [isPressedInternal, setIsPressedInternal] = useState(false);

  // Get surface background color based on tone
  const backgroundColor = useMemo(() => {
    if (!isCosmic) {
      return t.colors.neutral.dark;
    }

    switch (tone) {
      case 'base':
        return surfaceColors.base;
      case 'raised':
        return surfaceColors.raised;
      case 'sunken':
        return surfaceColors.sunken;
      default:
        return surfaceColors.base;
    }
  }, [isCosmic, t, tone]);

  // Interaction handlers
  const handlePressIn = useCallback(() => {
    if (disabled || !onPress) {
      return;
    }
    setIsPressedInternal(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, onPress, scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    if (disabled || !onPress) {
      return;
    }
    setIsPressedInternal(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, onPress, scaleAnim, opacityAnim]);

  // Derived styles based on tone and padding
  const resolvedPadding = useMemo(() => {
    if (typeof padding === 'number') {
      return padding;
    }

    const paddingScale: Record<CardPadding, number> = {
      none: 0,
      sm: t.spacing[3] ?? 12,
      md: t.spacing[4] ?? 16,
      lg: t.spacing[6] ?? 24,
    };

    return paddingScale[padding];
  }, [padding, t.spacing]);

  const containerStyle = useMemo(
    (): ViewStyle => ({
      backgroundColor,
      borderRadius: isCosmic ? 24 : 8,
      padding: resolvedPadding,
      borderWidth: 1,
      borderColor: isCosmic ? 'rgba(185, 194, 217, 0.12)' : 'transparent',
      ...(onPress && Platform.OS === 'web'
        ? ({
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
        } as WebInteractiveStyle)
        : {}),
    }),
    [backgroundColor, resolvedPadding, isCosmic, onPress],
  );

  // Glow shadow styles for cosmic theme
  const glowStyle = useMemo((): ViewStyle => {
    if (!isCosmic || glow === 'none') {
      return {};
    }

    const glowColor = '#8B5CF6';

    switch (glow) {
      case 'soft':
        return Platform.select({
          web: { boxShadow: webBoxShadows.soft },
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
          web: { boxShadow: webBoxShadows.medium },
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
          web: { boxShadow: webBoxShadows.strong },
          default: {
            shadowColor: '#2DD4BF',
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

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <AnimatedPressable
      testID={testID}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        containerStyle,
        glowStyle,
        style as ViewStyle,
        isPressedInternal && !isCosmic && { opacity: 0.8 },
        { transform: [{ scale: scaleAnim }] },
      ]}
      accessibilityState={{
        ...accessibilityState,
        disabled,
        busy: !!accessibilityState?.busy,
        checked: !!accessibilityState?.checked,
        expanded: !!accessibilityState?.expanded,
        selected: !!accessibilityState?.selected,
      }}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole || (onPress ? 'button' : undefined)}
      accessibilityHint={accessibilityHint}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          isCosmic ? styles.bgCosmic : styles.bgLinear,
          {
            opacity: opacityAnim,
          },
        ]}
      />

      {children}
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  bgCosmic: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  bgLinear: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default GlowCard;
