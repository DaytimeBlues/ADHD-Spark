import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { GlowCard } from '../../ui/cosmic';

export const AnchorRationale: React.FC = () => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);

  return (
    <GlowCard glow="soft" tone="base" padding="md" style={styles.rationaleCard}>
      <Text style={styles.rationaleTitle}>WHY THIS WORKS</Text>
      <Text style={styles.rationaleText}>
        Emotional dysregulation is core to ADHD. These breathing patterns
        activate the parasympathetic nervous system, reducing cortisol and
        creating a pause between stimulus and response. CBT techniques for
        emotional regulation, made tangible through guided breath.
      </Text>
    </GlowCard>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    rationaleCard: {
      marginBottom: Tokens.spacing[6],
      width: '100%',
    },
    rationaleTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      letterSpacing: 1,
      marginBottom: Tokens.spacing[2],
      textTransform: 'uppercase',
    },
    rationaleText: {
      fontFamily: Tokens.type.fontFamily.body,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      lineHeight: 22,
      flexWrap: 'wrap',
    },
  });
