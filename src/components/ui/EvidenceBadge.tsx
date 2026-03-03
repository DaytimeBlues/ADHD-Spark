import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Tokens } from '../../theme/tokens';

export type EvidenceTier = 'rct' | 'clinical' | 'heuristic';

interface EvidenceBadgeProps {
  tier: EvidenceTier;
  label?: string;
  style?: ViewStyle;
}

const TIER_LABELS: Record<EvidenceTier, string> = {
  rct: 'RCT EVIDENCE',
  clinical: 'CLINICAL BEST PRACTICE',
  heuristic: 'EXPERT CONSENSUS',
};

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  tier,
  label,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>
        ({(label || TIER_LABELS[tier]).toUpperCase()})
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xxs,
    color: Tokens.colors.text.tertiary,
    letterSpacing: 0.5,
  },
});
