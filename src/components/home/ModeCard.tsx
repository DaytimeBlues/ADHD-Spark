import React, { useCallback, useState, memo } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Tokens } from '../../theme/tokens';
import HapticsService from '../../services/HapticsService';
import { useTheme } from '../../theme/ThemeProvider';

export type ModeCardMode = {
  name: string;
  icon: string;
  desc: string;
  accent: string;
};

export type ModeCardProps = {
  mode: ModeCardMode;
  onPress: () => void;
  style?: ViewStyle;
  animatedStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

type WebInteractiveStyle = {
  boxShadow?: string;
  borderColor?: string;
  outlineColor?: string;
  outlineStyle?: 'solid' | 'dotted' | 'dashed';
  outlineWidth?: number;
  outlineOffset?: number;
  cursor?: 'pointer';
  transition?: string;
};

const CARD_MIN_HEIGHT = 100;
const DOT_SIZE = 4; // Smaller, sharper dots
const ICON_SIZE = 24;

function ModeCardComponent({
  mode,
  onPress,
  style,
  animatedStyle,
  testID,
}: ModeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { isCosmic } = useTheme();

  const hoverStyle: WebInteractiveStyle | undefined =
    Platform.OS === 'web' && (isHovered || isFocused)
      ? ({
        borderColor: mode.accent,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${mode.accent}40, inset 0 0 12px ${mode.accent}20`,
        transform: 'translateY(-2px) scale(1.02)',
      } as WebInteractiveStyle)
      : undefined;

  const focusStyle: WebInteractiveStyle | undefined =
    Platform.OS === 'web' && isFocused
      ? ({
        outlineColor: mode.accent,
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineOffset: 2,
      } as WebInteractiveStyle)
      : undefined;

  const handlePress = useCallback(() => {
    HapticsService.tap({ key: 'modeCard' });
    onPress();
  }, [onPress]);

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        testID={testID}
        accessibilityLabel={`${mode.name} mode`}
        accessibilityHint={`Open ${mode.name}. ${mode.desc}`}
        accessibilityRole="button"
        onPress={handlePress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={({ pressed }) => [
          styles.card,
          isCosmic ? styles.cardCosmic : styles.cardStandard,
          { borderTopColor: mode.accent },
          Platform.OS === 'web' &&
          ({
            cursor: 'pointer',
            transition:
              'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          } as WebInteractiveStyle),
          pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] },
          hoverStyle,
          focusStyle,
        ]}
      >
        {Platform.OS === 'web' && (
          <View style={styles.webGradientOverlay} />
        )}
        <View style={styles.cardHeader}>
          <Icon
            name={mode.icon}
            size={ICON_SIZE}
            color={
              isHovered ? Tokens.colors.brand[500] : Tokens.colors.text.primary
            }
          />

          {/* Status Dot - Red accent only when active/hovered if needed, or remove to be sparse */}
          <View
            style={[styles.accentDot, isHovered && styles.accentDotActive]}
          />
        </View>

        <View style={styles.cardContent}>
          <Text
            style={[
              styles.cardTitle,
              isHovered && { color: mode.accent, textShadowColor: `${mode.accent}80`, textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } },
            ]}
          >
            {mode.name.toUpperCase()}
          </Text>
          <Text style={[styles.cardDesc, isHovered && styles.cardDescHovered]} numberOfLines={2}>
            {mode.desc}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Tokens.spacing[4] || 16,
    borderRadius: 20,
    borderWidth: 1,
    borderTopWidth: 2,
    minHeight: CARD_MIN_HEIGHT,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardCosmic: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(22, 28, 48, 0.45)', // Lighter, more transparent base
    ...Platform.select({
      web: {
        backdropFilter: 'blur(24px) saturate(180%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      default: {
        backgroundColor: 'rgba(32, 38, 64, 0.95)', // Solid fallback for poor native rendering
      }
    }),
  },
  cardStandard: {
    borderColor: Tokens.colors.neutral.border,
    backgroundColor: Tokens.colors.neutral.dark,
  },
  webGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%)',
      pointerEvents: 'none',
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  accentDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2, // Round instead of square
    backgroundColor: 'transparent',
  },
  accentDotActive: {
    backgroundColor: Tokens.colors.brand[500],
  },
  cardContent: {
    marginTop: Tokens.spacing[3],
  },
  cardTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    color: '#EEF2FF', // Always use a bright white/starlight color for base
    marginBottom: Tokens.spacing[1],
    letterSpacing: 1,
  },
  cardDesc: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    color: 'rgba(238, 242, 255, 0.65)',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  cardDescHovered: {
    color: 'rgba(238, 242, 255, 0.9)',
  }
});

// Memoize for performance - prevents unnecessary re-renders
export default memo(ModeCardComponent);
