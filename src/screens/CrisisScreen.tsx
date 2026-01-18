import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from 'react-native';

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
      <View style={styles.content}>
        <Text style={styles.title}>Crisis Mode</Text>
        <Text style={styles.subtitle}>You\'re not alone. Help is available.</Text>

        <Text style={styles.sectionTitle}>Immediate Help</Text>
        {crisisLines.map(line => (
          <TouchableOpacity
            key={line.name}
            style={styles.crisisButton}
            onPress={() => handleCall(line.url)}>
            <Text style={styles.crisisButtonText}>{line.name}</Text>
            <Text style={styles.crisisButtonSubtext}>{line.number}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, {marginTop: 24}]}>Coping Strategies</Text>
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
          If you\'re in immediate danger, call 911 or go to your nearest emergency room.
        </Text>
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
    color: '#FF6B6B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  crisisButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  crisisButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  crisisButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  strategyCard: {
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  strategyEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  strategyContent: {
    flex: 1,
  },
  strategyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  strategyDesc: {
    color: '#888',
    fontSize: 14,
  },
  reminder: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
});

export default CrisisScreen;
