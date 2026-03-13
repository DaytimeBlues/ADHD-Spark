import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import type { ThemeTokens } from '../../theme/types';
import { GlowCard } from '../../ui/cosmic';

export const AnchorRationale: React.FC = () => {
  const { isCosmic, isNightAwe, t } = useTheme();
  const styles = getStyles(isCosmic, isNightAwe, t);

  return (
    <GlowCard
      glow={isNightAwe ? 'none' : 'soft'}
      tone="base"
      padding="md"
      style={styles.rationaleCard}
    >
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

const getStyles = (isCosmic: boolean, isNightAwe: boolean, t: ThemeTokens) => {
  const type = t.type ?? Tokens.type;
  const fontFamily = type.fontFamily ?? Tokens.type.fontFamily;
  const textColors = t.colors.text ?? Tokens.colors.text;

  return StyleSheet.create({
    rationaleCard: {
      marginBottom: t.spacing[6],
      width: '100%',
      backgroundColor: isNightAwe ? '#16283F' : undefined,
      borderColor: isNightAwe ? 'rgba(175, 199, 255, 0.16)' : undefined,
      borderWidth: isNightAwe ? 1 : 0,
      borderRadius: isNightAwe ? 16 : undefined,
    },
    rationaleTitle: {
      fontFamily: fontFamily.mono,
      fontSize: type.xs ?? Tokens.type.xs,
      fontWeight: '700',
      color: isNightAwe
        ? t.colors.nightAwe?.feature?.anchor || '#AFC7FF'
        : isCosmic
          ? '#8B5CF6'
          : t.colors.brand[500],
      letterSpacing: 1,
      marginBottom: t.spacing[2],
      textTransform: 'uppercase',
    },
    rationaleText: {
      fontFamily: fontFamily.body,
      fontSize: type.sm ?? Tokens.type.sm,
      color: isNightAwe
        ? textColors.secondary || '#C9D5E8'
        : isCosmic
          ? '#B9C2D9'
          : textColors.secondary,
      lineHeight: 22,
      flexWrap: 'wrap',
    },
  });
};
