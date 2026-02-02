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
import { Tokens } from '../theme/tokens';

const CrisisScreen = () => {
  const crisisLines = [
    {name: 'National Suicide Prevention Lifeline', number: '988', url: 'tel:988'},
    {name: 'Crisis Text Line', number: 'Text HOME to 741741', url: 'sms:741741'},
    {name: 'SAMHSA National Helpline', number: '1-800-662-4357', url: 'tel:18006624357'},
  ];

  const copingStrategies = [
    {emoji: '🌊', title: 'Ride the Wave', desc: 'Emotions pass like waves. This too shall pass.'},
    {emoji: '👁️', title: '5-4-3-2-1 Grounding', desc: 'Name 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste.'},
    {emoji: '💨', title: 'Box Breathing', desc: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat.'},
    {emoji: '📱', title: 'Reach Out', desc: 'Call or text someone you trust. You don\'t have to be alone.'},
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
            <TouchableOpacity
              key={line.name}
              style={styles.crisisButton}
              activeOpacity={0.8}
              onPress={() => handleCall(line.url)}>
              <Text style={styles.crisisButtonText}>{line.name}</Text>
              <Text style={styles.crisisButtonSubtext}>{line.number}</Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.sectionTitle, styles.strategiesHeader]}>Coping Strategies</Text>
          {copingStrategies.map(strategy => (
            <View key={strategy.title} style={styles.strategyCard}>
              <Text style={styles.strategyEmoji}>{strategy.emoji}</Text>
              <View style={styles.strategyContent}>
                <Text style={styles.strategyTitle}>{strategy.title}</Text>
                <Text style={styles.strategyDesc}>{strategy.desc}</Text>
              </View>
            </View>
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
    backgroundColor: Tokens.colors.neutral[800],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Tokens.spacing[16],
  },
  webWrapper: {
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
    alignSelf: 'center',
  },
  title: {
    fontSize: Tokens.type['3xl'],
    fontWeight: 'bold',
    color: Tokens.colors.danger[200],
    marginBottom: Tokens.spacing[4],
  },
  subtitle: {
    fontSize: Tokens.type.base,
    color: Tokens.colors.neutral[200],
    marginBottom: Tokens.spacing[24],
    lineHeight: Tokens.type.base * 1.5,
  },
  sectionTitle: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.lg,
    fontWeight: '600',
    marginBottom: Tokens.spacing[12],
  },
  strategiesHeader: {
    marginTop: Tokens.spacing[24],
  },
  crisisButton: {
    backgroundColor: Tokens.colors.danger[500],
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing[24],
    marginBottom: Tokens.spacing[12],
    minHeight: Tokens.layout.minTapTargetComfortable,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      },
    }),
  },
  crisisButtonText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.lg,
    fontWeight: '600',
    marginBottom: Tokens.spacing[4],
  },
  crisisButtonSubtext: {
    color: Tokens.colors.neutral[50],
    fontSize: Tokens.type.base,
    opacity: 0.9,
  },
  strategyCard: {
    backgroundColor: Tokens.colors.neutral[600],
    borderRadius: Tokens.radii.md,
    padding: Tokens.spacing[16],
    marginBottom: Tokens.spacing[12],
    flexDirection: 'row',
    alignItems: 'center', // Aligned center for better visual balance
  },
  strategyEmoji: {
    fontSize: Tokens.type['3xl'],
    marginRight: Tokens.spacing[16],
  },
  strategyContent: {
    flex: 1,
  },
  strategyTitle: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.base,
    fontWeight: '600',
    marginBottom: Tokens.spacing[4],
  },
  strategyDesc: {
    color: Tokens.colors.neutral[200],
    fontSize: Tokens.type.sm,
    lineHeight: Tokens.type.sm * 1.4,
  },
  reminder: {
    color: Tokens.colors.neutral[300],
    fontSize: Tokens.type.sm,
    textAlign: 'center',
    marginTop: Tokens.spacing[24],
    marginBottom: Tokens.spacing[24],
    fontStyle: 'italic',
    paddingHorizontal: Tokens.spacing[16],
  },
});

export default CrisisScreen;
