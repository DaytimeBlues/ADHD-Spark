/**
 * CaptureBubble
 *
 * Persistent Floating Action Button (FAB+) for the Capture feature.
 * Rendered above all tab screens. Manages bubble state reactively
 * via CaptureService subscription.
 *
 * States: idle | recording | processing | needs-review | failed | offline
 */

import React, { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  ViewStyle,
} from 'react-native';
import CaptureService from '../../services/CaptureService';
import { CaptureDrawer } from './CaptureDrawer';

// ============================================================================
// TYPES
// ============================================================================

export type BubbleState =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'needs-review'
  | 'failed'
  | 'offline';

// ============================================================================
// CONSTANTS
// ============================================================================

const FAB_SIZE = 60;
const BADGE_SIZE = 22;
const PULSE_DURATION = 900;
const SPIN_DURATION = 1200;
const SHAKE_DURATION = 400;

// Cosmic colors (no hex outside tokens in app code — these mirror cosmicTokens)
const COLORS = {
  idle: '#8B5CF6',       // nebulaViolet
  recording: '#2DD4BF',  // auroraTeal
  processing: '#8B5CF6', // nebulaViolet
  failed: '#FB7185',     // cometRose
  offline: '#6B7A9C',    // neutral.medium (muted)
  badge: '#FB7185',      // cometRose
  badgeText: '#EEF2FF',  // starlight
  fabText: '#EEF2FF',    // starlight
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

export const CaptureBubble = memo(function CaptureBubble() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bubbleState, setBubbleState] = useState<BubbleState>('idle');
  const [badgeCount, setBadgeCount] = useState(0);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Subscribe to badge count updates from CaptureService
  useEffect(() => {
    const unsub = CaptureService.subscribe((count) => {
      setBadgeCount(count);
      if (count > 0 && bubbleState === 'idle') {
        setBubbleState('needs-review');
      } else if (count === 0 && bubbleState === 'needs-review') {
        setBubbleState('idle');
      }
    });
    return unsub;
  }, [bubbleState]);

  // Pulse animation (recording state)
  useEffect(() => {
    if (bubbleState === 'recording') {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: PULSE_DURATION / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: PULSE_DURATION / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => {
      pulseLoop.current?.stop();
    };
  }, [bubbleState, pulseAnim]);

  // Spin animation (processing state)
  useEffect(() => {
    if (bubbleState === 'processing') {
      spinLoop.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: SPIN_DURATION,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      spinLoop.current.start();
    } else {
      spinLoop.current?.stop();
      spinAnim.setValue(0);
    }
    return () => {
      spinLoop.current?.stop();
    };
  }, [bubbleState, spinAnim]);

  // Shake animation (failed state — plays once)
  const runShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true, easing: Easing.linear }),
    ]).start(() => {
      // Reset to idle after showing error for 3s
      setTimeout(() => {
        setBubbleState((prev) => (prev === 'failed' ? (badgeCount > 0 ? 'needs-review' : 'idle') : prev));
      }, 3000);
    });
  }, [shakeAnim, badgeCount]);

  // Run shake when entering failed state
  useEffect(() => {
    if (bubbleState === 'failed') {
      runShake();
    }
  }, [bubbleState, runShake]);

  // Spin rotation interpolation
  const spinRotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Derive FAB color from state
  const fabColor = useMemo((): string => {
    switch (bubbleState) {
      case 'recording': return COLORS.recording;
      case 'processing': return COLORS.processing;
      case 'failed': return COLORS.failed;
      case 'offline': return COLORS.offline;
      default: return COLORS.idle;
    }
  }, [bubbleState]);

  // Derive FAB glow (web only)
  const fabGlow = useMemo((): ViewStyle => {
    if (Platform.OS !== 'web') {
      return {};
    }
    switch (bubbleState) {
      case 'recording':
        return { boxShadow: `0 0 0 3px rgba(45, 212, 191, 0.35), 0 0 28px rgba(45, 212, 191, 0.4), 0 8px 24px rgba(7,7,18,0.6)` } as ViewStyle;
      case 'failed':
        return { boxShadow: `0 0 0 2px rgba(251, 113, 133, 0.4), 0 0 20px rgba(251, 113, 133, 0.3)` } as ViewStyle;
      case 'offline':
        return { boxShadow: `0 4px 16px rgba(7,7,18,0.5)` } as ViewStyle;
      default:
        return { boxShadow: `0 0 0 2px rgba(139, 92, 246, 0.3), 0 0 24px rgba(139, 92, 246, 0.35), 0 8px 24px rgba(7,7,18,0.6)` } as ViewStyle;
    }
  }, [bubbleState]);

  // Derive FAB icon/label
  const fabIcon = useMemo((): string => {
    switch (bubbleState) {
      case 'recording': return '⏹';
      case 'processing': return '⟳';
      case 'failed': return '✕';
      case 'offline': return '⊗';
      default: return '+';
    }
  }, [bubbleState]);

  const handlePress = useCallback(() => {
    if (bubbleState === 'processing') {
      return; // non-interactive
    }
    setDrawerOpen(true);
  }, [bubbleState]);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  // Expose setBubbleState to drawer (for recording/processing state sync)
  const handleStateChange = useCallback((state: BubbleState) => {
    setBubbleState(state);
  }, []);

  return (
    <>
      {/* FAB */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [
              { scale: pulseAnim },
              { translateX: shakeAnim },
              ...(bubbleState === 'processing' ? [{ rotate: spinRotation }] : []),
            ],
          },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          testID="capture-bubble"
          onPress={handlePress}
          disabled={bubbleState === 'processing'}
          accessibilityLabel={
            bubbleState === 'recording'
              ? 'Stop recording'
              : bubbleState === 'needs-review'
              ? `Capture inbox, ${badgeCount} item${badgeCount !== 1 ? 's' : ''} to review`
              : 'Open capture'
          }
          accessibilityRole="button"
          style={[
            styles.fab,
            { backgroundColor: fabColor },
            fabGlow,
          ]}
        >
          <Text style={styles.fabIcon}>{fabIcon}</Text>
        </Pressable>

        {/* Badge */}
        {badgeCount > 0 && bubbleState !== 'recording' && bubbleState !== 'processing' && (
          <View style={styles.badge} testID="capture-bubble-badge">
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : badgeCount}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Capture Drawer */}
      <CaptureDrawer
        visible={drawerOpen}
        onClose={handleDrawerClose}
        onStateChange={handleStateChange}
        currentBubbleState={bubbleState}
      />
    </>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 88, // above tab bar (60px) + padding
    right: 20,
    zIndex: 999,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 26,
    color: COLORS.fabText,
    fontWeight: '300',
    lineHeight: 30,
    includeFontPadding: false,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: COLORS.badge,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#070712', // obsidian border to separate from FAB
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.badgeText,
  },
});

export default CaptureBubble;
