import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

interface AnimatedMicroStepProps {
  item: string;
  index: number;
  testID?: string;
}

export const AnimatedMicroStep: React.FC<AnimatedMicroStepProps> = ({
  item,
  index,
  testID,
}) => {
  const { isCosmic } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.duration(200).delay(index * 50)}
      layout={Layout.springify()}
      style={styles.container}
    >
      <Text testID={testID} style={styles.stepNumber}>
        {(index + 1).toString().padStart(2, '0')}
      </Text>
      <Text
        style={[
          styles.stepText,
          { color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary },
        ]}
      >
        {item}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  stepNumber: {
    color: Tokens.colors.text.tertiary,
    width: Tokens.spacing[6],
    fontSize: Tokens.type.xs,
    fontWeight: 'bold',
    marginRight: Tokens.spacing[2],
    fontFamily: Tokens.type.fontFamily.mono,
  },
  stepText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
  },
});

export default AnimatedMicroStep;
