import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearCard } from '../components/ui/LinearCard';
import { Tokens } from '../theme/tokens';

const CheckInScreen = () => {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);

  const moods = [
    { emoji: '😢', label: 'Low', value: 1 },
    { emoji: '😕', label: 'Down', value: 2 },
    { emoji: '😐', label: 'Neutral', value: 3 },
    { emoji: '🙂', label: 'Good', value: 4 },
    { emoji: '😊', label: 'Great', value: 5 },
  ];

  const energyLevels = [
    { emoji: '🔋', label: 'Drained', value: 1 },
    { emoji: '🔋', label: 'Low', value: 2 },
    { emoji: '🔋', label: 'Medium', value: 3 },
    { emoji: '🔋', label: 'High', value: 4 },
    { emoji: '🔋', label: 'Full', value: 5 },
  ];

  const getRecommendation = () => {
    if (mood === null || energy === null) return null;
    if (mood <= 2 && energy <= 2) {
      return { title: '🌱 Gentle Start', desc: 'Try the Anchor breathing exercise to ground yourself.' };
    }
    if (mood >= 4 && energy >= 4) {
      return { title: '🚀 Ride the Wave', desc: 'Perfect time for a Ignite focus session!' };
    }
    if (energy <= 2) {
      return { title: '💪 Micro Task', desc: 'Try Fog Cutter with just one micro-step.' };
    }
    return { title: '📝 Brain Dump', desc: 'Clear your mind before starting.' };
  };

  const recommendation = getRecommendation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Check In</Text>
          <Text style={styles.subtitle}>How are you feeling?</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mood</Text>
            <View style={styles.options}>
              {moods.map(m => (
                <TouchableOpacity
                  key={m.value}
                  activeOpacity={0.7}
                  style={[styles.option, mood === m.value && styles.selected]}
                  onPress={() => setMood(m.value)}>
                  <Text style={styles.emoji}>{m.emoji}</Text>
                  <Text style={styles.label}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Energy</Text>
            <View style={styles.options}>
              {energyLevels.map(e => (
                <TouchableOpacity
                  key={e.value}
                  activeOpacity={0.7}
                  style={[styles.option, energy === e.value && styles.selected]}
                  onPress={() => setEnergy(e.value)}>
                  <Text style={styles.emoji}>{e.emoji}</Text>
                  <Text style={styles.label}>{e.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {recommendation && (
            <LinearCard
              title={recommendation.title}
              subtitle="Recommendation"
              style={styles.recommendation}
            >
              <Text style={styles.recommendationText}>{recommendation.desc}</Text>
            </LinearCard>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  webContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    padding: Tokens.spacing[4],
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 32,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[1],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    marginBottom: Tokens.spacing[12],
  },
  section: {
    marginBottom: Tokens.spacing[8],
  },
  sectionTitle: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.base,
    fontWeight: '600',
    marginBottom: Tokens.spacing[4],
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Tokens.spacing[2],
  },
  option: {
    alignItems: 'center',
    padding: Tokens.spacing[3],
    borderRadius: Tokens.radii.md,
    backgroundColor: Tokens.colors.neutral.darker,
    width: '18%',
    minHeight: 80,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    justifyContent: 'center',
  },
  selected: {
    borderColor: Tokens.colors.indigo.primary,
    backgroundColor: Tokens.colors.neutral.dark,
  },
  emoji: {
    fontSize: 24,
    marginBottom: Tokens.spacing[2],
  },
  label: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.secondary,
    fontSize: Tokens.type.xxs,
    textAlign: 'center',
    fontWeight: '500',
  },
  recommendation: {
    marginTop: Tokens.spacing[4],
  },
  recommendationText: {
    fontFamily: 'Inter',
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.base,
    lineHeight: 24,
  },
});

export default CheckInScreen;
