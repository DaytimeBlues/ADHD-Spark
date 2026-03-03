import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { GlowCard } from '../../ui/cosmic';
import { BreathingPattern, PatternConfig } from '../../hooks/useAnchor';

interface AnchorPatternSelectorProps {
  patterns: Record<BreathingPattern, PatternConfig>;
  onSelectPattern: (pattern: BreathingPattern) => void;
}

export const AnchorPatternSelector: React.FC<AnchorPatternSelectorProps> = ({
  patterns,
  onSelectPattern,
}) => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);

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
    const steps = [
      { label: 'In', val: config.inhale },
      { label: 'Hold', val: config.hold },
      { label: 'Out', val: config.exhale },
      { label: 'Wait', val: config.wait },
    ]
      .filter((s) => s.val > 0)
      .map((s) => `${s.label} ${s.val}`)
      .join(' • ');
    return steps;
  };

  return (
    <View style={styles.patternsContainer}>
      {(Object.keys(patterns) as BreathingPattern[]).map((p) => (
        <GlowCard
          key={p}
          testID={`anchor-pattern-${p}`}
          glow="soft"
          tone="base"
          padding="lg"
          onPress={() => onSelectPattern(p)}
          style={styles.patternButton}
        >
          <View style={styles.patternIcon}>
            <Text style={styles.patternEmoji}>{getPatternEmoji(p)}</Text>
          </View>
          <View style={styles.patternInfo}>
            <Text style={styles.patternButtonText}>{patterns[p].name}</Text>
            <Text style={styles.patternDetails}>
              {formatPatternDetails(patterns[p])}
            </Text>
          </View>
        </GlowCard>
      ))}
    </View>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    patternsContainer: {
      width: '100%',
      gap: Tokens.spacing[4],
      maxWidth: 500,
    },
    patternButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    patternIcon: {
      width: Tokens.spacing[12],
      height: Tokens.spacing[12],
      borderRadius: isCosmic ? Tokens.radii.md : 0,
      backgroundColor: isCosmic
        ? 'rgba(11, 16, 34, 0.5)'
        : Tokens.colors.neutral.dark,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Tokens.spacing[4],
    },
    patternEmoji: {
      fontSize: Tokens.type['2xl'],
    },
    patternInfo: {
      flex: 1,
    },
    patternButtonText: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontSize: Tokens.type.lg,
      fontWeight: '600',
      marginBottom: 4,
      letterSpacing: 1,
    },
    patternDetails: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.tertiary,
      fontSize: Tokens.type.sm,
    },
  });

export default AnchorPatternSelector;
