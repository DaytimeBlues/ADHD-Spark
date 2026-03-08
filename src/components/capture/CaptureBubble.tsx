/**
 * CaptureBubble
 *
 * Persistent Floating Action Button (FAB+) for the Capture feature.
 * Rendered above all tab screens. Manages bubble state reactively
 * via CaptureService subscription.
 *
 * States: idle | recording | processing | needs-review | failed | offline
 */

import React, {
  memo,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  Easing,
  View,
  ViewStyle,
} from 'react-native';
import CaptureService from '../../services/CaptureService';
import { CheckInService } from '../../services/CheckInService';
import { navigationRef } from '../../navigation/navigationRef';
import { ROUTES } from '../../navigation/routes';
import { isWeb } from '../../utils/PlatformUtils';
import { useTaskStore } from '../../store/useTaskStore';
import OverlayService from '../../services/OverlayService';
import { CaptureDrawer } from './CaptureDrawer';
import type { BubbleState } from './captureTypes';

// ============================================================================
// TYPES
// ============================================================================

const FAB_SIZE = 60;
const BADGE_SIZE = 22;
const PULSE_DURATION = 900;
const SPIN_DURATION = 1200;

// Cosmic colors (no hex outside tokens in app code - these mirror cosmicTokens)
const COLORS = {
  idle: '#8B5CF6', // nebulaViolet
  recording: '#2DD4BF', // auroraTeal
  processing: '#8B5CF6', // nebulaViolet
  failed: '#FB7185', // cometRose
  offline: '#6B7A9C', // neutral.medium (muted)
  needsCheckin: '#F6C177', // gold
  badge: '#FB7185', // cometRose
  badgeText: '#EEF2FF', // starlight
  fabText: '#EEF2FF', // starlight
  hintBg: 'rgba(7, 7, 18, 0.84)',
  hintBorder: 'rgba(185, 194, 217, 0.18)',
  hintText: '#EEF2FF',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

export const CaptureBubble = memo(function CaptureBubble() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bubbleState, setBubbleState] = useState<BubbleState>('idle');
  const [badgeCount, setBadgeCount] = useState(0);

  // Task Store Integration
  const activeTaskCount = useTaskStore((state) => state.getActiveCount());
  const totalBadgeCount = badgeCount + activeTaskCount;

  // Sync with native overlay
  useEffect(() => {
    OverlayService.updateCount(totalBadgeCount);
  }, [totalBadgeCount]);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const spinLoop = useRef<Animated.CompositeAnimation | null>(null);
  const useNativeDriver = !isWeb;

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

  // Subscribe to check-in interval
  useEffect(() => {
    const unsub = CheckInService.subscribe((isPending) => {
      if (
        isPending &&
        bubbleState !== 'recording' &&
        bubbleState !== 'processing'
      ) {
        setBubbleState('needs-checkin');
      } else if (!isPending && bubbleState === 'needs-checkin') {
        setBubbleState(badgeCount > 0 ? 'needs-review' : 'idle');
      }
    });
    return unsub;
  }, [bubbleState, badgeCount]);

  // Pulse animation (recording state)
  useEffect(() => {
    if (bubbleState === 'recording' || bubbleState === 'needs-checkin') {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: PULSE_DURATION / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: PULSE_DURATION / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver,
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
  }, [bubbleState, pulseAnim, useNativeDriver]);

  // Spin animation (processing state)
  useEffect(() => {
    if (bubbleState === 'processing') {
      spinLoop.current = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: SPIN_DURATION,
          easing: Easing.linear,
          useNativeDriver,
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
  }, [bubbleState, spinAnim, useNativeDriver]);

  // Shake animation (failed state - plays once)
  const runShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 60,
        useNativeDriver,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 60,
        useNativeDriver,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 60,
        useNativeDriver,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 60,
        useNativeDriver,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 60,
        useNativeDriver,
        easing: Easing.linear,
      }),
    ]).start(() => {
      // Reset to idle after showing error for 3s
      setTimeout(() => {
        setBubbleState((prev) =>
          prev === 'failed' ? (badgeCount > 0 ? 'needs-review' : 'idle') : prev,
        );
      }, 3000);
    });
  }, [badgeCount, shakeAnim, useNativeDriver]);

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
      case 'recording':
        return COLORS.recording;
      case 'processing':
        return COLORS.processing;
      case 'failed':
        return COLORS.failed;
      case 'offline':
        return COLORS.offline;
      case 'needs-checkin':
        return COLORS.needsCheckin;
      default:
        return COLORS.idle;
    }
  }, [bubbleState]);

  // Derive FAB glow (web only)
  const fabGlow = useMemo((): ViewStyle => {
    if (!isWeb) {
      return {};
    }
    switch (bubbleState) {
      case 'recording':
        return {
          boxShadow:
            '0 0 0 3px rgba(45, 212, 191, 0.35), 0 0 28px rgba(45, 212, 191, 0.4), 0 8px 24px rgba(7,7,18,0.6)',
        } as ViewStyle;
      case 'failed':
        return {
          boxShadow:
            '0 0 0 2px rgba(251, 113, 133, 0.4), 0 0 20px rgba(251, 113, 133, 0.3)',
        } as ViewStyle;
      case 'offline':
        return { boxShadow: '0 4px 16px rgba(7,7,18,0.5)' } as ViewStyle;
      case 'needs-checkin':
        return {
          boxShadow:
            '0 0 0 3px rgba(246, 193, 119, 0.35), 0 0 28px rgba(246, 193, 119, 0.4), 0 8px 24px rgba(7,7,18,0.6)',
        } as ViewStyle;
      default:
        return {
          boxShadow:
            '0 0 0 2px rgba(139, 92, 246, 0.3), 0 0 24px rgba(139, 92, 246, 0.35), 0 8px 24px rgba(7,7,18,0.6)',
        } as ViewStyle;
    }
  }, [bubbleState]);

  // Derive FAB icon/label
  const fabIcon = useMemo((): string => {
    switch (bubbleState) {
      case 'recording':
        return 'STOP';
      case 'processing':
        return '...';
      case 'failed':
        return 'X';
      case 'offline':
        return 'OFF';
      case 'needs-checkin':
        return 'CHK';
      default:
        return '+';
    }
  }, [bubbleState]);

  const bubbleHint = useMemo((): string | null => {
    if (
      drawerOpen ||
      bubbleState === 'recording' ||
      bubbleState === 'processing'
    ) {
      return null;
    }

    switch (bubbleState) {
      case 'needs-review':
        return totalBadgeCount > 0
          ? `Review ${totalBadgeCount} item${totalBadgeCount !== 1 ? 's' : ''}`
          : 'Review inbox';
      case 'needs-checkin':
        return 'Quick check-in';
      case 'offline':
        return 'Offline capture';
      case 'failed':
        return 'Try again';
      default:
        return 'Quick capture';
    }
  }, [bubbleState, drawerOpen, totalBadgeCount]);

  const handlePress = useCallback(() => {
    if (bubbleState === 'needs-review' && badgeCount > 0) {
      if (navigationRef.isReady()) {
        navigationRef.navigate(ROUTES.INBOX);
      }
      return;
    }

    if (bubbleState === 'processing') {
      return; // non-interactive
    }
    setDrawerOpen(true);
    if (bubbleState === 'needs-checkin') {
      CheckInService.setPending(false);
    }
  }, [bubbleState, badgeCount]);

  const handleBadgePress = useCallback(() => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(ROUTES.INBOX);
    }
  }, []);

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
              ...(bubbleState === 'processing'
                ? [{ rotate: spinRotation }]
                : []),
            ],
          },
        ]}
        pointerEvents="box-none"
      >
        {isWeb && bubbleHint && (
          <View pointerEvents="none" style={styles.hintPill}>
            <Text style={styles.hintText}>{bubbleHint}</Text>
          </View>
        )}

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
          style={[styles.fab, { backgroundColor: fabColor }, fabGlow]}
        >
          <Text style={styles.fabIcon}>{fabIcon}</Text>
        </Pressable>

        {/* Badge */}
        {totalBadgeCount > 0 &&
          bubbleState !== 'recording' &&
          bubbleState !== 'processing' && (
            <Pressable
              style={styles.badge}
              testID="capture-bubble-badge"
              onPress={handleBadgePress}
              accessibilityLabel={`Open capture inbox, ${totalBadgeCount} items to review`}
              accessibilityRole="button"
            >
              <Text style={styles.badgeText}>
                {totalBadgeCount > 99 ? '99+' : totalBadgeCount}
              </Text>
            </Pressable>
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
    alignItems: 'flex-end',
  },
  hintPill: {
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.hintBg,
    borderWidth: 1,
    borderColor: COLORS.hintBorder,
    maxWidth: 168,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.hintText,
    letterSpacing: 0.3,
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
