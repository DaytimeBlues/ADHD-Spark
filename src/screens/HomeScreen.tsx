import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({navigation}: any) => {
  const [streak, setStreak] = useState(0);
  const [lastUse, setLastUse] = useState<string | null>(null);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const streakCount = await AsyncStorage.getItem('streakCount');
      const lastUseDate = await AsyncStorage.getItem('lastUseDate');
      setStreak(streakCount ? parseInt(streakCount, 10) : 0);
      setLastUse(lastUseDate);
    } catch (e) {
      console.log('Error loading streak:', e);
    }
  };

  const modes = [
    {id: 'ignite', name: 'Ignite', icon: '🔥', desc: '5-min focus timer'},
    {id: 'fogcutter', name: 'Fog Cutter', icon: '💨', desc: 'Break tasks down'},
    {id: 'pomodoro', name: 'Pomodoro', icon: '🍅', desc: 'Classic timer'},
    {id: 'anchor', name: 'Anchor', icon: '⚓', desc: 'Breathing exercises'},
    {id: 'checkin', name: 'Check In', icon: '📊', desc: 'Mood & energy'},
    {id: 'crisis', name: 'Crisis Mode', icon: '🆘', desc: 'Safety resources'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Spark</Text>
          <View style={styles.streakContainer}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>
              {streak} day{streak !== 1 ? 's' : ''} streak
            </Text>
          </View>
        </View>

        <View style={styles.modesGrid}>
          {modes.map(mode => (
            <TouchableOpacity
              key={mode.id}
              style={styles.modeCard}
              onPress={() => {
                if (mode.id === 'checkin') {
                  navigation.navigate('CheckIn');
                } else if (mode.id === 'crisis') {
                  navigation.navigate('Crisis');
                } else if (mode.id === 'fogcutter') {
                  navigation.navigate('FogCutter');
                } else if (mode.id === 'pomodoro') {
                  navigation.navigate('Pomodoro');
                } else if (mode.id === 'anchor') {
                  navigation.navigate('Anchor');
                } else {
                  navigation.navigate('Focus');
                }
              }}>
              <Text style={styles.modeIcon}>{mode.icon}</Text>
              <Text style={styles.modeName}>{mode.name}</Text>
              <Text style={styles.modeDesc}>{mode.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2D44',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  streakEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  streakText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modeCard: {
    width: '48%',
    backgroundColor: '#2D2D44',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  modeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  modeName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  modeDesc: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default HomeScreen;
