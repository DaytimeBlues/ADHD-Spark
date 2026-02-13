import React, { useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Tokens } from '../../theme/tokens';
import HapticsService from '../../services/HapticsService';

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
const DOT_SIZE = 4; // Smaller, sharper dots
const ICON_SIZE = 28;

export default function ModeCard({ mode, onPress, style, animatedStyle, testID }: ModeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hoverStyle =
    Platform.OS === 'web' && (isHovered || isFocused)
      ? ({
        borderColor: Tokens.colors.indigo.primary, // Red accent
        backgroundColor: Tokens.colors.neutral.dark,
        transform: [{ scale: 1 }], // No scale, just color change
      } as any)
      : {};

  const focusStyle =
    Platform.OS === 'web' && isFocused
      ? {
        outlineColor: Tokens.colors.indigo.primary,
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineOffset: 2,
      }
      : {};

  const handlePress = () => {
    HapticsService.tap();
    onPress();
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        testID={testID}
        accessibilityLabel={testID}
        accessibilityRole="button"
        onPress={handlePress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={({ pressed }) => [
          styles.card,
          Platform.OS === 'web' && {
            cursor: 'pointer',
            transition: Tokens.motion.transitions.fast, // Fast linear
          },
          pressed && { opacity: 0.9 }, // Subtle press
          hoverStyle,
          focusStyle as any,
        ]}
      >
        <View style={styles.cardHeader}>
          {/* Dot Matrix Icon Container Style */}
          <View style={[styles.iconContainer, { 
              backgroundColor: 'transparent',
              borderColor: isHovered ? Tokens.colors.indigo.primary : Tokens.colors.neutral.border 
            }]}>
            <Icon 
              name={mode.icon} 
              size={ICON_SIZE} 
              color={isHovered ? Tokens.colors.indigo.primary : Tokens.colors.text.primary} 
            />
          </View>
          
          {/* Status Dot */}
          <View style={[styles.accentDot, { 
            backgroundColor: isHovered ? Tokens.colors.indigo.primary : Tokens.colors.neutral.borderSubtle
          }]} />
        </View>

        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, isHovered && { color: Tokens.colors.indigo.primary }]}>
            {mode.name.toUpperCase()}
          </Text>
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
    borderRadius: Tokens.radii.none, // Sharp
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    backgroundColor: Tokens.colors.neutral.darker,
    minHeight: CARD_MIN_HEIGHT,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Tokens.radii.none, // Sharp
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dotted', // Dot matrix feel
  },
  accentDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: 0, // Square dot
  },
  cardContent: {
    marginTop: Tokens.spacing[3],
  },
  cardTitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
    letterSpacing: 1,
  },
  cardDesc: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.secondary,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
});
