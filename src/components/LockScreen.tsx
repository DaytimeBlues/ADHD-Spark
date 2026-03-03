import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import { CosmicBackground } from '../ui/cosmic/CosmicBackground';
import { LinearButton } from './ui/LinearButton';
import { GlowCard } from '../ui/cosmic/GlowCard';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const { isCosmic } = useTheme();

  return (
    <View style={styles.container}>
      {isCosmic && (
        <CosmicBackground variant="nebula" dimmer>
          <View />
        </CosmicBackground>
      )}

      <View style={styles.content}>
        <Text style={styles.icon}>🔒</Text>
        <Text style={styles.title}>LOCKED</Text>

        <GlowCard padding="lg" glow="medium" style={styles.card}>
          <Text style={styles.message}>
            Spark is currently locked to protect your focus and data.
          </Text>

          <LinearButton title="AUTHENTICATE" onPress={onUnlock} size="lg" />
        </GlowCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Tokens.spacing[6],
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  icon: {
    fontSize: 48,
    marginBottom: Tokens.spacing[4],
  },
  title: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xl,
    color: Tokens.colors.text.primary,
    letterSpacing: 2,
    marginBottom: Tokens.spacing[8],
  },
  card: {
    width: '100%',
    alignItems: 'center',
  },
  message: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Tokens.spacing[8],
    lineHeight: 24,
  },
});
