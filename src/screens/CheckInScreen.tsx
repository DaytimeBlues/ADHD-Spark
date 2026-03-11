import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { CosmicBackground, GlowCard, RuneButton } from '../ui/cosmic';
import { EvidenceBadge } from '../components/ui/EvidenceBadge';
import ActivationService from '../services/ActivationService';
import CheckInInsightService from '../services/CheckInInsightService';
import { LoggerService } from '../services/LoggerService';
import { useTheme } from '../theme/useTheme';
import { getCheckInScreenStyles } from './CheckInScreen.styles';
import { getRecommendationAction } from './CheckInScreen.utils';
import {
  CHECK_IN_ENERGY_LEVELS,
  CHECK_IN_MOODS,
  getRecommendationCopy,
} from './check-in/checkInData';
import { CheckInOptionGroup } from './check-in/CheckInOptionGroup';

type CheckInNavigation = {
  navigate: (route: string) => void;
};

const CheckInScreen = ({ navigation }: { navigation?: CheckInNavigation }) => {
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [isRecommendationPending, setIsRecommendationPending] = useState(false);
  const { isCosmic } = useTheme();
  const styles = getCheckInScreenStyles(isCosmic);
  const recommendation = getRecommendationCopy(mood, energy);

  useEffect(() => {
    if (mood === null || energy === null) {
      return;
    }

    CheckInInsightService.getPersonalizedInsight().then((result) => {
      if (result) {
        setInsight(result);
      }
    });
  }, [energy, mood]);

  const handleRecommendationAction = async () => {
    if (mood === null || energy === null || isRecommendationPending) {
      return;
    }

    const action = getRecommendationAction(mood, energy);
    setIsRecommendationPending(true);

    try {
      if (action.route === 'Focus') {
        try {
          await ActivationService.requestPendingStart({
            source: action.source,
            requestedAt: new Date().toISOString(),
            context: {
              reason: 'checkin_high_readiness',
            },
          });
        } catch (error) {
          LoggerService.warn({
            service: 'CheckInScreen',
            operation: 'handleRecommendationAction',
            message: 'Failed to queue pending ignite start from check-in',
            error,
          });
        }
      }

      navigation?.navigate(action.route);
    } finally {
      setIsRecommendationPending(false);
    }
  };

  return (
    <CosmicBackground variant="moon">
      <SafeAreaView
        style={styles.container}
        accessibilityLabel="Check-in screen"
        accessibilityRole="summary"
      >
        <View style={styles.webContainer}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title} testID="checkin-title">
              CHECK IN
            </Text>
            <Text style={styles.subtitle} testID="checkin-subtitle">
              HOW ARE YOU FEELING RIGHT NOW?
            </Text>

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

            <CheckInOptionGroup
              isCosmic={isCosmic}
              title="MOOD"
              options={CHECK_IN_MOODS}
              selectedValue={mood}
              testIdPrefix="mood-option"
              onSelect={setMood}
            />

            <CheckInOptionGroup
              isCosmic={isCosmic}
              title="ENERGY"
              options={CHECK_IN_ENERGY_LEVELS}
              selectedValue={energy}
              testIdPrefix="energy-option"
              onSelect={setEnergy}
            />

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
                <Text
                  style={styles.recommendationSubtitle}
                  testID="recommendation-subtitle"
                >
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
          </ScrollView>
        </View>
      </SafeAreaView>
    </CosmicBackground>
  );
};

export { getRecommendationAction } from './CheckInScreen.utils';
export default CheckInScreen;
