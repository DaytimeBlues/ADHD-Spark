/**
 * BottomSheet
 *
 * Reusable bottom sheet / modal drawer primitive for the cosmic theme.
 * Slides up from the bottom with a backdrop dimmer.
 * Supports swipe-to-dismiss (via drag handle) and backdrop tap to dismiss.
 *
 * Usage:
 *   <BottomSheet visible={open} onClose={() => setOpen(false)} title="CAPTURE">
 *     <YourContent />
 *   </BottomSheet>
 */

import React, { memo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { surfaceColors, textColors } from '../../theme/cosmicTokens';

// ============================================================================
// TYPES
// ============================================================================

export interface BottomSheetProps {
  /** Controls visibility */
  visible: boolean;
  /** Called when user dismisses (backdrop tap, drag, close button) */
  onClose: () => void;
  /** Optional sheet title — rendered in header */
  title?: string;
  /** Optional right-side header element (e.g. badge, action button) */
  headerRight?: React.ReactNode;
  /** Sheet content */
  children: React.ReactNode;
  /** Max height as fraction of screen (0–1). Defaults to 0.75 */
  maxHeightFraction?: number;
  /** Whether content should be scrollable. Defaults to true */
  scrollable?: boolean;
  /** Disable backdrop dismiss. Defaults to false */
  disableBackdropDismiss?: boolean;
  /** Test ID for the sheet container */
  testID?: string;
  /** Custom container style override */
  style?: ViewStyle;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ANIMATION_DURATION = 280;
const SHEET_BORDER_RADIUS = 24;

// ============================================================================
// COMPONENT
// ============================================================================

export const BottomSheet = memo(function BottomSheet({
  visible,
  onClose,
  title,
  headerRight,
  children,
  maxHeightFraction = 0.82,
  scrollable = true,
  disableBackdropDismiss = false,
  testID,
  style,
}: BottomSheetProps) {
  const { isCosmic } = useTheme();
  const translateY = useRef(new Animated.Value(600)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Slide in when visible
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 600,
          duration: ANIMATION_DURATION - 40,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION - 40,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, backdropOpacity]);

  const handleBackdropPress = useCallback(() => {
    if (!disableBackdropDismiss) {
      onClose();
    }
  }, [disableBackdropDismiss, onClose]);

  const sheetBackground = isCosmic
    ? surfaceColors.raised // rgba(18, 26, 52, 0.96)
    : '#1A1A2E';

  const borderColor = isCosmic
    ? 'rgba(139, 92, 246, 0.2)' // nebulaViolet 20%
    : 'rgba(255,255,255,0.08)';

  const maxHeight = `${Math.round(maxHeightFraction * 100)}%` as `${number}%`;

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentProps = scrollable
    ? {
        showsVerticalScrollIndicator: false,
        keyboardShouldPersistTaps: 'handled' as const,
        contentContainerStyle: styles.scrollContent,
      }
    : {};

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleBackdropPress}
          accessibilityLabel="Close sheet"
          accessibilityRole="button"
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[styles.sheetWrapper, { transform: [{ translateY }] }]}
        pointerEvents="box-none"
      >
        <View
          testID={testID}
          style={[
            styles.sheet,
            {
              backgroundColor: sheetBackground,
              borderColor,
              maxHeight,
              ...(Platform.OS === 'web' &&
                ({
                  boxShadow:
                    '0 -8px 40px rgba(7, 7, 18, 0.7), 0 0 0 1px rgba(139, 92, 246, 0.15)',
                } as ViewStyle)),
            },
            style,
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.handleContainer} accessibilityElementsHidden>
            <View
              style={[
                styles.handle,
                isCosmic ? styles.handleCosmic : styles.handleLinear,
              ]}
            />
          </View>

          {/* Header */}
          {(title !== undefined || headerRight !== undefined) && (
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {title !== undefined && (
                  <Text
                    style={[
                      styles.headerTitle,
                      isCosmic ? styles.titleCosmic : styles.titleLinear,
                    ]}
                  >
                    {title}
                  </Text>
                )}
              </View>
              <View style={styles.headerRight}>
                {headerRight}
                <Pressable
                  testID="capture-cancel"
                  onPress={onClose}
                  style={styles.closeButton}
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text
                    style={[
                      styles.closeIcon,
                      isCosmic
                        ? styles.closeIconCosmic
                        : styles.closeIconLinear,
                    ]}
                  >
                    ✕
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Content */}
          <ContentWrapper style={styles.content} {...contentProps}>
            {children}
          </ContentWrapper>
        </View>
      </Animated.View>
    </Modal>
  );
});

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 7, 18, 0.72)',
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: SHEET_BORDER_RADIUS,
    borderTopRightRadius: SHEET_BORDER_RADIUS,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // safe area bottom
    minHeight: 200,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(185, 194, 217, 0.08)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 16,
    fontWeight: '400',
  },
  content: {
    flexShrink: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  handleCosmic: {
    backgroundColor: 'rgba(185, 194, 217, 0.3)',
  },
  handleLinear: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  titleCosmic: {
    color: textColors.secondary,
  },
  titleLinear: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  closeIconCosmic: {
    color: textColors.muted,
  },
  closeIconLinear: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

export default BottomSheet;
