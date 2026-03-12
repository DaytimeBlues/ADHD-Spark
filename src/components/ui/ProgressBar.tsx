import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/useTheme';

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
  const { isCosmic, isNightAwe, t } = useTheme();
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
    switch (color) {
      case 'success':
        return t.colors.semantic.success;
      case 'brand':
        return t.colors.semantic.primary;
      default:
        return t.colors.semantic.primary;
    }
  };

  const height = getHeight();
  const barColor = getColor();
  const backgroundStyle: ViewStyle = {
    height,
    backgroundColor: isNightAwe
      ? t.colors.nightAwe?.surface?.border || 'rgba(217, 228, 242, 0.14)'
      : isCosmic
        ? 'rgba(185, 194, 217, 0.2)'
        : t.colors.neutral.dark,
    borderRadius: height / 2,
  };
  const fillStyle: ViewStyle = {
    width: `${percentage}%`,
    height,
    backgroundColor: barColor,
    borderRadius: height / 2,
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.background, backgroundStyle]}>
        <View style={[styles.fill, fillStyle]} />
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
