import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';
import { CosmicBackground, GlowCard, RuneButton } from '../ui/cosmic';
import { EvidenceBadge } from '../components/ui/EvidenceBadge';
import ActivationService, {
  ActivationSource,
} from '../services/ActivationService';
import { ROUTES } from '../navigation/routes';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import CheckInInsightService from '../services/CheckInInsightService';

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
  const [insight, setInsight] = useState<string | null>(null);
  const [isRecommendationPending, setIsRecommendationPending] = useState(false);

  const { isCosmic } = useTheme();

  React.useEffect(() => {
    if (mood !== null && energy !== null) {
      const fetchInsight = async () => {
        const result = await CheckInInsightService.getPersonalizedInsight();
        if (result) {
          setInsight(result);
        }
      };
      fetchInsight();
    }
  }, [mood, energy]);

  const moods = [
    {
      quote: '“I am a forest, and a night of dark trees.”',
      author: 'Nietzsche',
      label: 'Low',
      value: 1,
    },
    {
      quote: '“A melancholy of mine own.”',
      author: 'Shakespeare',
      label: 'Down',
      value: 2,
    },
    { quote: '“I simply am.”', author: 'Kafka', label: 'Neutral', value: 3 },
    {
      quote: '“I celebrate myself, and sing myself.”',
      author: 'Whitman',
      label: 'Good',
      value: 4,
    },
    {
      quote: '“I dwell in possibility.”',
      author: 'Dickinson',
      label: 'Great',
      value: 5,
    },
  ];

  const energyLevels = [
    {
      quote: '“I am worn out with dreams.”',
      author: 'Wilde',
      label: 'Drained',
      value: 1,
    },
    {
      quote: '“A strange languor has come over me.”',
      author: 'Shelley',
      label: 'Low',
      value: 2,
    },
    {
      quote: '“I am awake, and the world is awake.”',
      author: 'Thoreau',
      label: 'Medium',
      value: 3,
    },
    {
      quote: '“There is a vitality, a life force.”',
      author: 'Graham',
      label: 'High',
      value: 4,
    },
    {
      quote: '“I contain multitudes.”',
      author: 'Whitman',
      label: 'Full',
      value: 5,
    },
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

  const styles = getStyles(isCosmic);

  return (
    <CosmicBackground variant="moon">
      <SafeAreaView style={styles.container}>
        <View style={styles.webContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>CHECK IN</Text>
            <Text style={styles.subtitle}>HOW ARE YOU FEELING RIGHT NOW?</Text>

            <GlowCard
              glow="soft"
              tone="base"
              padding="md"
              style={styles.rationaleCard}
            >
              <Text style={styles.rationaleTitle}>WHY THIS WORKS</Text>
              <Text style={styles.rationaleText}>
                Self-monitoring is a core CBT skill for ADHD. Tracking mood and
                energy helps identify patterns, predict challenges, and choose
                appropriate interventions. This metacognitive awareness creates
                space between feeling and action.
              </Text>
            </GlowCard>

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
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.label,
                          mood === m.value && styles.selectedLabel,
                        ]}
                      >
                        {m.label.toUpperCase()}
                      </Text>
                      <Text
                        style={[
                          styles.quote,
                          mood === m.value && styles.selectedQuote,
                        ]}
                      >
                        {m.quote}
                      </Text>
                      <Text style={styles.author}>— {m.author}</Text>
                    </View>
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
                    <View style={styles.optionContent}>
                      <Text
                        style={[
                          styles.label,
                          energy === e.value && styles.selectedLabel,
                        ]}
                      >
                        {e.label.toUpperCase()}
                      </Text>
                      <Text
                        style={[
                          styles.quote,
                          energy === e.value && styles.selectedQuote,
                        ]}
                      >
                        {e.quote}
                      </Text>
                      <Text style={styles.author}>— {e.author}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            {recommendation && (
              <GlowCard
                glow="medium"
                tone="raised"
                padding="lg"
                style={styles.recommendation}
              >
                <Text style={styles.recommendationTitle}>
                  {recommendation.title}
                </Text>
                <Text style={styles.recommendationSubtitle}>
                  RECOMMENDED FOR YOU
                </Text>
                <Text style={styles.recommendationText}>
                  {recommendation.desc}
                </Text>
                {insight && (
                  <View style={styles.insightBox}>
                    <Text style={styles.insightLabel}>AI_INSIGHT:</Text>
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                )}
                <EvidenceBadge tier="heuristic" style={styles.evidenceBadge} />
                <RuneButton
                  variant="primary"
                  size="md"
                  glow="medium"
                  onPress={handleRecommendationAction}
                  testID="recommendation-action-button"
                >
                  {mood !== null && energy !== null
                    ? getRecommendationAction(mood, energy).cta
                    : 'CONTINUE'}
                </RuneButton>
              </GlowCard>
            )}
          </View>
        </View>
      </SafeAreaView>
    </CosmicBackground>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
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
      fontFamily: isCosmic ? 'Space Grotesk' : Tokens.type.fontFamily.sans,
      fontSize: Tokens.type['4xl'],
      fontWeight: '800',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      marginBottom: Tokens.spacing[2],
      letterSpacing: 2,
      textAlign: 'center',
      ...(isCosmic && Platform.OS === 'web'
        ? {
            textShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          }
        : {}),
    },
    subtitle: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.base,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      marginBottom: Tokens.spacing[4],
      textAlign: 'center',
      letterSpacing: 1,
    },
    rationaleCard: {
      marginBottom: Tokens.spacing[8],
    },
    rationaleTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#2DD4BF' : Tokens.colors.brand[500],
      letterSpacing: 1,
      marginBottom: Tokens.spacing[2],
      textTransform: 'uppercase',
    },
    rationaleText: {
      fontFamily: Tokens.type.fontFamily.body,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      lineHeight: 22,
      flexWrap: 'wrap',
    },
    section: {
      marginBottom: Tokens.spacing[8],
    },
    sectionTitle: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontSize: Tokens.type.sm,
      fontWeight: '600',
      marginBottom: Tokens.spacing[4],
      letterSpacing: 1,
    },
    options: {
      flexDirection: 'column',
      gap: Tokens.spacing[3],
    },
    option: {
      padding: Tokens.spacing[5],
      borderRadius: isCosmic ? 20 : Tokens.radii.none,
      backgroundColor: isCosmic
        ? 'rgba(14, 20, 40, 0.6)'
        : Tokens.colors.neutral.darker,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.borderSubtle,
      ...Platform.select({
        web: {
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          ...(isCosmic
            ? {
                backdropFilter: 'blur(8px)',
              }
            : {}),
        },
      }),
    },
    optionHovered: {
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.5)'
        : Tokens.colors.text.tertiary,
      transform: [{ translateY: -2 }],
      ...Platform.select({
        web: {
          boxShadow: HOVER_SHADOW,
        },
      }),
    },
    optionPressed: {
      transform: [{ scale: Tokens.motion.scales.press }],
      backgroundColor: isCosmic ? '#111A33' : Tokens.colors.neutral.dark,
    },
    selected: {
      borderColor: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      borderTopColor: isCosmic ? '#A78BFA' : undefined, // Concept #43: Highlight
      borderTopWidth: isCosmic ? 2 : 1,
      backgroundColor: isCosmic
        ? 'rgba(139, 92, 246, 0.18)'
        : Tokens.colors.brand[900],
      transform: [{ translateY: -4 }, { scale: 1.01 }],
      ...Tokens.elevation.none,
      ...Platform.select({
        web: isCosmic
          ? {
              boxShadow:
                '0 0 0 2px rgba(139,92,246,0.4), 0 0 20px rgba(139,92,246,0.25)',
            }
          : {
              boxShadow: '0 0 0 0',
            },
      }),
    },
    optionContent: {
      flexDirection: 'column',
      gap: 2,
    },
    quote: {
      fontFamily: isCosmic
        ? '"Space Grotesk", sans-serif'
        : Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.lg,
      fontStyle: 'italic',
      color: isCosmic
        ? 'rgba(238, 242, 255, 0.78)'
        : Tokens.colors.text.secondary,
      lineHeight: 22,
      marginTop: Tokens.spacing[2],
      marginBottom: Tokens.spacing[1],
    },
    selectedQuote: {
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
    },
    author: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.xs,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.tertiary,
      alignSelf: 'flex-end',
    },
    label: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      letterSpacing: 1,
    },
    selectedLabel: {
      color: isCosmic ? '#2DD4BF' : Tokens.colors.text.primary,
    },
    recommendation: {
      marginTop: Tokens.spacing[4],
    },
    recommendationTitle: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.lg,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      marginBottom: Tokens.spacing[1],
    },
    recommendationSubtitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '600',
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.tertiary,
      letterSpacing: 1,
      marginBottom: Tokens.spacing[3],
    },
    recommendationText: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.primary,
      fontSize: Tokens.type.base,
      lineHeight: Tokens.type.base * 1.5,
      marginBottom: Tokens.spacing[2],
    },
    evidenceBadge: {
      marginTop: Tokens.spacing[2],
      marginBottom: Tokens.spacing[4],
    },
    insightBox: {
      backgroundColor: isCosmic
        ? 'rgba(139, 92, 246, 0.1)'
        : Tokens.colors.neutral.darkest,
      borderLeftWidth: 2,
      borderLeftColor: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      padding: Tokens.spacing[3],
      marginVertical: Tokens.spacing[4],
      borderRadius: isCosmic ? 4 : 0,
    },
    insightLabel: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      marginBottom: 4,
      letterSpacing: 1,
    },
    insightText: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.sm,
      fontStyle: 'italic',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      lineHeight: 20,
    },
  });

export default CheckInScreen;
