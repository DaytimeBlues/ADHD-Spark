/**
 * CosmicBackground
 * 
 * Screen atmosphere wrapper providing background variants:
 * - ridge: Mountainous, grounded gradient
 * - nebula: Luminous center for time-based flows
 * - moon: Calm radial halo for focus activities
 */

import React, { memo } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { BackgroundVariant } from './types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CosmicBackgroundProps {
  /** Child elements */
  children: React.ReactNode;
  /** Background atmosphere variant */
  variant: BackgroundVariant;
  /** Apply dimmer overlay for focus screens */
  dimmer?: boolean;
  /** Custom styles applied to container */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Cosmic Background Component
 * 
 * Provides themed background atmospheres for screens.
 * On web, uses CSS gradients. On native, degrades to solid colors.
 * 
 * @example
 * // Home screen
 * <CosmicBackground variant="ridge">
 *   <HomeScreenContent />
 * </CosmicBackground>
 * 
 * @example
 * // Ignite screen with dimmer
 * <CosmicBackground variant="nebula" dimmer>
 *   <IgniteScreenContent />
 * </CosmicBackground>
 */
export const CosmicBackground = memo(function CosmicBackground({
  children,
  variant,
  dimmer = false,
  style,
  testID,
}: CosmicBackgroundProps) {
  const { isCosmic, t } = useTheme();

  // Get background style based on variant and platform
  const getBackgroundStyle = (): ViewStyle => {
    if (!isCosmic) {
      // Use linear theme background
      return { backgroundColor: t.colors.neutral.darkest };
    }

    // Cosmic theme backgrounds
    switch (variant) {
      case 'ridge':
        return Platform.select({
          web: {
            background: 'linear-gradient(180deg, #070712 0%, #0B1022 40%, #111A33 100%)',
          },
          default: {
            backgroundColor: '#070712',
          },
        }) as ViewStyle;

      case 'nebula':
        return Platform.select({
          web: {
            background: 'radial-gradient(ellipse at center top, #111A33 0%, #0B1022 50%, #070712 100%)',
          },
          default: {
            backgroundColor: '#070712',
          },
        }) as ViewStyle;

      case 'moon':
        return Platform.select({
          web: {
            background: 'radial-gradient(ellipse at center 30%, #0B1022 0%, #070712 70%)',
          },
          default: {
            backgroundColor: '#070712',
          },
        }) as ViewStyle;

      default:
        return { backgroundColor: '#070712' };
    }
  };

  const backgroundStyle = getBackgroundStyle();

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        backgroundStyle,
        style,
      ]}
    >
      {children}
      
      {/* Dimmer overlay */}
      {dimmer && (
        <View
          style={[
            styles.dimmer,
            Platform.select({
              web: { background: 'rgba(7, 7, 18, 0.5)' },
              default: { backgroundColor: 'rgba(7, 7, 18, 0.5)' },
            }),
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  dimmer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

export default CosmicBackground;
