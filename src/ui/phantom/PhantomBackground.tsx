import React, { memo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface PhantomBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  variant?: 'default' | 'intense';
}

type WebViewStyle = ViewStyle & {
  backgroundImage?: string;
  backgroundSize?: string;
};

export const PhantomBackground = memo(function PhantomBackground({
  children,
  style,
  testID,
  variant = 'default',
}: PhantomBackgroundProps) {
  const { isPhantom, t } = useTheme();

  if (!isPhantom) {
    return <View style={[{ flex: 1, backgroundColor: t.colors.neutral.darkest }, style]}>{children}</View>;
  }

  const webStyle: WebViewStyle | null = Platform.OS === 'web' ? {
    backgroundImage: `radial-gradient(circle at 50% 50%, #1a0000 0%, #000000 100%), radial-gradient(circle at 100% 0%, #330000 0%, transparent 50%)`,
    backgroundSize: '100% 100%, 10px 10px',
  } : null;

  return (
    <View
      testID={testID}
      style={[styles.root, webStyle, style]}
    >
      <View style={styles.halftoneOverlay} pointerEvents="none" />
      {variant === 'intense' && <View style={styles.intenseOverlay} pointerEvents="none" />}
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  halftoneOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
    backgroundColor: '#8B0000',
  },
  intenseOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    backgroundColor: '#D80000',
  },
});

export default PhantomBackground;
