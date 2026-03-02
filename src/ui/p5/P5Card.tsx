/**
 * P5Card - Persona 5 Style Card Component
 * 
 * Angular containers with optional accent border.
 * Sharp corners, bold strokes, theatrical presence.
 * 
 * @example
 * <P5Card accentPosition="left" intensity="bold">
 *   <Text style={theme.textStyle('heading1')}>Today's Mission</Text>
 * </P5Card>
 */

import React, { memo, useMemo, ReactNode, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  P5Colors,
  P5Spacing,
  P5Typography,
  P5Motion,
  P5Geometry,
} from '../../theme/p5Tokens';

export interface P5CardProps {
  /** Card content */
  children: ReactNode;
  
  /** Accent border position */
  accentPosition?: 'left' | 'right' | 'bottom' | 'none';
  
  /** Visual intensity */
  intensity?: 'subtle' | 'bold' | 'alert';
  
  /** Optional press handler */
  onPress?: () => void;
  
  /** Expanded state for accordion behavior */
  expanded?: boolean;
  
  /** Animation duration */
  animationDuration?: number;
  
  /** Test ID */
  testID?: string;
  
  /** Accessibility label */
  accessibilityLabel?: string;
  
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const P5Card = memo(function P5Card({
  children,
  accentPosition = 'none',
  intensity = 'subtle',
  onPress,
  expanded = false,
  animationDuration = P5Motion.duration.normal,
  testID,
  accessibilityLabel,
  style,
}: P5CardProps) {
  // Animation values
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);
  
  // Determine colors based on intensity
  const colors = useMemo(() => {
    switch (intensity) {
      case 'alert':
        return {
          background: P5Colors.surface,
          accent: P5Colors.primary,
          border: P5Colors.primary,
        };
      case 'bold':
        return {
          background: P5Colors.surfaceElevated,
          accent: P5Colors.primary,
          border: P5Colors.stroke,
        };
      case 'subtle':
      default:
        return {
          background: P5Colors.surface,
          accent: P5Colors.textMuted,
          border: 'rgba(255, 255, 255, 0.15)',
        };
    }
  }, [intensity]);
  
  // Accent width
  const accentWidth = useMemo(() => {
    return intensity === 'bold' ? 4 : intensity === 'alert' ? 4 : 2;
  }, [intensity]);
  
  // Container style
  const containerStyle = useMemo((): ViewStyle => ({
    backgroundColor: colors.background,
    borderRadius: 0, // P5 has no rounded corners
    overflow: 'hidden',
  }), [colors.background]);
  
  // Border style
  const borderStyle = useMemo((): ViewStyle => ({
    borderWidth: P5Geometry.borderWidth,
    borderColor: colors.border,
  }), [colors.border]);
  
  // Accent positioning styles
  const getAccentStyle = useMemo((): ViewStyle => {
    const base = {
      position: 'absolute' as const,
      backgroundColor: colors.accent,
    };
    
    switch (accentPosition) {
      case 'left':
        return { ...base, left: 0, top: 0, bottom: 0, width: accentWidth };
      case 'right':
        return { ...base, right: 0, top: 0, bottom: 0, width: accentWidth };
      case 'bottom':
        return { ...base, bottom: 0, left: 0, right: 0, height: accentWidth };
      case 'none':
      default:
        return {};
    }
  }, [accentPosition, colors.accent, accentWidth]);
  
  // Animated styles for press interaction
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  // Press handlers
  const handlePressIn = useCallback(() => {
    if (onPress) {
      scale.value = withSpring(0.98, {
        stiffness: P5Motion.easing.spring.stiffness,
        damping: P5Motion.easing.spring.damping,
      });
    }
  }, [onPress, scale]);
  
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      stiffness: P5Motion.easing.spring.stiffness,
      damping: P5Motion.easing.spring.damping,
    });
  }, [scale]);
  
  // If pressable
  if (onPress) {
    return (
      <AnimatedPressable
        testID={testID}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          containerStyle,
          borderStyle,
          animatedStyle,
          Platform.OS === 'web' && {
            cursor: 'pointer',
          } as ViewStyle,
          style,
        ]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        {accentPosition !== 'none' && <View style={getAccentStyle} />}
        <View style={styles.content}>{children}</View>
      </AnimatedPressable>
    );
  }
  
  // Static container
  return (
    <View
      testID={testID}
      style={[
        styles.container,
        containerStyle,
        borderStyle,
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
    >
      {accentPosition !== 'none' && <View style={getAccentStyle} />}
      <View style={styles.content}>{children}</View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  content: {
    padding: P5Spacing.lg,
  },
});

export default P5Card;
