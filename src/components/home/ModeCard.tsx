import React, { useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Tokens } from '../../theme/tokens';

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
  animatedStyle?: any;
  testID?: string;
};

const CARD_MIN_HEIGHT = 140;
const DOT_SIZE = 8;
const ICON_SIZE = 28;

export default function ModeCard({ mode, onPress, style, animatedStyle, testID }: ModeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const hoverStyle =
    Platform.OS === 'web' && isHovered
      ? {
        borderColor: mode.accent,
        backgroundColor: Tokens.colors.neutral.dark,
      }
      : {};

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        testID={testID}
        accessibilityLabel={testID}
        onPress={onPress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={({ pressed }) => [
          styles.card,
          Platform.OS === 'web' && { cursor: 'pointer' },
          pressed && { transform: [{ scale: 0.98 }] },
          hoverStyle,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${mode.accent}15` }]}>
            <Icon name={mode.icon} size={ICON_SIZE} color={mode.accent} />
          </View>
          <View style={[styles.accentDot, { backgroundColor: mode.accent }]} />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{mode.name}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>
            {mode.desc}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Tokens.spacing[4],
    borderRadius: Tokens.radii.lg,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    backgroundColor: Tokens.colors.neutral.darker,
    minHeight: CARD_MIN_HEIGHT,
    justifyContent: 'space-between',
    transition: 'all 0.15s ease',
  } as any,
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Tokens.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accentDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: Tokens.radii.full,
  },
  cardContent: {
    marginTop: Tokens.spacing[3],
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    fontWeight: '600',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
  },
  cardDesc: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.secondary,
    lineHeight: 18,
  },
});
