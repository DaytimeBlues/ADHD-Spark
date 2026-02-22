/**
 * RuneButton
 * 
 * Themed button component with focus ring, glow effects, and haptic feedback.
 * The primary action component for the cosmic theme.
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { ButtonVariant, ButtonSize, GlowLevel } from './types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface RuneButtonProps {
  /** Button content (text or elements) */
  children: React.ReactNode;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size variant */
  size?: ButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state (shows spinner) */
  loading?: boolean;
  /** Override automatic glow level */
  glow?: GlowLevel;
  /** Press handler */
  onPress?: () => void;
  /** Long press handler */
  onLongPress?: () => void;
  /** Test ID */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Left icon element */
  leftIcon?: React.ReactNode;
  /** Right icon element */
  rightIcon?: React.ReactNode;
  /** Additional container style override */
  style?: StyleProp<ViewStyle>;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Rune Button Component
 * 
 * Primary button component for the cosmic theme with:
 * - Configurable variants (primary, secondary, ghost, danger)
 * - Glow effects
 * - Web focus ring support
 * - Haptic feedback
 * 
 * @example
 * <RuneButton 
 *   variant="primary" 
 *   size="lg"
 *   glow="medium"
 *   onPress={handleStart}
 * >
 *   Start Session
 * </RuneButton>
 */
export const RuneButton = memo(function RuneButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  glow,
  onPress,
  onLongPress,
  testID,
  accessibilityLabel,
  accessibilityHint,
  leftIcon,
  rightIcon,
  style,
}: RuneButtonProps) {
  const { isCosmic, t } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);

  // Handle press with haptic feedback
  const handlePress = useCallback(() => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  // Focus handling (web only)
  const handleFocus = useCallback((e: any) => {
    setIsFocused(true);
    // Check if focus came from keyboard (detail === 0)
    if (Platform.OS === 'web' && e?.nativeEvent?.detail === 0) {
      setIsKeyboardFocused(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsKeyboardFocused(false);
  }, []);

  // Get height based on size
  const getHeight = useMemo(() => {
    switch (size) {
      case 'sm': return 36;
      case 'md': return 44;
      case 'lg': return 56;
      default: return 44;
    }
  }, [size]);

  // Get padding based on size
  const getPadding = useMemo(() => {
    switch (size) {
      case 'sm': return { paddingHorizontal: 12 };
      case 'md': return { paddingHorizontal: 16 };
      case 'lg': return { paddingHorizontal: 24 };
      default: return { paddingHorizontal: 16 };
    }
  }, [size]);

  // Get variant styles
  const getVariantStyles = useMemo((): { container: ViewStyle; text: TextStyle } => {
    if (!isCosmic) {
      // Linear theme fallback
      return {
        container: {
          backgroundColor: variant === 'primary' ? t.colors.brand[500] : 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: t.colors.brand[500],
        },
        text: {
          color: variant === 'primary' ? '#FFFFFF' : t.colors.brand[500],
        },
      };
    }

    // Cosmic theme styles
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: '#8B5CF6', // nebulaViolet
            borderWidth: 0,
          },
          text: {
            color: '#EEF2FF', // starlight
            fontWeight: '600',
          },
        };

      case 'secondary':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: '#8B5CF6', // nebulaViolet
          },
          text: {
            color: '#8B5CF6', // nebulaViolet
            fontWeight: '500',
          },
        };

      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: '#B9C2D9', // mist
            fontWeight: '400',
          },
        };

      case 'danger':
        return {
          container: {
            backgroundColor: 'rgba(251, 113, 133, 0.1)', // cometRose at 10%
            borderWidth: 1,
            borderColor: '#FB7185', // cometRose
          },
          text: {
            color: '#FB7185', // cometRose
            fontWeight: '500',
          },
        };

      default:
        return { container: {}, text: {} };
    }
  }, [isCosmic, t, variant]);

  // Get glow style
  const getGlowStyle = useMemo((): ViewStyle => {
    if (!isCosmic) return {};

    const glowLevel = glow || (variant === 'primary' ? 'medium' : 'none');
    if (glowLevel === 'none') return {};

    const glowColor = variant === 'danger' ? '#FB7185' : '#8B5CF6';

    switch (glowLevel) {
      case 'soft':
        return Platform.select({
          web: { boxShadow: `0 0 16px ${glowColor}40` },
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
          web: { boxShadow: `0 0 24px ${glowColor}80, 0 0 48px ${glowColor}40` },
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
          web: { boxShadow: `0 0 32px ${glowColor}, 0 0 64px ${glowColor}80` },
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
  }, [isCosmic, glow, variant]);

  // Get focus ring style (web only)
  const getFocusStyle = useMemo((): ViewStyle => {
    if (Platform.OS !== 'web' || !isKeyboardFocused) {
      return {};
    }

    return {
      outline: 'none',
      boxShadow: `0 0 0 2px #2DD4BF, 0 0 0 4px #070712`, // auroraTeal focus ring
    } as ViewStyle;
  }, [isKeyboardFocused]);

  // Get disabled style
  const getDisabledStyle = useMemo((): ViewStyle => {
    if (!disabled && !loading) return {};

    return {
      opacity: 0.4,
    };
  }, [disabled, loading]);

  // Get pressed scale style
  const getPressedStyle = useMemo((): ViewStyle => {
    if (!isPressed) return {};

    return {
      transform: [{ scale: 0.98 }],
    };
  }, [isPressed]);

  // Container style
  const containerStyle = useMemo((): StyleProp<ViewStyle> => [
    {
      height: getHeight,
      borderRadius: 8, // md
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      ...getPadding,
      ...getVariantStyles.container,
      ...getGlowStyle,
      ...getFocusStyle,
      ...getDisabledStyle,
      ...getPressedStyle,
    },
    style,
  ], [getHeight, getPadding, getVariantStyles, getGlowStyle, getFocusStyle, getDisabledStyle, getPressedStyle, style]);

  // Text style
  const textStyle = useMemo((): TextStyle => ({
    fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
    ...getVariantStyles.text,
  }), [size, getVariantStyles.text]);

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled || loading}
      style={containerStyle}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      {loading ? (
        <View style={styles.spinner} />
      ) : (
        <>
          {leftIcon}
          {typeof children === 'string' ? (
            <Text style={textStyle}>{children}</Text>
          ) : (
            children
          )}
          {rightIcon}
        </>
      )}
    </Pressable>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#FFFFFF',
  },
});

export default RuneButton;
