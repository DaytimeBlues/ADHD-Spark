import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearButton } from '../components/ui/LinearButton';
import { LinearCard } from '../components/ui/LinearCard';
import { Tokens } from '../theme/tokens';

const CrisisScreen = () => {
  const crisisLines = [
    { name: 'National Suicide Prevention Lifeline', number: '988', url: 'tel:988' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741', url: 'sms:741741' },
    { name: 'SAMHSA National Helpline', number: '1-800-662-4357', url: 'tel:18006624357' },
  ];

  const copingStrategies = [
    { emoji: '🌊', title: 'Ride the Wave', desc: 'Emotions pass like waves. This too shall pass.' },
    { emoji: '👁️', title: '5-4-3-2-1 Grounding', desc: 'Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste.' },
    { emoji: '💨', title: 'Box Breathing', desc: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat.' },
    { emoji: '📱', title: 'Reach Out', desc: 'Call or text someone you trust. You don\'t have to be alone.' },
  ];

  const handleCall = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.webWrapper}>
          <Text style={styles.title}>Crisis Mode</Text>
          <Text style={styles.subtitle}>You're not alone. Help is available.</Text>

          <Text style={styles.sectionTitle}>Immediate Help</Text>
          {crisisLines.map(line => (
            <LinearButton
              key={line.name}
              title={line.name}
              onPress={() => handleCall(line.url)}
              variant="error"
              size="lg"
              style={styles.crisisButton}
              textStyle={styles.crisisBtnText}
            />
          ))}

          <Text style={[styles.sectionTitle, styles.strategiesHeader]}>Coping Strategies</Text>
          {copingStrategies.map(strategy => (
            <LinearCard
              key={strategy.title}
              style={styles.strategyCard}
            >
              <View style={styles.strategyInner}>
                <Text style={styles.strategyEmoji}>{strategy.emoji}</Text>
                <View style={styles.strategyContent}>
                  <Text style={styles.strategyTitle}>{strategy.title}</Text>
                  <Text style={styles.strategyDesc}>{strategy.desc}</Text>
                </View>
              </View>
            </LinearCard>
          ))}

          <Text style={styles.reminder}>
            If you're in immediate danger, call 911 or go to your nearest emergency room.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Tokens.spacing[4],
  },
  webWrapper: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    color: Tokens.colors.error.main,
    marginBottom: Tokens.spacing[1],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    marginBottom: Tokens.spacing[8],
    lineHeight: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.base,
    fontWeight: '600',
    marginBottom: Tokens.spacing[4],
  },
  strategiesHeader: {
    marginTop: Tokens.spacing[8],
  },
  crisisButton: {
    marginBottom: Tokens.spacing[3],
    minHeight: 64,
  },
  crisisBtnText: {
    fontSize: Tokens.type.lg,
    fontWeight: '700',
  },
  strategyCard: {
    marginBottom: Tokens.spacing[3],
    padding: 0, // Handled by inner
  },
  strategyInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Tokens.spacing[4],
  },
  strategyEmoji: {
    fontSize: 32,
    marginRight: Tokens.spacing[4],
  },
  strategyContent: {
    flex: 1,
  },
  strategyTitle: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.base,
    fontWeight: '600',
    marginBottom: Tokens.spacing[1],
  },
  strategyDesc: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.secondary,
    fontSize: Tokens.type.sm,
    lineHeight: 20,
  },
  reminder: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.xs,
    textAlign: 'center',
    marginTop: Tokens.spacing[8],
    marginBottom: Tokens.spacing[8],
    fontStyle: 'italic',
  },
});

export default CrisisScreen;
