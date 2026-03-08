import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { isWeb } from '../../utils/PlatformUtils';

export const AnchorHeader: React.FC = () => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);

  return (
    <View style={styles.header}>
      <Text style={styles.title}>ANCHOR</Text>
      <Text style={styles.subtitle}>
        BREATHING EXERCISES FOR CALM AND FOCUS.
      </Text>
    </View>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    header: {
      width: '100%',
      marginBottom: Tokens.spacing[10],
      alignItems: 'center',
    },
    title: {
      fontFamily: isCosmic ? 'Space Grotesk' : Tokens.type.fontFamily.sans,
      fontSize: Tokens.type['4xl'],
      fontWeight: '800',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      marginBottom: Tokens.spacing[2],
      letterSpacing: 2,
      textAlign: 'center',
      ...(isCosmic && isWeb
        ? {
            textShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          }
        : {}),
    },
    subtitle: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.base,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      textAlign: 'center',
      maxWidth: 400,
      lineHeight: Tokens.type.base * 1.5,
      letterSpacing: 1,
    },
  });
