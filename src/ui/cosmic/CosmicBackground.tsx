/**
 * CosmicBackground
 * 
 * Screen atmosphere wrapper providing background variants:
 * - ridge: Mountainous, grounded gradient with ridge silhouettes
 * - nebula: Luminous center for time-based flows
 * - moon: Calm radial halo for focus activities
 * 
 * Based on deep-research-report (2).md specification
 */

import React, { memo, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from 'react-native';
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
  style?: StyleProp<ViewStyle>;
  /** Test ID for testing */
  testID?: string;
}

// ============================================================================
// RIDGE SILHOUETTE SVG
// ============================================================================

/**
 * Generate ridge silhouette SVG data URI
 * Per research spec: simplified silhouettes as structure
 */
function ridgeSvgDataUri(fill = 'rgba(10, 12, 24, 0.92)'): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
    <path fill="${fill}" d="M0,192L120,202.7C240,213,480,235,720,224C960,213,1200,171,1320,149.3L1440,128L1440,320L0,320Z"/>
  </svg>`;
  const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
  return `url("data:image/svg+xml,${encoded}")`;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Cosmic Background Component
 * 
 * Provides themed background atmospheres for screens.
 * On web, uses CSS gradients with multi-layer composition.
 * On native, degrades to solid colors.
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

  // Generate web background image per research spec
  const webBackgroundImage = useMemo(() => {
    if (!isCosmic) return null;

    // Per spec: colors.bg.obsidian, midnight, deepSpace
    const c = {
      obsidian: '#070712',
      midnight: '#0B1022',
      deepSpace: '#111A33',
    };

    if (variant === 'nebula') {
      // Per spec: luminous center with multiple radial gradients
      return [
        `radial-gradient(900px 600px at 55% 30%, rgba(139,92,246,0.18) 0%, transparent 60%)`,
        `radial-gradient(700px 500px at 20% 70%, rgba(36,59,255,0.12) 0%, transparent 55%)`,
        `linear-gradient(180deg, ${c.obsidian} 0%, ${c.midnight} 52%, #1A0F38 100%)`,
      ].join(',');
    }

    if (variant === 'moon') {
      // Per spec: calm radial halo with gold accent
      return [
        `radial-gradient(520px 520px at 70% 18%, rgba(246,193,119,0.10) 0%, transparent 62%)`,
        `linear-gradient(180deg, ${c.obsidian} 0%, ${c.midnight} 60%, ${c.deepSpace} 100%)`,
      ].join(',');
    }

    // Ridge: grounded with silhouettes
    return [
      `radial-gradient(700px 520px at 50% 18%, rgba(139,92,246,0.10) 0%, transparent 58%)`,
      `linear-gradient(180deg, ${c.obsidian} 0%, ${c.midnight} 55%, ${c.deepSpace} 100%)`,
      ridgeSvgDataUri(),
    ].join(',');
  }, [isCosmic, variant]);

  // Get native background color
  const backgroundStyle = useMemo((): ViewStyle => {
    if (!isCosmic) {
      return { backgroundColor: t.colors.neutral.darkest };
    }
    // Per spec: use midnight as base on native
    return { backgroundColor: '#0B1022' };
  }, [isCosmic, t.colors.neutral.darkest]);

  // Web-specific styles with multi-layer backgrounds
  const webStyle: ViewStyle | null = useMemo(() => {
    return Platform.OS === 'web' && isCosmic && webBackgroundImage
      ? {
        backgroundImage: webBackgroundImage,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: variant === 'ridge'
          ? 'center center, center center, center bottom'
          : 'center',
        backgroundSize: variant === 'ridge'
          ? 'cover, cover, 100% 34%'
          : 'cover',
      } as any
      : null;
  }, [isCosmic, webBackgroundImage, variant]);

  return (
    <View
      testID={testID}
      style={[
        styles.root,
        backgroundStyle,
        webStyle,
        style,
      ]}
    >
      {children}

      {/* Dimmer overlay per spec: 35% opacity */}
      {dimmer && (
        <View
          style={[
            styles.dimmer,
            Platform.select({
              web: { background: 'rgba(7, 7, 18, 0.35)' },
              default: { backgroundColor: 'rgba(7, 7, 18, 0.35)' },
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
  root: {
    flex: 1,
    position: 'relative',
  },
  dimmer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

export default CosmicBackground;
