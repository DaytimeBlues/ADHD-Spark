/**
 * P5Header - Persona 5 Style Screen Header
 * 
 * Bold, angular header with optional back button.
 * Large display typography, theatrical presence.
 * 
 * @example
 * <P5Header 
 *   title="METAZONE" 
 *   showBack 
 *   onBack={() => navigation.goBack()} 
 * />
 */

import React, { memo, useMemo, useCallback, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  P5Colors,
  P5SemanticColors,
  P5Spacing,
  P5Typography,
  P5FontSizes,
  P5Motion,
  P5Geometry,
} from '../../theme/p5Tokens';

export interface P5HeaderProps {
  /** Header title */
  title: string;
  
  /** Show back button */
  showBack?: boolean;
  
  /** Back button press handler */
  onBack?: () => void;
  
  /** Optional subtitle */
  subtitle?: string;
  
  /** Right-side action element */
  rightAction?: ReactNode;
  
  /** Optional leading element */
  leading?: ReactNode;
  
  /** Header variant */
  variant?: 'default' | 'large' | 'minimal';
  
  /** Test ID */
  testID?: string;
  
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const P5Header = memo(function P5Header({
  title,
  showBack = false,
  onBack,
  subtitle,
  rightAction,
  leading,
  variant = 'default',
  testID,
  style,
}: P5HeaderProps) {
  const insets = useSafeAreaInsets();
  
  // Animation value for back button
  const backScale = useSharedValue(1);
  
  // Animated back button style
  const animatedBackStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backScale.value }],
  }));
  
  // Back button press handlers
  const handleBackPressIn = useCallback(() => {
    backScale.value = withSpring(0.9, {
      stiffness: P5Motion.easing.spring.stiffness,
      damping: P5Motion.easing.spring.damping,
    });
  }, [backScale]);
  
  const handleBackPressOut = useCallback(() => {
    backScale.value = withSpring(1, {
      stiffness: P5Motion.easing.spring.stiffness,
      damping: P5Motion.easing.spring.damping,
    });
  }, [backScale]);
  
  const handleBackPress = useCallback(() => {
    if (onBack) {
      onBack();
    }
  }, [onBack]);
  
  // Header height based on variant
  const headerHeight = useMemo(() => {
    switch (variant) {
      case 'large':
        return 120 + insets.top;
      case 'minimal':
        return 48 + insets.top;
      case 'default':
      default:
        return 80 + insets.top;
    }
  }, [variant, insets.top]);
  
  // Title size based on variant
  const titleSize = useMemo(() => {
    switch (variant) {
      case 'large':
        return P5FontSizes.display1;
      case 'minimal':
        return P5FontSizes.heading2;
      case 'default':
      default:
        return P5FontSizes.display2;
    }
  }, [variant]);
  
  // Container style
  const containerStyle = useMemo((): ViewStyle => ({
    height: headerHeight,
    backgroundColor: P5Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: P5SemanticColors.borderDefault,
    paddingTop: insets.top,
  }), [headerHeight, insets.top]);
  
  // Title style
  const titleStyle = useMemo((): object => ({
    fontSize: titleSize,
    fontWeight: '900',
    color: P5Colors.text,
    fontFamily: P5Typography.display.fontFamily,
    letterSpacing: -0.02,
    textTransform: 'uppercase',
  }), [titleSize]);
  
  // Back button style
  const backButtonStyle = useMemo((): ViewStyle => ({
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  }), []);
  
  // Chevron icon (simple SVG-like representation)
  const ChevronLeft = () => (
    <View style={styles.chevronLeft}>
      <View style={styles.chevronLine1} />
      <View style={styles.chevronLine2} />
    </View>
  );
  
  return (
    <View style={[styles.container, containerStyle, style]} testID={testID}>
      <StatusBar barStyle="light-content" backgroundColor={P5Colors.background} />
      
      <View style={styles.content}>
        {/* Left section */}
        <View style={styles.leftSection}>
          {showBack && (
            <AnimatedPressable
              onPress={handleBackPress}
              onPressIn={handleBackPressIn}
              onPressOut={handleBackPressOut}
              style={[backButtonStyle, animatedBackStyle]}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ChevronLeft />
            </AnimatedPressable>
          )}
          {leading && !showBack && leading}
        </View>
        
        {/* Center section - Title */}
        <View style={styles.centerSection}>
          <Text style={titleStyle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {/* Right section */}
        <View style={styles.rightSection}>
          {rightAction}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: P5Spacing.sm,
  },
  leftSection: {
    width: 60,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 60,
    alignItems: 'flex-end',
  },
  subtitle: {
    fontSize: P5FontSizes.caption,
    fontWeight: '500',
    color: P5Colors.textMuted,
    marginTop: 2,
  },
  chevronLeft: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronLine1: {
    position: 'absolute',
    width: 12,
    height: 3,
    backgroundColor: P5Colors.text,
    transform: [{ rotate: '-45deg' }, { translateY: -4 }],
  },
  chevronLine2: {
    position: 'absolute',
    width: 12,
    height: 3,
    backgroundColor: P5Colors.text,
    transform: [{ rotate: '45deg' }, { translateY: 4 }],
  },
});

export default P5Header;
