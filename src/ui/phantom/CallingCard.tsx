/**
 * CallingCard
 *
 * Urgent notification banner — slams down from top with overshoot animation.
 * Auto-dismisses after delay. Red background, jagged edges.
 */

import React, { memo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface CallingCardProps {
  visible: boolean;
  title: string;
  message?: string;
  duration?: number; // Auto-dismiss after ms, 0 = manual only
  onDismiss?: () => void;
  testID?: string;
}

export const CallingCard = memo(function CallingCard({
  visible,
  title,
  message,
  duration = 5000,
  onDismiss,
  testID,
}: CallingCardProps) {
  const { isPhantom } = useTheme();
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slam down animation with overshoot
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide up and fade
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -200,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  // Auto-dismiss timer
  useEffect(() => {
    if (visible && duration > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  const handleDismiss = useCallback(() => {
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  if (!isPhantom || !visible) {
    return null;
  }

  const fontFamily = Platform.select({
    web: 'Impact, "Arial Black", sans-serif',
    ios: 'Impact',
    android: 'sans-serif-black',
    default: 'sans-serif',
  });

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.title, { fontFamily }]}>{title}</Text>
          <Pressable onPress={handleDismiss} hitSlop={8}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#D80000',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 0,
    padding: 16,
    transform: [{ skewX: '-3deg' }],
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
  },
  close: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 12,
  },
  message: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    fontWeight: '600',
  },
});

export default CallingCard;
