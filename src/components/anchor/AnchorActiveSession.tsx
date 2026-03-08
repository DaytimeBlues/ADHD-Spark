import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { ChronoDigits, HaloRing, RuneButton } from '../../ui/cosmic';
import { LinearButton } from '../ui/LinearButton';
import { PatternConfig } from '../../hooks/useAnchorSession';
import { isWeb } from '../../utils/PlatformUtils';

interface AnchorActiveSessionProps {
  patternConfig: PatternConfig;
  phaseText: string;
  circleScale: number;
  count: number;
  onStop: () => void;
}

const BREATHING_CIRCLE_SIZE = 240;
const INNER_CIRCLE_SIZE = 140;

export const AnchorActiveSession: React.FC<AnchorActiveSessionProps> = ({
  patternConfig,
  phaseText,
  circleScale,
  count,
  onStop,
}) => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);

  return (
    <View style={styles.activeContainer}>
      <View style={styles.activeHeader}>
        <Text style={styles.patternName}>{patternConfig.name}</Text>
      </View>

      <View style={styles.breathingCircle}>
        {isCosmic ? (
          <HaloRing
            mode="breath"
            size={BREATHING_CIRCLE_SIZE}
            strokeWidth={6}
            glow="medium"
            testID="anchor-breathing-ring"
          />
        ) : (
          <View
            style={[styles.circle, { transform: [{ scale: circleScale }] }]}
          />
        )}
        <View style={styles.breathingOverlay}>
          <Text style={styles.phaseText}>{phaseText}</Text>
          {isCosmic ? (
            <ChronoDigits
              value={count.toString().padStart(2, '0')}
              size="hero"
              glow="medium"
              testID="anchor-count"
            />
          ) : (
            <Text testID="anchor-count" style={styles.countText}>
              {count}
            </Text>
          )}
        </View>
      </View>

      {isCosmic ? (
        <RuneButton
          onPress={onStop}
          variant="danger"
          size="lg"
          testID="anchor-stop-button"
        >
          Stop Session
        </RuneButton>
      ) : (
        <LinearButton
          title="Stop Session"
          onPress={onStop}
          variant="error"
          size="lg"
          style={styles.stopButton}
        />
      )}
    </View>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    activeContainer: {
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      flex: 1,
      paddingVertical: Tokens.spacing[8],
    },
    activeHeader: {
      alignItems: 'center',
      width: '100%',
    },
    patternName: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[400],
      fontSize: Tokens.type['2xl'],
      fontWeight: '600',
      letterSpacing: 1,
    },
    breathingCircle: {
      width: BREATHING_CIRCLE_SIZE,
      height: BREATHING_CIRCLE_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginVertical: Tokens.spacing[8],
    },
    breathingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle: {
      width: INNER_CIRCLE_SIZE,
      height: INNER_CIRCLE_SIZE,
      borderRadius: Tokens.radii.full,
      backgroundColor: Tokens.colors.brand[600],
      position: 'absolute',
      opacity: 0.3,
      ...Platform.select({
        web: isWeb ? { transition: 'transform 1s ease-in-out' } : undefined,
      }),
    },
    phaseText: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontSize: Tokens.type['2xl'],
      fontWeight: '700',
      zIndex: 1,
      marginBottom: Tokens.spacing[2],
      letterSpacing: 1,
    },
    countText: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: Tokens.colors.text.tertiary,
      fontSize: Tokens.type['5xl'],
      fontWeight: '800',
      zIndex: 1,
    },
    stopButton: {
      minWidth: 200,
    },
  });
