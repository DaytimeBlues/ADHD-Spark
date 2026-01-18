import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

type BreathingPattern = '478' | 'box' | 'energize';

const AnchorScreen = () => {
  const [pattern, setPattern] = useState<BreathingPattern | null>(null);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'wait'>('inhale');
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const patterns: Record<BreathingPattern, {name: string; inhale: number; hold: number; exhale: number; wait: number}> = {
    '478': {name: '4-7-8 Relax', inhale: 4, hold: 7, exhale: 8, wait: 0},
    'box': {name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, wait: 4},
    'energize': {name: 'Energize', inhale: 6, hold: 0, exhale: 2, wait: 0},
  };

  useEffect(() => {
    if (isActive && pattern) {
      const p = patterns[pattern];
      intervalRef.current = setInterval(() => {
        setCount(prev => {
          if (prev <= 1) {
            const phases: Record<string, string> = {
              inhale: p.hold > 0 ? 'hold' : 'exhale',
              hold: 'exhale',
              exhale: p.wait > 0 ? 'wait' : 'inhale',
              wait: 'inhale',
            };
            setPhase(phases[phase] as any);
            return p[phases[phase] as keyof typeof p] || p.inhale;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, pattern, phase]);

  const startPattern = (selectedPattern: BreathingPattern) => {
    setPattern(selectedPattern);
    setPhase('inhale');
    setCount(patterns[selectedPattern].inhale);
    setIsActive(true);
  };

  const stopPattern = () => {
    setIsActive(false);
    setPattern(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'wait': return 'Rest';
      default: return '';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale': return 1.5;
      case 'hold': return 1.5;
      case 'exhale': return 1;
      case 'wait': return 1;
      default: return 1;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Anchor</Text>
        <Text style={styles.subtitle}>Breathing exercises</Text>

        {pattern && (
          <View style={styles.activeContainer}>
            <Text style={styles.patternName}>{patterns[pattern].name}</Text>
            <View style={styles.breathingCircle}>
              <View
                style={[
                  styles.circle,
                  {transform: [{scale: getCircleScale()}]},
                ]}
              />
              <Text style={styles.phaseText}>{getPhaseText()}</Text>
              <Text style={styles.countText}>{count}</Text>
            </View>
            <TouchableOpacity style={styles.stopButton} onPress={stopPattern}>
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}

        {!pattern && (
          <View style={styles.patternsContainer}>
            {(Object.keys(patterns) as BreathingPattern[]).map(p => (
              <TouchableOpacity
                key={p}
                style={styles.patternButton}
                onPress={() => startPattern(p)}>
                <Text style={styles.patternButtonText}>
                  {patterns[p].name}
                </Text>
                <Text style={styles.patternDetails}>
                  {patterns[p].inhale}-{patterns[p].hold > 0 ? patterns[p].hold + '-' : ''}{patterns[p].exhale}
                  {patterns[p].wait > 0 ? '-' + patterns[p].wait : ''}
                </Text>
              </TouchableOpacity>
            ))}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    position: 'absolute',
    top: 60,
    left: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    position: 'absolute',
    top: 92,
    left: 16,
  },
  activeContainer: {
    alignItems: 'center',
  },
  patternName: {
    color: '#6200EA',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 48,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6200EA',
    position: 'absolute',
  },
  phaseText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    zIndex: 1,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    zIndex: 1,
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  patternsContainer: {
    width: '100%',
  },
  patternButton: {
    backgroundColor: '#2D2D44',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  patternButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  patternDetails: {
    color: '#888',
    fontSize: 14,
  },
});

export default AnchorScreen;
