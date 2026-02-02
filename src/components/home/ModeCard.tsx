import React, {useState} from 'react';
import {Animated, Platform, Pressable, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {Tokens} from '../../theme/tokens';

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
};

const CARD_MIN_HEIGHT = Tokens.spacing[96] + Tokens.spacing[64];
const DOT_SIZE = Tokens.spacing[8];
const ICON_SIZE = Tokens.type['4xl'];

export default function ModeCard({mode, onPress, style, animatedStyle}: ModeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const hoverStyle =
    Platform.OS === 'web' && isHovered
      ? {
          transform: [{scale: 1.02}],
          shadowOpacity: 0.3,
        }
      : {};

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={({pressed}) => [
          styles.card,
          {
            borderColor: mode.accent,
            backgroundColor: Tokens.colors.neutral[800],
          },
          Platform.OS === 'web' && {cursor: 'pointer'},
          pressed && {transform: [{scale: 0.98}]},
          hoverStyle,
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{mode.icon}</Text>
          <View style={[styles.accentDot, {backgroundColor: mode.accent}]} />
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
    padding: Tokens.spacing[24],
    borderRadius: Tokens.radii.xl,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral[700],
    minHeight: CARD_MIN_HEIGHT,
    justifyContent: 'space-between',
    ...Tokens.elevation.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardIcon: {
    fontSize: ICON_SIZE,
  },
  accentDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: Tokens.radii.pill,
  },
  cardContent: {
    marginTop: Tokens.spacing[16],
  },
  cardTitle: {
    fontSize: Tokens.type.xl,
    fontWeight: '600',
    color: Tokens.colors.neutral[50],
    marginBottom: Tokens.spacing[4],
  },
  cardDesc: {
    fontSize: Tokens.type.sm,
    color: Tokens.colors.neutral[400],
    lineHeight: Tokens.type.xl,
  },
});
