import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Tokens } from '../theme/tokens';

const CheckInScreen = () => {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);

  const moods = [
    {emoji: '😢', label: 'Low', value: 1},
    {emoji: '😕', label: 'Down', value: 2},
    {emoji: '😐', label: 'Neutral', value: 3},
    {emoji: '🙂', label: 'Good', value: 4},
    {emoji: '😊', label: 'Great', value: 5},
  ];

  const energyLevels = [
    {emoji: '🔋', label: 'Drained', value: 1},
    {emoji: '🔋', label: 'Low', value: 2},
    {emoji: '🔋', label: 'Medium', value: 3},
    {emoji: '🔋', label: 'High', value: 4},
    {emoji: '🔋', label: 'Full', value: 5},
  ];

  const getRecommendation = () => {
    if (mood === null || energy === null) return null;
    if (mood <= 2 && energy <= 2) {
      return {title: '🌱 Gentle Start', desc: 'Try the Anchor breathing exercise to ground yourself.'};
    }
    if (mood >= 4 && energy >= 4) {
      return {title: '🚀 Ride the Wave', desc: 'Perfect time for a Ignite focus session!'};
    }
    if (energy <= 2) {
      return {title: '💪 Micro Task', desc: 'Try Fog Cutter with just one micro-step.'};
    }
    return {title: '📝 Brain Dump', desc: 'Clear your mind before starting.'};
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
                  style={[styles.option, energy === e.value && styles.selected]}
                  onPress={() => setEnergy(e.value)}>
                  <Text style={styles.emoji}>{e.emoji}</Text>
                  <Text style={styles.label}>{e.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {recommendation && (
            <View style={styles.recommendation}>
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              <Text style={styles.recommendationText}>{recommendation.desc}</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral[900],
  },
  webContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.content,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    padding: Tokens.spacing[16],
  },
  title: {
    fontSize: Tokens.type['3xl'],
    fontWeight: 'bold',
    color: Tokens.colors.neutral[0],
    marginBottom: Tokens.spacing[4],
  },
  subtitle: {
    fontSize: Tokens.type.base,
    color: Tokens.colors.neutral[200],
    marginBottom: Tokens.spacing[32],
  },
  section: {
    marginBottom: Tokens.spacing[24],
  },
  sectionTitle: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.lg,
    fontWeight: '600',
    marginBottom: Tokens.spacing[12],
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    alignItems: 'center',
    padding: Tokens.spacing[12],
    borderRadius: Tokens.radii.md,
    backgroundColor: Tokens.colors.neutral[600],
    width: '18%',
    minHeight: Tokens.layout.minTapTarget,
  },
  selected: {
    backgroundColor: Tokens.colors.brand[600],
  },
  emoji: {
    fontSize: Tokens.type['2xl'],
    marginBottom: Tokens.spacing[4],
  },
  label: {
    color: Tokens.colors.neutral[200],
    fontSize: Tokens.type.xs,
  },
  recommendation: {
    backgroundColor: Tokens.colors.neutral[600],
    borderRadius: Tokens.radii.lg,
    padding: Tokens.spacing[24], // 20 -> 24 (closest token)
    marginTop: Tokens.spacing[16],
  },
  recommendationTitle: {
    color: Tokens.colors.brand[600],
    fontSize: Tokens.type.xl,
    fontWeight: '600',
    marginBottom: Tokens.spacing[8],
  },
  recommendationText: {
    color: Tokens.colors.neutral[0],
    fontSize: Tokens.type.base,
  },
});

export default CheckInScreen;
