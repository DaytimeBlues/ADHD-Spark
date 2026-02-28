/**
 * P5Button - Persona 5 Style Button Component
 * 
 * Angular, declarative button with diagonal trailing edge.
 * Three variants: primary (red), secondary (outline), ghost (transparent).
 * 
 * @example
 * <P5Button variant="primary" size="lg" onPress={handlePress}>
 *   START MISSION
 * </P5Button>
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {
  P5Colors,
  P5Spacing,
  P5Typography,
  P5FontSizes,
  P5Motion,
  P5Geometry,
} from '../../theme/p5Tokens';

export interface P5ButtonProps {
  /** Button content */
  children: React.ReactNode;
  
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Loading state with spinner */
  loading?: boolean;
  
  /** Press handler */
  onPress?: () => void;
  
  /** Long press handler */
  onLongPress?: () => void;
  
  /** Optional icon component */
  icon?: React.ReactNode;
  
  /** Icon position relative to text */
  iconPosition?: 'leading' | 'trailing';
  
  /** Custom clip angle (default: 22.5°) */
  clipAngle?: number;
  
  /** Test ID for testing */
  testID?: string;
  
  /** Accessibility label */
  accessibilityLabel?: string;
  
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
}

// Animated pressable
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const P5Button = memo(function P5Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  onLongPress,
  icon,
  iconPosition = 'trailing',
  clipAngle = P5Geometry.clipAngle,
  testID,
  accessibilityLabel,
  style,
}: P5ButtonProps) {
  // Animation values
  const scale = useSharedValue(1);
  const borderWidth = useSharedValue<number>(P5Geometry.borderWidth);
  
  // Calculate dimensions
  const dimensions = useMemo(() => {
    const heights = { sm: 40, md: 48, lg: 56 };
    const paddingH = { sm: 12, md: 16, lg: 24 };
    const paddingV = { sm: 8, md: 12, lg: 16 };
    const fontSizes = { sm: 14, md: 16, lg: 18 };
    
    return {
      height: heights[size],
      paddingHorizontal: paddingH[size],
      paddingVertical: paddingV[size],
      fontSize: fontSizes[size],
    };
  }, [size]);
  
  // Calculate clip depth for polygon
  const clipDepth = useMemo(() => {
    const angleRad = clipAngle * (Math.PI / 180);
    return dimensions.height * Math.tan(angleRad);
  }, [clipAngle, dimensions.height]);
  
  // Generate polygon points for SVG
  const polygonPoints = useMemo(() => {
    const width = dimensions.paddingHorizontal * 2 + 100; // Approximate width
    return `0,0 ${width},0 ${width - clipDepth},${dimensions.height} 0,${dimensions.height}`;
  }, [clipDepth, dimensions]);
  
  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
  }));
  
  // Handlers
  const handlePressIn = useCallback(() => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, {
        stiffness: P5Motion.easing.spring.stiffness,
        damping: P5Motion.easing.spring.damping,
      });
      borderWidth.value = withTiming(P5Geometry.borderWidthFocus as number, {
        duration: P5Motion.duration.fast,
      });
    }
  }, [disabled, loading, scale, borderWidth]);
  
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      stiffness: P5Motion.easing.spring.stiffness,
      damping: P5Motion.easing.spring.damping * 0.8,
    });
    borderWidth.value = withTiming(P5Geometry.borderWidth, {
      duration: P5Motion.duration.fast,
    });
  }, [scale, borderWidth]);
  
  const handlePress = useCallback(() => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  }, [disabled, loading, onPress]);
  
  // Base container style
  const containerStyle = useMemo((): ViewStyle => {
    const base: ViewStyle = {
      height: dimensions.height,
      paddingHorizontal: dimensions.paddingHorizontal,
      paddingVertical: dimensions.paddingVertical,
      borderRadius: 0, // P5 has no rounded corners
      transform: [{ skewX: '-5deg' }], // Subtle skew for kinetic feel
    };
    
    switch (variant) {
      case 'primary':
        return {
          ...base,
          backgroundColor: disabled ? P5Colors.textMuted : P5Colors.primary,
          borderColor: P5Colors.stroke,
          borderWidth: P5Geometry.borderWidth,
          // Hard shadow for comic book effect
          shadowColor: disabled ? 'transparent' : P5Colors.primary,
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: disabled ? 0 : 0.8,
          shadowRadius: 0,
          elevation: disabled ? 0 : 4,
        };
      case 'secondary':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderColor: disabled ? P5Colors.textMuted : P5Colors.primary,
          borderWidth: P5Geometry.borderWidth,
        };
      case 'ghost':
      default:
        return {
          ...base,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
        };
    }
  }, [variant, disabled, dimensions]);
  
  // Text style
  const textStyle = useMemo((): TextStyle => {
    const baseColor = variant === 'primary' 
      ? P5Colors.text 
      : variant === 'secondary' 
        ? P5Colors.primary 
        : P5Colors.text;
    
    return {
      fontSize: dimensions.fontSize,
      fontWeight: '900',
      color: disabled ? P5Colors.textMuted : baseColor,
      fontFamily: P5Typography.display.fontFamily,
      letterSpacing: 1,
      textTransform: 'uppercase',
      textAlign: 'center',
    };
  }, [variant, disabled, dimensions.fontSize]);
  
  return (
    <AnimatedPressable
      testID={testID}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.container,
        containerStyle,
        animatedContainerStyle,
        animatedBorderStyle,
        Platform.OS === 'web' && {
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
        } as ViewStyle,
        style,
      ]}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      <View style={styles.content}>
        {icon && iconPosition === 'leading' && (
          <View style={styles.iconLeading}>{icon}</View>
        )}
        {loading ? (
          <Text style={textStyle}>...</Text>
        ) : (
          <Text style={textStyle}>{children}</Text>
        )}
        {icon && iconPosition === 'trailing' && (
          <View style={styles.iconTrailing}>{icon}</View>
        )}
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeading: {
    marginRight: P5Spacing.sm,
  },
  iconTrailing: {
    marginLeft: P5Spacing.sm,
  },
});

export default P5Button;
