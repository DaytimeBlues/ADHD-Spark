/**
 * P5JournalScreen - Persona 5 Style Journal/Mood Tracking
 * 
 * Emotional self-monitoring with angular, structured presentation.
 * Supports mood tracking with intensity scale.
 * 
 * @example
 * <P5JournalScreen />
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import {
  P5Screen,
  P5Header,
  P5Button,
  P5Card,
  P5Input,
} from '../ui/p5';
import {
  P5Colors,
  P5Spacing,
  P5Typography,
  P5FontSizes,
  P5Motion,
} from '../theme/p5Tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mood types
type MoodLevel = 1 | 2 | 3 | 4 | 5;

interface JournalEntry {
  id: string;
  date: Date;
  mood: MoodLevel;
  content: string;
  tags: string[];
}

const MOOD_LABELS: Record<MoodLevel, string> = {
  1: 'Rough',
  2: 'Tough',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

const MOOD_COLORS: Record<MoodLevel, string> = {
  1: '#660000', // Dark crimson
  2: '#990000', // Deep red
  3: '#E60012', // Primary red
  4: '#FF3333', // Light red
  5: '#FF6666', // Pale pink-red
};

export const P5JournalScreen = memo(function P5JournalScreen() {
  const insets = useSafeAreaInsets();
  
  // State
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: new Date(),
      mood: 4,
      content: 'Great focus session this morning. Completed the project proposal ahead of schedule!',
      tags: ['focus', 'productivity'],
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000),
      mood: 3,
      content: 'Had some difficulty staying on task in the afternoon. Need to improve morning routine.',
      tags: ['struggle', 'improvement'],
    },
  ]);
  
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [entryText, setEntryText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  
  // Animation values for mood selector
  const moodScales = useMemo(() => 
    Array.from({ length: 5 }, () => useSharedValue(1)), 
  []);
  
  // Handle mood selection
  const handleMoodSelect = useCallback((mood: MoodLevel) => {
    setSelectedMood(mood);
    
    // Animate selected mood
    moodScales.forEach((scale, index) => {
      if (index + 1 === mood) {
        scale.value = withSpring(1.2, { stiffness: 300, damping: 10 });
      } else {
        scale.value = withSpring(0.8, { stiffness: 300, damping: 10 });
      }
    });
  }, [moodScales]);
  
  // Handle save entry
  const handleSaveEntry = useCallback(() => {
    if (!selectedMood || !entryText.trim()) return;
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      mood: selectedMood,
      content: entryText.trim(),
      tags: [],
    };
    
    setEntries((prev) => [newEntry, ...prev]);
    setSelectedMood(null);
    setEntryText('');
    setIsComposing(false);
  }, [selectedMood, entryText]);
  
  // Format date
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'TODAY';
    if (days === 1) return 'YESTERDAY';
    
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return `${daysOfWeek[date.getDay()]} ${date.getDate()}`;
  };
  
  // Render mood selector
  const renderMoodSelector = () => (
    <View style={styles.moodSelector}>
      <Text style={styles.moodSelectorLabel}>HOW ARE YOU FEELING?</Text>
      <View style={styles.moodButtons}>
        {([1, 2, 3, 4, 5] as MoodLevel[]).map((mood) => (
          <MoodButton
            key={mood}
            mood={mood}
            isSelected={selectedMood === mood}
            onPress={() => handleMoodSelect(mood)}
          />
        ))}
      </View>
      {selectedMood && (
        <Text style={[styles.moodLabel, { color: MOOD_COLORS[selectedMood] }]}>
          {MOOD_LABELS[selectedMood]}
        </Text>
      )}
    </View>
  );
  
  // Render entry list
  const renderEntries = () => (
    <View style={styles.entriesList}>
      {entries.map((entry, index) => (
        <Animated.View
          key={entry.id}
          entering={SlideInRight.delay(index * 100).duration(300)}
        >
          <P5Card
            accentPosition="left"
            intensity="subtle"
            style={styles.entryCard}
          >
            <View style={styles.entryHeader}>
              <View style={[styles.moodIndicator, { backgroundColor: MOOD_COLORS[entry.mood] }]} />
              <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
              <Text style={styles.entryMood}>{MOOD_LABELS[entry.mood]}</Text>
            </View>
            <Text style={styles.entryContent}>{entry.content}</Text>
            {entry.tags.length > 0 && (
              <View style={styles.entryTags}>
                {entry.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </P5Card>
        </Animated.View>
      ))}
    </View>
  );
  
  return (
    <P5Screen>
      <P5Header 
        title="JOURNAL" 
        subtitle="MOOD TRACK"
        showBack 
        onBack={() => {}}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Mood Selector */}
        <Animated.View entering={FadeIn.delay(100).duration(300)}>
          {renderMoodSelector()}
        </Animated.View>
        
        {/* Compose Entry */}
        {isComposing ? (
          <Animated.View entering={FadeIn.duration(300)}>
            <P5Card accentPosition="none" intensity="bold" style={styles.composeCard}>
              <TextInput
                style={styles.composeInput}
                placeholder="Write about your day..."
                placeholderTextColor={P5Colors.textMuted}
                value={entryText}
                onChangeText={setEntryText}
                multiline
                autoFocus
              />
              <View style={styles.composeActions}>
                <P5Button
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    setIsComposing(false);
                    setSelectedMood(null);
                    setEntryText('');
                  }}
                >
                  CANCEL
                </P5Button>
                <P5Button
                  variant="primary"
                  size="sm"
                  onPress={handleSaveEntry}
                  disabled={!selectedMood || !entryText.trim()}
                >
                  SAVE
                </P5Button>
              </View>
            </P5Card>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.delay(200).duration(300)}>
            <P5Button
              variant="secondary"
              size="lg"
              onPress={() => setIsComposing(true)}
              style={styles.newEntryButton}
            >
              + NEW ENTRY
            </P5Button>
          </Animated.View>
        )}
        
        {/* Entries List */}
        <Animated.View entering={FadeIn.delay(400).duration(300)}>
          <Text style={styles.sectionLabel}>RECENT ENTRIES</Text>
          {renderEntries()}
        </Animated.View>
      </ScrollView>
    </P5Screen>
  );
});

// Mood button component
interface MoodButtonProps {
  mood: MoodLevel;
  isSelected: boolean;
  onPress: () => void;
}

const MoodButton = memo(function MoodButton({ mood, isSelected, onPress }: MoodButtonProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  React.useEffect(() => {
    scale.value = withSpring(isSelected ? 1.2 : 1, { stiffness: 300, damping: 10 });
  }, [isSelected, scale]);
  
  return (
    <Animated.View style={animatedStyle}>
      <P5Button
        variant={isSelected ? 'primary' : 'ghost'}
        size="md"
        onPress={onPress}
        style={styles.moodButton}
      >
        {mood}
      </P5Button>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: P5Spacing.md,
  },
  moodSelector: {
    marginBottom: P5Spacing.lg,
  },
  moodSelectorLabel: {
    fontSize: P5FontSizes.caption,
    fontWeight: '700',
    color: P5Colors.primary,
    letterSpacing: 2,
    marginBottom: P5Spacing.md,
    textAlign: 'center',
  },
  moodButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: P5Spacing.sm,
  },
  moodButton: {
    width: 48,
    height: 48,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  moodLabel: {
    fontSize: P5FontSizes.heading2,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: P5Spacing.sm,
    textTransform: 'uppercase',
  },
  composeCard: {
    marginTop: P5Spacing.lg,
    padding: P5Spacing.md,
  },
  composeInput: {
    fontSize: P5FontSizes.body,
    fontWeight: '500',
    color: P5Colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  composeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: P5Spacing.md,
  },
  newEntryButton: {
    marginTop: P5Spacing.lg,
  },
  sectionLabel: {
    fontSize: P5FontSizes.caption,
    fontWeight: '700',
    color: P5Colors.primary,
    letterSpacing: 2,
    marginBottom: P5Spacing.md,
    marginTop: P5Spacing.xl,
  },
  entriesList: {
    gap: P5Spacing.sm,
  },
  entryCard: {
    padding: P5Spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: P5Spacing.sm,
  },
  moodIndicator: {
    width: 12,
    height: 12,
    marginRight: P5Spacing.sm,
  },
  entryDate: {
    fontSize: P5FontSizes.caption,
    fontWeight: '700',
    color: P5Colors.text,
    letterSpacing: 1,
    flex: 1,
  },
  entryMood: {
    fontSize: P5FontSizes.caption,
    fontWeight: '600',
    color: P5Colors.textMuted,
  },
  entryContent: {
    fontSize: P5FontSizes.body,
    fontWeight: '500',
    color: P5Colors.textSecondary,
    lineHeight: 22,
  },
  entryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: P5Spacing.sm,
    gap: P5Spacing.xs,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: P5Spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: P5FontSizes.caption,
    fontWeight: '600',
    color: P5Colors.textMuted,
  },
});

export default P5JournalScreen;
