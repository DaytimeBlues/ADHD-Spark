import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import type { ThemeTokens } from '../../theme/types';
import { isWeb } from '../../utils/PlatformUtils';

export const AnchorHeader: React.FC = () => {
  const { isCosmic, isNightAwe, t } = useTheme();
  const styles = getStyles(isCosmic, isNightAwe, t);

  return (
    <View style={styles.header}>
      <Text style={styles.title}>ANCHOR</Text>
      <Text style={styles.subtitle}>
        BREATHING EXERCISES FOR CALM AND FOCUS.
      </Text>
    </View>
  );
};

const getStyles = (isCosmic: boolean, isNightAwe: boolean, t: ThemeTokens) => {
  const type = t.type ?? Tokens.type;
  const fontFamily = type.fontFamily ?? Tokens.type.fontFamily;
  const textColors = t.colors.text ?? Tokens.colors.text;

  return StyleSheet.create({
    header: {
      width: '100%',
      marginBottom: t.spacing[10],
      alignItems: 'center',
    },
    title: {
      fontFamily: isCosmic || isNightAwe ? 'Space Grotesk' : fontFamily.sans,
      fontSize: Tokens.type['4xl'],
      fontWeight: '800',
      color: isNightAwe
        ? textColors.primary || '#F6F1E7'
        : isCosmic
          ? '#EEF2FF'
          : textColors.primary,
      marginBottom: t.spacing[2],
      letterSpacing: 2,
      textAlign: 'center',
      ...((isCosmic || isNightAwe) && isWeb
        ? {
            textShadow: isNightAwe
              ? '0 0 16px rgba(175, 199, 255, 0.24)'
              : '0 0 20px rgba(139, 92, 246, 0.3)',
          }
        : {}),
    },
    subtitle: {
      fontFamily: fontFamily.sans,
      fontSize: type.base ?? Tokens.type.base,
      color: isNightAwe
        ? textColors.secondary || '#C9D5E8'
        : isCosmic
          ? '#B9C2D9'
          : textColors.secondary,
      textAlign: 'center',
      maxWidth: 400,
      lineHeight: (type.base ?? Tokens.type.base) * 1.5,
      letterSpacing: 1,
    },
  });
};
