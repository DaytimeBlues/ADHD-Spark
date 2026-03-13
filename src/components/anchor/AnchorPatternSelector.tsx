import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BreathingPattern, PatternConfig } from '../../hooks/useAnchorSession';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import type { ThemeTokens } from '../../theme/types';
import { GlowCard } from '../../ui/cosmic';

interface AnchorPatternSelectorProps {
  patterns: Record<BreathingPattern, PatternConfig>;
  onSelectPattern: (pattern: BreathingPattern) => void;
}

const getPatternEmoji = (pattern: BreathingPattern) => {
  switch (pattern) {
    case '478':
      return '🌙';
    case 'box':
      return '📦';
    case 'energize':
      return '⚡';
    default:
      return '';
  }
};

const formatPatternDetails = (config: PatternConfig) => {
  return [
    { label: 'In', val: config.inhale },
    { label: 'Hold', val: config.hold },
    { label: 'Out', val: config.exhale },
    { label: 'Wait', val: config.wait },
  ]
    .filter((step) => step.val > 0)
    .map((step) => `${step.label} ${step.val}`)
    .join(' | ');
};

export const AnchorPatternSelector: React.FC<AnchorPatternSelectorProps> = ({
  patterns,
  onSelectPattern,
}) => {
  const { isCosmic, isNightAwe, t } = useTheme();
  const styles = getStyles(isCosmic, isNightAwe, t);

  return (
    <View style={styles.patternsContainer}>
      {(Object.keys(patterns) as BreathingPattern[]).map((pattern) => (
        <GlowCard
          key={pattern}
          testID={`anchor-pattern-${pattern}`}
          accessibilityLabel={`${patterns[pattern].name} breathing pattern`}
          accessibilityHint={`Double tap to select ${patterns[pattern].name} breathing exercise`}
          accessibilityRole="button"
          glow={isNightAwe ? 'none' : 'soft'}
          tone="base"
          padding="lg"
          onPress={() => onSelectPattern(pattern)}
          style={styles.patternButton}
        >
          <View style={styles.patternIcon}>
            <Text
              style={styles.patternEmoji}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              {getPatternEmoji(pattern)}
            </Text>
          </View>
          <View style={styles.patternInfo}>
            <Text style={styles.patternButtonText}>
              {patterns[pattern].name}
            </Text>
            <Text style={styles.patternDetails}>
              {formatPatternDetails(patterns[pattern])}
            </Text>
          </View>
        </GlowCard>
      ))}
    </View>
  );
};

const getStyles = (isCosmic: boolean, isNightAwe: boolean, t: ThemeTokens) => {
  const type = t.type ?? Tokens.type;
  const fontFamily = type.fontFamily ?? Tokens.type.fontFamily;
  const textColors = t.colors.text ?? Tokens.colors.text;

  return StyleSheet.create({
    patternsContainer: {
      width: '100%',
      gap: t.spacing[4],
      maxWidth: 500,
    },
    patternButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isNightAwe ? '#16283F' : undefined,
      borderColor: isNightAwe ? 'rgba(175, 199, 255, 0.16)' : undefined,
      borderWidth: isNightAwe ? 1 : 0,
      borderRadius: isNightAwe ? 16 : undefined,
    },
    patternIcon: {
      width: t.spacing[12],
      height: t.spacing[12],
      borderRadius: isCosmic || isNightAwe ? t.radii.md : 0,
      backgroundColor: isCosmic
        ? 'rgba(11, 16, 34, 0.5)'
        : isNightAwe
          ? 'rgba(175, 199, 255, 0.12)'
          : t.colors.neutral.dark,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: t.spacing[4],
    },
    patternEmoji: {
      fontSize: Tokens.type['2xl'],
    },
    patternInfo: {
      flex: 1,
    },
    patternButtonText: {
      fontFamily: fontFamily.sans,
      color: isNightAwe
        ? textColors.primary || '#F6F1E7'
        : isCosmic
          ? '#EEF2FF'
          : textColors.primary,
      fontSize: type.lg ?? Tokens.type.lg,
      fontWeight: '600',
      marginBottom: 4,
      letterSpacing: 1,
    },
    patternDetails: {
      fontFamily: fontFamily.sans,
      color: isNightAwe
        ? textColors.secondary || '#C9D5E8'
        : isCosmic
          ? '#B9C2D9'
          : textColors.tertiary,
      fontSize: type.sm ?? Tokens.type.sm,
    },
  });
};
