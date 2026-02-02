import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  Platform,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OverlayService from '../services/OverlayService';
import { Tokens } from '../theme/tokens';
import ModeCard, {type ModeCardMode} from '../components/home/ModeCard';

// -- Constants --
const ANIMATION_DURATION = 500;
const ANIMATION_STAGGER = 60;
const ENTRANCE_OFFSET_Y = Tokens.spacing[48];

// -- Types --
type Mode = {id: string} & ModeCardMode;

const HomeScreen = ({navigation}: any) => {
  const [streak, setStreak] = useState(0);
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(false);
  const { width } = useWindowDimensions();
  
  // Responsive layout logic
  const isWeb = Platform.OS === 'web';
  const numColumns = isWeb && width > 768 ? 3 : 2;
  const cardWidth = isWeb && width > 768 ? '31%' : '47%'; // spacing handled by flex/justify

  const modes = useMemo(
    () => [
      {id: 'ignite', name: 'Ignite', icon: '🔥', desc: '5-min focus timer', accent: Tokens.colors.brand[500]},
      {id: 'fogcutter', name: 'Fog Cutter', icon: '💨', desc: 'Break tasks down', accent: Tokens.colors.brand[400]},
      {id: 'pomodoro', name: 'Pomodoro', icon: '🍅', desc: 'Classic timer', accent: Tokens.colors.danger[500]},
      {id: 'anchor', name: 'Anchor', icon: '⚓', desc: 'Breathing exercises', accent: Tokens.colors.success[500]},
      {id: 'checkin', name: 'Check In', icon: '📊', desc: 'Mood & energy', accent: Tokens.colors.warning[500]},
      {id: 'crisis', name: 'Crisis Mode', icon: '🆘', desc: 'Safety resources', accent: Tokens.colors.danger[800]},
    ],
    [],
  );

  const fadeAnims = React.useRef(modes.map(() => new Animated.Value(0))).current;
  const slideAnims = React.useRef(modes.map(() => new Animated.Value(ENTRANCE_OFFSET_Y))).current;

  useEffect(() => {
    loadStreak();
    checkOverlayPermission();
    
    // Trigger entrance animation
    const animations = modes.map((_, i) => {
      return Animated.parallel([
        Animated.timing(fadeAnims[i], {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(slideAnims[i], {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)), // Slightly bouncier
        }),
      ]);
    });
    
    Animated.stagger(ANIMATION_STAGGER, animations).start();
  }, []);

  const checkOverlayPermission = async () => {
    if (Platform.OS === 'android') {
      const hasPermission = await OverlayService.canDrawOverlays();
      setIsOverlayEnabled(hasPermission);
    }
  };

  const toggleOverlay = async (value: boolean) => {
    if (Platform.OS !== 'android') return;

    if (value) {
      const hasPermission = await OverlayService.canDrawOverlays();
      if (hasPermission) {
        OverlayService.startOverlay();
        setIsOverlayEnabled(true);
      } else {
        const granted = await OverlayService.requestOverlayPermission();
        if (granted) {
          OverlayService.startOverlay();
          setIsOverlayEnabled(true);
        } else {
          setIsOverlayEnabled(false);
        }
      }
    } else {
      OverlayService.stopOverlay();
      setIsOverlayEnabled(false);
    }
  };

  const loadStreak = async () => {
    try {
      const streakCount = await AsyncStorage.getItem('streakCount');
      setStreak(streakCount ? parseInt(streakCount, 10) : 0);
    } catch (e) {
      console.log('Error loading streak:', e);
    }
  };

  const handlePress = (modeId: string) => {
    if (modeId === 'checkin') navigation.navigate('CheckIn');
    else if (modeId === 'crisis') navigation.navigate('Crisis');
    else if (modeId === 'fogcutter') navigation.navigate('FogCutter');
    else if (modeId === 'pomodoro') navigation.navigate('Pomodoro');
    else if (modeId === 'anchor') navigation.navigate('Anchor');
    else navigation.navigate('Focus'); // ignite -> Focus
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.maxWidthWrapper}>
          
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Spark</Text>
              <Text style={styles.subtitle}>Ready to focus?</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>
                {streak} day{streak !== 1 ? 's' : ''} streak
              </Text>
            </View>
          </View>

          {Platform.OS === 'android' && (
            <View style={styles.overlayCard}>
              <View style={styles.overlayTextContainer}>
                <Text style={styles.overlayTitle}>Floating Bubble</Text>
                <Text style={styles.overlayDesc}>Keep tasks visible over other apps</Text>
              </View>
              <Switch
                trackColor={{false: Tokens.colors.neutral[600], true: Tokens.colors.brand[500]}}
                thumbColor={Tokens.colors.neutral[0]}
                ios_backgroundColor={Tokens.colors.neutral[700]}
                onValueChange={toggleOverlay}
                value={isOverlayEnabled}
              />
            </View>
          )}

          <View style={styles.modesGrid}>
            {modes.map((mode, index) => (
              <ModeCard
                key={mode.id}
                mode={mode}
                onPress={() => handlePress(mode.id)}
                style={{ width: cardWidth }}
                animatedStyle={{
                  opacity: fadeAnims[index],
                  transform: [{ translateY: slideAnims[index] }]
                }}
              />
            ))}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral[900],
  },
  scrollContent: {
    flexGrow: 1,
    padding: Tokens.spacing[16],
    alignItems: 'center', // Center the max-width wrapper
  },
  maxWidthWrapper: {
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.content,
  },
  header: {
    marginBottom: Tokens.spacing[32],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Tokens.spacing[16],
  },
  title: {
    fontFamily: 'System', 
    fontSize: Tokens.type['5xl'],
    fontWeight: '700', // Bold
    color: Tokens.colors.neutral[0],
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: Tokens.type.lg,
    color: Tokens.colors.neutral[400],
    marginTop: Tokens.spacing[4],
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Tokens.colors.neutral[800],
    paddingHorizontal: Tokens.spacing[12],
    paddingVertical: Tokens.spacing[8],
    borderRadius: Tokens.radii.pill,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral[700],
  },
  streakEmoji: {
    fontSize: Tokens.type.xl,
    marginRight: Tokens.spacing[4],
  },
  streakText: {
    fontSize: Tokens.type.lg,
    fontWeight: '600',
    color: Tokens.colors.neutral[100],
  },
  // Overlay Card
  overlayCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Tokens.spacing[32],
    padding: Tokens.spacing[16],
    backgroundColor: Tokens.colors.neutral[800],
    borderRadius: Tokens.radii.lg,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral[700],
  },
  overlayTextContainer: {
    flex: 1,
    marginRight: Tokens.spacing[16],
  },
  overlayTitle: {
    fontSize: Tokens.type.lg,
    fontWeight: '600',
    color: Tokens.colors.neutral[100],
    marginBottom: Tokens.spacing[4],
  },
  overlayDesc: {
    fontSize: Tokens.type.sm,
    color: Tokens.colors.neutral[400],
  },
  // Grid
  modesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Tokens.spacing[16], // Works in RN 0.71+ (and Web)
    // fallback for older RN:
    // marginTop: -Tokens.spacing[16], 
  },
});

export default HomeScreen;
