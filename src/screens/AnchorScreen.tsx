import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { AnchorActiveSession } from '../components/anchor/AnchorActiveSession';
import { AnchorHeader } from '../components/anchor/AnchorHeader';
import { AnchorPatternSelector } from '../components/anchor/AnchorPatternSelector';
import { AnchorRationale } from '../components/anchor/AnchorRationale';
import { PATTERNS, useAnchorSession } from '../hooks/useAnchorSession';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import type { ThemeTokens } from '../theme/types';
import { CosmicBackground } from '../ui/cosmic';
import { NightAweBackground } from '../ui/nightAwe';

const AnchorScreen = () => {
  const { isCosmic, isNightAwe, variant, t } = useTheme();
  const styles = getStyles(variant, t);
  const {
    pattern,
    count,
    isActive,
    startPattern,
    stopPattern,
    getPhaseText,
    getCircleScale,
  } = useAnchorSession();

  const content = (
    <SafeAreaView
      style={styles.container}
      accessibilityLabel="Anchor breathing screen"
      accessibilityRole="summary"
    >
      <View style={styles.scrollContent}>
        <View style={styles.content}>
          <AnchorHeader />
          <AnchorRationale />
          {isActive && pattern ? (
            <AnchorActiveSession
              patternConfig={PATTERNS[pattern]}
              phaseText={getPhaseText()}
              circleScale={getCircleScale()}
              count={count}
              onStop={stopPattern}
            />
          ) : (
            <AnchorPatternSelector
              patterns={PATTERNS}
              onSelectPattern={startPattern}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );

  if (isCosmic) {
    return (
      <CosmicBackground variant="moon" testID="anchor-cosmic-background">
        {content}
      </CosmicBackground>
    );
  }

  if (isNightAwe) {
    return (
      <NightAweBackground
        variant="focus"
        activeFeature="anchor"
        motionMode="idle"
      >
        {content}
      </NightAweBackground>
    );
  }

  return content;
};

const getStyles = (variant: 'linear' | 'cosmic' | 'nightAwe', t: ThemeTokens) =>
  StyleSheet.create({
    // ThemeTokens keeps layout optional for migration safety, so screens resolve to shared base values.
    container: {
      flex: 1,
      backgroundColor:
        variant === 'linear' ? Tokens.colors.neutral.darkest : 'transparent',
    },
    scrollContent: {
      flex: 1,
      alignItems: 'center',
    },
    content: {
      flex: 1,
      width: '100%',
      maxWidth:
        (t.layout?.maxWidth?.prose as number | undefined) ??
        Tokens.layout.maxWidth.prose,
      paddingHorizontal: t.spacing[6],
      paddingTop: t.spacing[12],
      paddingBottom: t.spacing[8],
      alignItems: 'center',
    },
  });

export default AnchorScreen;
