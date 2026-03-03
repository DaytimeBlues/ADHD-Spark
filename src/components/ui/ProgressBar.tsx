import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { CosmicTokens } from '../../theme/cosmicTokens';

interface ProgressBarProps {
  current: number;
  total: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'success' | 'brand';
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  size = 'md',
  color = 'default',
  style,
}) => {
  const { isCosmic, t } = useTheme();
  const progress = total > 0 ? current / total : 0;
  const percentage = Math.round(progress * 100);

  const getHeight = () => {
    switch (size) {
      case 'sm':
        return 4;
      case 'lg':
        return 12;
      default:
        return 8;
    }
  };

  const getColor = () => {
    if (!isCosmic) {
      switch (color) {
        case 'success':
          return CosmicTokens.colors.semantic.success;
        case 'brand':
          return t.colors.brand[500];
        default:
          return t.colors.brand[500];
      }
    }

    switch (color) {
      case 'success':
        return CosmicTokens.colors.semantic.success; // auroraTeal
      case 'brand':
        return CosmicTokens.colors.semantic.primary; // nebulaViolet
      default:
        return CosmicTokens.colors.semantic.primary;
    }
  };

  const height = getHeight();
  const barColor = getColor();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.background,
          {
            height,
            backgroundColor: isCosmic
              ? 'rgba(185, 194, 217, 0.2)'
              : t.colors.neutral.dark,
            borderRadius: height / 2,
          },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              height,
              backgroundColor: barColor,
              borderRadius: height / 2,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  background: {
    overflow: 'hidden',
  },
  fill: {
    // Fill animates via width change
  },
});

export default ProgressBar;
