import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {
  MetroPalette,
  MetroSpacing,
  MetroTypography,
} from '../../theme/metroTheme';

interface MetroButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outline' | 'link';
  accentColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const MetroButton: React.FC<MetroButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  accentColor = MetroPalette.blue,
  disabled = false,
  style,
  textStyle,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        disabled && styles.disabled,
        variant === 'filled' && {
          backgroundColor: disabled ? MetroPalette.darkGray : accentColor,
          ...(!disabled && styles.shadow),
        },
        variant === 'outline' && {
          borderColor: disabled ? MetroPalette.gray : accentColor,
          borderWidth: 2,
          backgroundColor: 'transparent',
          ...(!disabled && styles.shadow),
        },
        variant === 'link' && { backgroundColor: 'transparent' },
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.text,
            variant === 'filled' && { color: MetroPalette.white },
            variant === 'outline' && {
              color: disabled ? MetroPalette.gray : accentColor,
            },
            variant === 'link' && {
              color: disabled ? MetroPalette.gray : accentColor,
            },
            variant === 'link' && styles.textUnderline,
            pressed && variant === 'link' && styles.textOpacity07,
            textStyle,
          ]}
        >
          {title.toUpperCase()}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: MetroSpacing.m,
    paddingHorizontal: MetroSpacing.l,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0, // Explicitly sharp
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  textUnderline: {
    textDecorationLine: 'underline',
  },
  textOpacity07: {
    opacity: 0.7,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }, { translateY: 2 }], // Physically depress button
    shadowOpacity: 0,
    elevation: 0,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontFamily: MetroTypography.fontFamily,
    fontWeight: MetroTypography.weights.bold,
    fontSize: MetroTypography.sizes.body,
    letterSpacing: MetroTypography.letterSpacing.uppercase,
  },
});
