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
        borderColor: 'rgba(255, 255, 255, 0.25)',
        backgroundColor: '#232A42',
        transform: 'translateY(-2px)',
        boxShadow: `0 12px 40px rgba(0,0,0,0.3), 0 0 24px ${mode.accent}25`,
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
          Platform.OS === 'web' &&
          ({
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          } as WebInteractiveStyle),
          pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          hoverStyle,
          focusStyle,
        ]}
      >
        {Platform.OS === 'web' && <View style={styles.webGradientOverlay} />}
        <View style={styles.cardHeader}>
          <Icon
            name={mode.icon}
            size={ICON_SIZE}
            color={
              isHovered ? mode.accent : Tokens.colors.text.primary
            }
          />
          <View
            style={[styles.accentDot, isHovered && { backgroundColor: mode.accent }]}
          />
        </View>

        <View style={styles.cardContent}>
          <Text
            style={[
              styles.cardTitle,
              isHovered && {
                color: '#FFFFFF',
              },
            ]}
          >
            {mode.name.toUpperCase()}
          </Text>
          <Text
            style={[styles.cardDesc, isHovered && styles.cardDescHovered]}
            numberOfLines={2}
          >
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
    borderRadius: 24, // Generous, friendly corner radius
    borderWidth: 1,
    minHeight: CARD_MIN_HEIGHT,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardCosmic: {
    backgroundColor: '#1E2336', // Warm, soft navy matte finish
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(255, 255, 255, 0.15)', // Gentle light catch
    ...Platform.select({
      web: {
        backdropFilter: 'blur(24px)', // Soften the background
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      } as any,
      default: {
        backgroundColor: '#1E2336', // Reliable, solid but soft color for Native
        elevation: 4, // Gentle drop shadow on Android
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  cardStandard: {
    borderColor: Tokens.colors.neutral.border,
    backgroundColor: Tokens.colors.neutral.dark,
  },
  webGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1,
    ...(Platform.OS === 'web' && {
      backgroundImage:
        'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 100%)',
      pointerEvents: 'none',
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  accentDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: 'transparent',
  },
  accentDotActive: {
    // This is overridden dynamically now
  },
  cardContent: {
    marginTop: Tokens.spacing[3],
    zIndex: 2,
  },
  cardTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    color: '#EEF2FF', // Soft starlight white
    marginBottom: Tokens.spacing[1],
    letterSpacing: 1.2,
  },
  cardDesc: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    color: 'rgba(238, 242, 255, 0.65)',
    lineHeight: 18,
    letterSpacing: 0.3, // Reduced spacing for easier reading
  },
  cardDescHovered: {
    color: 'rgba(238, 242, 255, 0.95)',
  },
});

// Memoize for performance - prevents unnecessary re-renders
export default memo(ModeCardComponent);
