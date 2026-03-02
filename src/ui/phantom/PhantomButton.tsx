/**
 * PhantomButton
 *
 * P5-style action button — skewed rectangle, crisp borders, uppercase text.
 * Red primary, white secondary, black outline variants.
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
  View,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface PhantomButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

type WebFocusStyle = ViewStyle & {
  outline?: string;
};

export const PhantomButton = memo(function PhantomButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  onLongPress,
  style,
  testID,
  accessibilityLabel,
}: PhantomButtonProps) {
  const { isPhantom } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = useCallback(() => {
    if (!disabled && !loading) {
      setIsPressed(true);
    }
  }, [disabled, loading]);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
  }, []);

  const getHeight = useMemo(() => {
    switch (size) {
      case 'sm':
        return 36;
      case 'md':
        return 48;
      case 'lg':
        return 56;
      default:
        return 48;
    }
  }, [size]);

  const getPadding = useMemo(() => {
    switch (size) {
      case 'sm':
        return 12;
      case 'md':
        return 16;
      case 'lg':
        return 24;
      default:
        return 16;
    }
  }, [size]);

  const containerStyle = useMemo((): ViewStyle => {
    if (!isPhantom) {
      return {
        height: getHeight,
        paddingHorizontal: getPadding,
        borderRadius: 8,
      };
    }

    const baseStyle: ViewStyle = {
      height: getHeight,
      paddingHorizontal: getPadding,
      borderRadius: 0, // No rounded corners
      transform: [{ skewX: '-5deg' }], // Jagged skew
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: isPressed ? '#8B0000' : '#D80000',
          borderWidth: 2,
          borderColor: '#FFFFFF',
          shadowColor: '#D80000',
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 0.8,
          shadowRadius: 0,
          elevation: 4,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: '#FFFFFF',
          borderWidth: 2,
          borderColor: '#000000',
        };
      case 'outline':
      default:
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: '#FFFFFF',
        };
    }
  }, [isPhantom, isPressed, variant, getHeight, getPadding]);

  const textStyle = useMemo((): TextStyle => {
    if (!isPhantom) {
      return { fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16 };
    }

    const fontFamily = Platform.select({
      web: 'Impact, "Arial Black", sans-serif',
      ios: 'Impact',
      android: 'sans-serif-black',
      default: 'sans-serif',
    });

    const baseColor = variant === 'primary' ? '#FFFFFF' : variant === 'secondary' ? '#000000' : '#FFFFFF';

    return {
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      fontWeight: '900',
      color: baseColor,
      fontFamily,
      letterSpacing: 1,
      textTransform: 'uppercase',
      textAlign: 'center',
    };
  }, [isPhantom, variant, size]);

  const handlePress = useCallback(() => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  if (!isPhantom) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled || loading}
        style={[styles.fallback, { height: getHeight }, style]}
        accessibilityLabel={accessibilityLabel}
      >
        {loading ? (
          <Text style={textStyle}>...</Text>
        ) : (
          <Text style={textStyle}>{children}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.container,
        containerStyle,
        Platform.OS === 'web'
          ? ({
              cursor: disabled || loading ? 'not-allowed' : 'pointer',
            } as WebFocusStyle)
          : {},
        disabled && styles.disabled,
        isPressed && styles.pressed,
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      <View style={styles.content}>
        {loading ? (
          <Text style={textStyle}>...</Text>
        ) : (
          <Text style={textStyle}>{children}</Text>
        )}
      </View>
    </Pressable>
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
  fallback: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});

export default PhantomButton;
