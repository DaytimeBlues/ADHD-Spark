/**
 * P5Screen - Persona 5 Style Screen Container
 * 
 * Full-screen container with black background and safe area handling.
 * Base component for all P5-styled screens.
 * 
 * @example
 * <P5Screen>
 *   <P5Header title="Dashboard" showBack />
 *   <ScrollView>...</ScrollView>
 * </P5Screen>
 */

import React, { memo, ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  P5Colors,
  P5Spacing,
} from '../../theme/p5Tokens';

export interface P5ScreenProps {
  /** Screen content */
  children: ReactNode;
  
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
}

export const P5Screen = memo(function P5Screen({
  children,
  style,
}: P5ScreenProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        style,
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={P5Colors.background} />
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: P5Colors.background,
  },
});

export default P5Screen;
