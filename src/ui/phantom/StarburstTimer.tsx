import React, { memo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface StarburstTimerProps {
  timeStr: string;
  isActive?: boolean;
  label?: string;
  testID?: string;
}

export const StarburstTimer = memo(function StarburstTimer({
  timeStr,
  isActive = false,
  label = 'FOCUS NOW',
  testID,
}: StarburstTimerProps) {
  const { isPhantom, t } = useTheme();

  // Pulse animation would go here.
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isActive && isPhantom) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scale.setValue(1);
    }
  }, [isActive, isPhantom, scale]);

  if (!isPhantom) {
    return (
      <View style={styles.fallbackContainer} testID={testID}>
        <Text style={{ color: t.colors.brand[500], fontSize: 48 }}>{timeStr}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]} testID={testID}>
      <View style={styles.polygon}>
        <Text style={styles.digits} numberOfLines={1} adjustsFontSizeToFit>
          {timeStr}
        </Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  polygon: {
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#000000',
    padding: 24,
    transform: [{ rotate: '-3deg' }, { skewX: '-8deg' }],
    shadowColor: '#D80000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  digits: {
    fontFamily: 'Impact',
    fontSize: 72,
    color: '#000000',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  label: {
    fontFamily: 'Impact',
    fontSize: 24,
    color: '#D80000',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: -8,
  },
});

export default StarburstTimer;
