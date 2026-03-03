import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

interface BrainDumpLoadingProps {
  isLoading: boolean;
}

export const BrainDumpLoading: React.FC<BrainDumpLoadingProps> = ({
  isLoading,
}) => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);

  if (!isLoading) {
    return null;
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color={Tokens.colors.brand[500]} />
      <Text style={styles.loadingText}>LOADING...</Text>
    </View>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    loadingContainer: {
      padding: Tokens.spacing[8],
      alignItems: 'center',
      gap: Tokens.spacing[4],
    },
    loadingText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
  });

export default BrainDumpLoading;
