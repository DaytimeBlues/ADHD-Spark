/**
 * P5Input - Persona 5 Style Text Input
 * 
 * Stark, typewriter-like directness with bottom border focus animation.
 * Angular, architectural presence.
 * 
 * @example
 * <P5Input
 *   label="Mission Name"
 *   value={taskName}
 *   onChangeText={setTaskName}
 *   placeholder="Enter your objective..."
 * />
 */

import React, { memo, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  Platform,
  TextInputProps,
} from 'react-native';
import {
  P5Colors,
  P5Spacing,
  P5Typography,
  P5FontSizes,
  P5Motion,
  P5Geometry,
  P5InputTokens,
} from '../../theme/p5Tokens';

export interface P5InputProps extends Omit<TextInputProps, 'style'> {
  /** Input label */
  label?: string;
  
  /** Current value */
  value: string;
  
  /** Change handler */
  onChangeText: (text: string) => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Error message */
  error?: string;
  
  /** Helper text */
  helper?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Required field indicator */
  required?: boolean;
  
  /** Multiline input */
  multiline?: boolean;
  
  /** Number of lines for multiline */
  numberOfLines?: number;
  
  /** Test ID */
  testID?: string;
  
  /** Accessibility label */
  accessibilityLabel?: string;
  
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
}

export const P5Input = memo(function P5Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  disabled = false,
  required = false,
  multiline = false,
  numberOfLines = 1,
  testID,
  accessibilityLabel,
  style,
  ...textInputProps
}: P5InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  
  // Animated values for focus effects
  const borderColorAnim = useRef(new Animated.Value(2)).current;
  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  
  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(borderColorAnim, {
        toValue: 3,
        duration: P5Motion.duration.fast,
        useNativeDriver: false,
      }),
      Animated.timing(labelPosition, {
        toValue: 1,
        duration: P5Motion.duration.fast,
        useNativeDriver: false,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0.3,
        duration: P5Motion.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  }, [borderColorAnim, labelPosition, glowOpacity]);
  
  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const shouldFloat = value.length > 0;
    Animated.parallel([
      Animated.timing(borderColorAnim, {
        toValue: 2,
        duration: P5Motion.duration.fast,
        useNativeDriver: false,
      }),
      Animated.timing(labelPosition, {
        toValue: shouldFloat ? 1 : 0,
        duration: P5Motion.duration.fast,
        useNativeDriver: false,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: P5Motion.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  }, [borderColorAnim, labelPosition, glowOpacity, value]);
  
  // Label animation style
  const labelAnimatedStyle = useMemo(() => ({
    transform: [
      {
        translateY: labelPosition.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
      {
        scale: labelPosition.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.85],
        }),
      },
    ],
  }), [labelPosition]);
  
  // Border color based on state
  const borderColor = useMemo(() => {
    if (error) return P5Colors.error;
    if (isFocused) return P5Colors.primary;
    return P5Colors.stroke;
  }, [error, isFocused]);
  
  // Container styles
  const containerStyle = useMemo((): ViewStyle => ({
    marginBottom: P5Spacing.md,
  }), []);
  
  // Input wrapper styles
  const inputWrapperStyle = useMemo((): ViewStyle => ({
    height: multiline ? undefined : P5InputTokens.height,
    borderBottomWidth: 2,
    borderBottomColor: borderColor,
    backgroundColor: 'transparent',
  }), [borderColor, multiline]);
  
  // Input styles
  const inputStyle = useMemo((): TextStyle => ({
    flex: 1,
    fontSize: P5FontSizes.body,
    fontWeight: '500',
    color: disabled ? P5Colors.textMuted : P5Colors.text,
    paddingVertical: P5Spacing.sm,
    textAlignVertical: multiline ? 'top' : 'center',
  }), [disabled, multiline]);
  
  // Label styles
  const labelStyle = useMemo((): TextStyle => ({
    position: 'absolute',
    left: 0,
    top: value || isFocused ? -P5Spacing.xs : P5Spacing.md,
    fontSize: isFocused || value ? P5FontSizes.caption : P5FontSizes.body,
    fontWeight: isFocused ? '700' : '500',
    color: error ? P5Colors.error : isFocused ? P5Colors.primary : P5Colors.textMuted,
  }), [error, isFocused, value]);
  
  // Error/helper text
  const helperTextStyle = useMemo((): TextStyle => ({
    fontSize: P5FontSizes.caption,
    color: error ? P5Colors.error : P5Colors.textMuted,
    marginTop: P5Spacing.xs,
  }), [error]);
  
  // Error pulse animation (for error state)
  const errorPulse = useCallback(() => {
    if (!error) return;
    
    const sequence = [
      Animated.timing(borderColorAnim, { toValue: 4, duration: 100, useNativeDriver: false }),
      Animated.timing(borderColorAnim, { toValue: 2, duration: 100, useNativeDriver: false }),
      Animated.timing(borderColorAnim, { toValue: 4, duration: 100, useNativeDriver: false }),
      Animated.timing(borderColorAnim, { toValue: 2, duration: 100, useNativeDriver: false }),
      Animated.timing(borderColorAnim, { toValue: 4, duration: 100, useNativeDriver: false }),
    ];
    
    Animated.sequence(sequence).start();
  }, [error, borderColorAnim]);
  
  // Trigger error pulse when error changes
  React.useEffect(() => {
    if (error) {
      errorPulse();
    }
  }, [error, errorPulse]);
  
  return (
    <View style={[styles.container, containerStyle, style]} testID={testID}>
      {label && (
        <Animated.View style={labelAnimatedStyle}>
          <Text style={labelStyle}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </Animated.View>
      )}
      
      <View style={inputWrapperStyle}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={P5Colors.textMuted}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[styles.input, inputStyle]}
          accessibilityLabel={accessibilityLabel || label}
          {...textInputProps}
        />
      </View>
      
      {(error || helper) && (
        <Text style={helperTextStyle}>
          {error || helper}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    flex: 1,
  },
  required: {
    color: P5Colors.primary,
  },
});

export default P5Input;
