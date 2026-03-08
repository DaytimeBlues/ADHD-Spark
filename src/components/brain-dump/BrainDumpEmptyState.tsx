import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';

interface BrainDumpEmptyStateProps {
  isVisible: boolean;
}

export const BrainDumpEmptyState: React.FC<BrainDumpEmptyStateProps> = ({
  isVisible,
}) => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);

  if (!isVisible) {
    return null;
  }

  return <Text style={[styles.title, styles.emptyState]}>_AWAITING_INPUT</Text>;
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    title: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontWeight: '700',
      letterSpacing: 2,
    },
    emptyState: {
      marginTop: Tokens.spacing[12],
      opacity: 0.3,
    },
  });
