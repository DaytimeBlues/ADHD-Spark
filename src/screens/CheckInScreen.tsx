import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearCard } from '../components/ui/LinearCard';
import { LinearButton } from '../components/ui/LinearButton';
import { EvidenceBadge } from '../components/ui/EvidenceBadge';
import ActivationService, {
  ActivationSource,
} from '../services/ActivationService';
import { ROUTES } from '../navigation/routes';
import { Tokens } from '../theme/tokens';

const HOVER_SHADOW = '0 0 0 rgba(0,0,0,0)';

type CheckInNavigation = {
  navigate: (route: string) => void;
};

type RecommendationAction = {
  route: string;
  source: ActivationSource;
  cta: string;
};

export const getRecommendationAction = (
  mood: number,
  energy: number,
): RecommendationAction => {
  if (mood >= 4 && energy >= 4) {
    return {
      route: ROUTES.FOCUS,
      source: 'checkin_prompt',
      cta: 'START IGNITE',
    };
  }

  if (mood <= 2 && energy <= 2) {
    return {
      route: ROUTES.ANCHOR,
      source: 'checkin_prompt',
      cta: 'OPEN ANCHOR',
    };
  }

  if (energy <= 2) {
    return {
      route: ROUTES.FOG_CUTTER,
      source: 'checkin_prompt',
      cta: 'OPEN FOG CUTTER',
    };
  }

  return {
    route: ROUTES.TASKS,
    source: 'checkin_prompt',
    cta: 'OPEN BRAIN DUMP',
  };
};

const CheckInScreen = ({ navigation }: { navigation?: CheckInNavigation }) => {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [isRecommendationPending, setIsRecommendationPending] = useState(false);

  const moods = [
    { emoji: '😢', label: 'Low', value: 1 },
    { emoji: '😕', label: 'Down', value: 2 },
    { emoji: '😐', label: 'Neutral', value: 3 },
    { emoji: '🙂', label: 'Good', value: 4 },
    { emoji: '😊', label: 'Great', value: 5 },
  ];

  const energyLevels = [
    { emoji: '🪫', label: 'Drained', value: 1 },
    { emoji: '🔋', label: 'Low', value: 2 },
    { emoji: '⚡', label: 'Medium', value: 3 },
    { emoji: '🚀', label: 'High', value: 4 },
    { emoji: '🔥', label: 'Full', value: 5 },
  ];

  const getRecommendation = () => {
    if (mood === null || energy === null) {
      return null;
    }
    if (mood <= 2 && energy <= 2) {
      return {
        title: '🌱 GENTLE START',
        desc: 'Try the Anchor breathing exercise to ground yourself.',
      };
    }
    if (mood >= 4 && energy >= 4) {
      return {
        title: '🚀 RIDE THE WAVE',
        desc: 'Perfect time for a Ignite focus session!',
      };
    }
    if (energy <= 2) {
      return {
        title: '💪 MICRO TASK',
        desc: 'Try Fog Cutter with just one micro-step.',
      };
    }
    return { title: '📝 BRAIN DUMP', desc: 'Clear your mind before starting.' };
  };

  const recommendation = getRecommendation();

  const handleRecommendationAction = async () => {
    if (mood === null || energy === null || isRecommendationPending) {
      return;
    }

    const action = getRecommendationAction(mood, energy);
    setIsRecommendationPending(true);

    try {
      if (action.route === ROUTES.FOCUS) {
        try {
          await ActivationService.requestPendingStart({
            source: action.source,
            requestedAt: new Date().toISOString(),
            context: {
              reason: 'checkin_high_readiness',
            },
          });
        } catch (error) {
          console.warn(
            'Failed to queue pending ignite start from check-in:',
            error,
          );
        }
      }

      navigation?.navigate(action.route);
    } finally {
      setIsRecommendationPending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>CHECK IN</Text>
          <Text style={styles.subtitle}>HOW ARE YOU FEELING RIGHT NOW?</Text>

          <View style={styles.rationaleCard}>
            <Text style={styles.rationaleTitle}>WHY THIS WORKS</Text>
            <Text style={styles.rationaleText}>
              Self-monitoring is a core CBT skill for ADHD. Tracking mood and 
              energy helps identify patterns, predict challenges, and choose 
              appropriate interventions. This metacognitive awareness creates 
              space between feeling and action.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MOOD</Text>
            <View style={styles.options}>
              {moods.map((m) => (
                <Pressable
                  key={m.value}
                  testID={`mood-option-${m.value}`}
                  style={({
                    pressed,
                    hovered,
                  }: {
                    pressed: boolean;
                    hovered?: boolean;
                  }) => [
                    styles.option,
                    mood === m.value && styles.selected,
                    hovered && !mood && styles.optionHovered,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => setMood(m.value)}
                >
                  <Text style={styles.emoji}>{m.emoji}</Text>
                  <Text
                    style={[
                      styles.label,
                      mood === m.value && styles.selectedLabel,
                    ]}
                  >
                    {m.label.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ENERGY</Text>
            <View style={styles.options}>
              {energyLevels.map((e) => (
                <Pressable
                  key={e.value}
                  testID={`energy-option-${e.value}`}
                  style={({
                    pressed,
                    hovered,
                  }: {
                    pressed: boolean;
                    hovered?: boolean;
                  }) => [
                    styles.option,
                    energy === e.value && styles.selected,
                    hovered && !energy && styles.optionHovered,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => setEnergy(e.value)}
                >
                  <Text style={styles.emoji}>{e.emoji}</Text>
                  <Text
                    style={[
                      styles.label,
                      energy === e.value && styles.selectedLabel,
                    ]}
                  >
                    {e.label.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {recommendation && (
            <LinearCard
              title={recommendation.title}
              subtitle="RECOMMENDED FOR YOU"
              style={styles.recommendation}
            >
              <Text style={styles.recommendationText}>{recommendation.desc}</Text>
              <EvidenceBadge tier="heuristic" style={styles.evidenceBadge} />
              <LinearButton
                title={
                  mood !== null && energy !== null
                    ? getRecommendationAction(mood, energy).cta
                    : 'CONTINUE'
                }
                onPress={() => {
                  handleRecommendationAction();
                }}
                size="md"
                style={styles.recommendationButton}
              />
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
    maxWidth: Tokens.layout.maxWidth.prose,
    alignSelf: 'center',
  },
  content: {
    flex: 1,
    padding: Tokens.spacing[6],
  },
  title: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type['4xl'],
    fontWeight: '800',
    color: Tokens.colors.text.primary,
    marginBottom: Tokens.spacing[2],
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    marginBottom: Tokens.spacing[4],
    textAlign: 'center',
    letterSpacing: 1,
  },
  rationaleCard: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    padding: Tokens.spacing[4],
    marginBottom: Tokens.spacing[8],
  },
  rationaleTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.xs,
    fontWeight: '700',
    color: Tokens.colors.brand[500],
    letterSpacing: 1,
    marginBottom: Tokens.spacing[2],
    textTransform: 'uppercase',
  },
  rationaleText: {
    fontFamily: Tokens.type.fontFamily.body,
    fontSize: Tokens.type.sm,
    color: Tokens.colors.text.secondary,
    lineHeight: Tokens.type.lineHeight.relaxed,
  },
  section: {
    marginBottom: Tokens.spacing[8],
  },
  sectionTitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.sm,
    fontWeight: '600',
    marginBottom: Tokens.spacing[4],
    letterSpacing: 1,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing[3],
  },
  option: {
    flexGrow: 1,
    flexBasis: 100,
    alignItems: 'center',
    padding: Tokens.spacing[2],
    borderRadius: Tokens.radii.none, // Sharp
    backgroundColor: Tokens.colors.neutral.darker,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    justifyContent: 'center',
    ...Platform.select({
      web: {
        transition: Tokens.motion.transitions.base,
        cursor: 'pointer',
      },
    }),
  },
  optionHovered: {
    borderColor: Tokens.colors.text.tertiary,
    transform: [{ translateY: -2 }],
    ...Platform.select({
      web: {
        boxShadow: HOVER_SHADOW,
      },
    }),
  },
  optionPressed: {
    transform: [{ scale: Tokens.motion.scales.press }],
    backgroundColor: Tokens.colors.neutral.dark,
  },
  selected: {
    borderColor: Tokens.colors.brand[500],
    backgroundColor: Tokens.colors.brand[900], // Dark red bg
    transform: [{ translateY: -4 }],
    ...Tokens.elevation.none, // Flat
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 0',
      },
    }),
  },
  emoji: {
    fontSize: Tokens.type['3xl'],
    marginBottom: Tokens.spacing[2],
  },
  label: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.tertiary,
    fontSize: Tokens.type.xs,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  selectedLabel: {
    color: Tokens.colors.text.primary,
    fontWeight: '700',
  },
  recommendation: {
    marginTop: Tokens.spacing[4],
  },
  recommendationText: {
    fontFamily: Tokens.type.fontFamily.sans,
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.base,
    lineHeight: Tokens.type.base * 1.5,
  },
  recommendationButton: {
    marginTop: Tokens.spacing[4],
  },
  evidenceBadge: {
    marginTop: Tokens.spacing[2],
  },
});

export default CheckInScreen;
