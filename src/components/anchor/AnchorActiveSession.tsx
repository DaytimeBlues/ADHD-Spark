import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { ChronoDigits, HaloRing, RuneButton } from '../../ui/cosmic';
import { LinearButton } from '../ui/LinearButton';
import { PatternConfig } from '../../hooks/useAnchorSession';
import type { ThemeTokens } from '../../theme/types';
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
  const { isCosmic, isNightAwe, t } = useTheme();
  const styles = getStyles(isCosmic, isNightAwe, t);

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

const getStyles = (isCosmic: boolean, isNightAwe: boolean, t: ThemeTokens) => {
  const type = t.type ?? Tokens.type;
  const fontFamily = type.fontFamily ?? Tokens.type.fontFamily;
  const textColors = t.colors.text ?? Tokens.colors.text;

  return StyleSheet.create({
    activeContainer: {
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      flex: 1,
      paddingVertical: t.spacing[8],
    },
    activeHeader: {
      alignItems: 'center',
      width: '100%',
    },
    patternName: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isNightAwe
        ? t.colors.nightAwe?.feature?.anchor || '#AFC7FF'
        : isCosmic
          ? '#8B5CF6'
          : t.colors.brand[400],
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
      marginVertical: t.spacing[8],
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
      borderRadius: t.radii.full,
      backgroundColor: isNightAwe ? '#AFC7FF' : t.colors.brand[600],
      position: 'absolute',
      opacity: 0.3,
      ...Platform.select({
        web: isWeb ? { transition: 'transform 1s ease-in-out' } : undefined,
      }),
    },
    phaseText: {
      fontFamily: fontFamily.sans,
      color: isNightAwe
        ? textColors.primary || '#F6F1E7'
        : isCosmic
          ? '#EEF2FF'
          : textColors.primary,
      fontSize: Tokens.type['2xl'],
      fontWeight: '700',
      zIndex: 1,
      marginBottom: t.spacing[2],
      letterSpacing: 1,
    },
    countText: {
      fontFamily: fontFamily.mono,
      color: isNightAwe
        ? textColors.secondary || '#C9D5E8'
        : textColors.tertiary,
      fontSize: Tokens.type['5xl'],
      fontWeight: '800',
      zIndex: 1,
    },
    stopButton: {
      minWidth: 200,
    },
  });
};
