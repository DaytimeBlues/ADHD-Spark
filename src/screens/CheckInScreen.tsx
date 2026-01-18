import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#2D2D44',
    width: '18%',
  },
  selected: {
    backgroundColor: '#6200EA',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    color: '#888',
    fontSize: 10,
  },
  recommendation: {
    backgroundColor: '#2D2D44',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  recommendationTitle: {
    color: '#6200EA',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default CheckInScreen;
