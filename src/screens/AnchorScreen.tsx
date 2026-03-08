import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { AnchorActiveSession } from '../components/anchor/AnchorActiveSession';
import { AnchorHeader } from '../components/anchor/AnchorHeader';
import { AnchorPatternSelector } from '../components/anchor/AnchorPatternSelector';
import { AnchorRationale } from '../components/anchor/AnchorRationale';
import { PATTERNS, useAnchorSession } from '../hooks/useAnchorSession';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import { CosmicBackground } from '../ui/cosmic';

const AnchorScreen = () => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);
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

  return content;
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isCosmic ? 'transparent' : Tokens.colors.neutral.darkest,
    },
    scrollContent: {
      flex: 1,
      alignItems: 'center',
    },
    content: {
      flex: 1,
      width: '100%',
      maxWidth: Tokens.layout.maxWidth.prose,
      paddingHorizontal: Tokens.spacing[6],
      paddingTop: Tokens.spacing[12],
      paddingBottom: Tokens.spacing[8],
      alignItems: 'center',
    },
  });

export default AnchorScreen;
