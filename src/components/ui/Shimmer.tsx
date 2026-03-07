import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ViewStyle,
  DimensionValue,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface ShimmerProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export const Shimmer: React.FC<ShimmerProps> = ({
  children,
  width = '100%',
  height = 20,
  style,
}) => {
  const { isCosmic } = useTheme();
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width: width as DimensionValue,
          height,
          backgroundColor: isCosmic
            ? 'rgba(139, 92, 246, 0.1)'
            : 'rgba(0, 0, 0, 0.05)',
        } as ViewStyle,
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
            backgroundColor: isCosmic
              ? 'rgba(139, 92, 246, 0.3)'
              : 'rgba(255, 255, 255, 0.5)',
          },
        ]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 4,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
  },
});

export default Shimmer;
