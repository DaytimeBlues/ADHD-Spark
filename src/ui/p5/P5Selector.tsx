/**
 * P5Selector - Persona 5 Style Polygon Selector
 * 
 * The distinctive multi-pointed polygon shape used for primary selections.
 * Generates dynamic irregular polygon based on parameters.
 * 
 * @example
 * <P5Selector size={200} selected>
 *   <Text style={styles.title}>Today's Mission</Text>
 * </P5Selector>
 */

import React, { memo, useMemo, useCallback, useEffect, ReactNode } from 'react';
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
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import {
  P5Colors,
  P5Spacing,
  P5Typography,
  P5FontSizes,
  P5Motion,
  P5Geometry,
  P5SelectorTokens,
} from '../../theme/p5Tokens';

export interface P5SelectorProps {
  /** Selector content */
  children: ReactNode;
  
  /** Size of the selector (width and height) */
  size?: number;
  
  /** Number of points in the polygon */
  pointCount?: number;
  
  /** Irregularity factor (0-1) */
  irregularity?: number;
  
  /** Selected state */
  selected?: boolean;
  
  /** Press handler */
  onPress?: () => void;
  
  /** Pulse animation for attention */
  pulse?: boolean;
  
  /** Test ID */
  testID?: string;
  
  /** Accessibility label */
  accessibilityLabel?: string;
  
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Generate points for an irregular polygon
 */
function generatePolygonPoints(
  width: number,
  height: number,
  pointCount: number,
  irregularity: number
): Point[] {
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = width / 2 - 8; // 8dp padding
  const radiusY = height / 2 - 8;
  
  return Array.from({ length: pointCount }, (_, i) => {
    const angle = (i / pointCount) * Math.PI * 2;
    const deviation = (Math.random() - 0.5) * irregularity * 0.3;
    const rX = radiusX * (1 + deviation);
    const rY = radiusY * (1 + deviation);
    
    return {
      x: centerX + Math.cos(angle) * rX,
      y: centerY + Math.sin(angle) * rY,
    };
  });
}

/**
 * Convert points to SVG path string
 */
function pointsToPath(points: Point[]): string {
  if (points.length === 0) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  path += ' Z';
  
  return path;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const P5Selector = memo(function P5Selector({
  children,
  size = P5SelectorTokens.defaultSize,
  pointCount = P5SelectorTokens.pointCount,
  irregularity = P5SelectorTokens.irregularity,
  selected = false,
  onPress,
  pulse = false,
  testID,
  accessibilityLabel,
  style,
}: P5SelectorProps) {
  // Generate polygon points
  const polygonPath = useMemo(() => {
    const points = generatePolygonPoints(size, size, pointCount, irregularity);
    return pointsToPath(points);
  }, [size, pointCount, irregularity]);
  
  // Animation values
  const scale = useSharedValue(1);
  const borderWidth = useSharedValue(selected ? 3 : 2);
  const glowOpacity = useSharedValue(0);
  
  // Animated container style
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderWidth: borderWidth.value,
  }));
  
  // Animated glow style
  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));
  
  // Handle press
  const handlePressIn = useCallback(() => {
    if (onPress) {
      scale.value = withSpring(0.95, {
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
  
  // Pulse animation when selected
  React.useEffect(() => {
    if (selected || pulse) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1000 }),
          withTiming(0.1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [selected, pulse, glowOpacity]);
  
  // Border color based on selection
  const borderColor = selected ? P5Colors.primary : P5Colors.stroke;
  
  // Container styles
  const containerStyle = useMemo((): ViewStyle => ({
    width: size,
    height: size,
    backgroundColor: P5Colors.surface,
    borderColor: borderColor,
    borderWidth: selected ? 3 : 2,
  }), [size, borderColor, selected]);
  
  // Content wrapper style
  const contentStyle = useMemo((): ViewStyle => ({
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
    padding: P5Spacing.lg,
  }), [size]);
  
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
          animatedContainerStyle,
          Platform.OS === 'web'
            ? ({ clipPath: `path('${polygonPath}')` } as ViewStyle)
            : {},
          Platform.OS === 'web' && {
            cursor: 'pointer',
          } as ViewStyle,
          style,
        ]}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        {/* Glow effect */}
        <Animated.View style={[styles.glow, { width: size, height: size }, animatedGlowStyle]} />
        
        <View style={contentStyle}>
          {children}
        </View>
      </AnimatedPressable>
    );
  }
  
  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        containerStyle,
        animatedContainerStyle,
        Platform.OS === 'web'
          ? ({ clipPath: `path('${polygonPath}')` } as ViewStyle)
          : {},
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
    >
      {/* Glow effect */}
      <Animated.View style={[styles.glow, { width: size, height: size }, animatedGlowStyle]} />
      
      <View style={contentStyle}>
        {children}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    backgroundColor: P5Colors.primary,
    borderRadius: 0,
  },
});

export default P5Selector;
