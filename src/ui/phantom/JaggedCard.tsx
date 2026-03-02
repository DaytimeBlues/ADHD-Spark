import React, { memo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface JaggedCardProps {
  children: React.ReactNode;
  rotation?: string;
  skew?: string;
  variant?: 'black' | 'red' | 'white';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const JaggedCard = memo(function JaggedCard({
  children,
  rotation = '-2deg',
  skew = '-5deg',
  variant = 'black',
  style,
  testID,
}: JaggedCardProps) {
  const { isPhantom, t } = useTheme();

  if (!isPhantom) {
    return <View style={style}>{children}</View>;
  }

  const bgColor = variant === 'black' ? '#000000' : variant === 'red' ? '#D80000' : '#FFFFFF';
  const borderColor = variant === 'white' ? '#000000' : '#FFFFFF';

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View
        style={[
          styles.outerTransform,
          { transform: [{ rotate: rotation }, { skewX: skew }] },
        ]}
      >
        <View
          style={[
            styles.innerContent,
            { backgroundColor: bgColor, borderColor },
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  outerTransform: {
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  innerContent: {
    borderWidth: 3,
    padding: 16,
    borderRadius: 0,
    overflow: 'hidden',
  },
});

export default JaggedCard;
