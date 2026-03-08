import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AccessibilityInfo,
  Dimensions,
} from 'react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { GlowCard } from '../../ui/cosmic/GlowCard';
import { RuneButton } from '../../ui/cosmic/RuneButton';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import useReducedMotion from '../../hooks/useReducedMotion';
import { TutorialStep } from '../../store/useTutorialStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TutorialBubbleProps {
  /** The current tutorial step to display */
  step: TutorialStep;
  /** Current step index (0-based) */
  stepIndex: number;
  /** Total number of steps in the flow */
  totalSteps: number;
  /** Whether this is the first step */
  isFirstStep: boolean;
  /** Whether this is the last step */
  isLastStep: boolean;
  /** Callback when user presses Next */
  onNext: () => void;
  /** Callback when user presses Previous */
  onPrevious: () => void;
  /** Callback when user presses Skip */
  onSkip: () => void;
  /** Optional style override for positioning */
  style?: object;
}

/**
 * TutorialBubble - An accessible, animated tutorial tooltip component
 *
 * Features:
 * - Uses GlowCard for consistent cosmic theming
 * - Reanimated animations with reduced motion support
 * - Full accessibility support with screen reader announcements
 * - Responsive layout with minimum touch targets (44px)
 */
export const TutorialBubble: React.FC<TutorialBubbleProps> = ({
  step,
  stepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  onNext,
  onPrevious,
  onSkip,
  style,
}) => {
  const { isCosmic } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  // Announce step content to screen readers when step changes
  useEffect(() => {
    const announcement = `${step.title}. ${step.whyText} ${step.howText}. Step ${stepIndex + 1} of ${totalSteps}`;
    AccessibilityInfo.announceForAccessibility(announcement);
  }, [step, stepIndex, totalSteps]);

  // Calculate progress percentage
  const progress = useMemo(() => {
    return ((stepIndex + 1) / totalSteps) * 100;
  }, [stepIndex, totalSteps]);

  // Animation props based on reduced motion preference
  const animationProps = useMemo(() => {
    if (prefersReducedMotion) {
      return {};
    }
    return {
      entering: FadeInUp.duration(300).springify(),
      layout: Layout.springify(),
    };
  }, [prefersReducedMotion]);

  // Dynamic text colors based on theme
  const titleColor = isCosmic ? '#EEF2FF' : Tokens.colors.text.primary;
  const bodyColor = isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary;
  const accentColor = isCosmic ? '#8B5CF6' : Tokens.colors.brand[500];

  return (
    <Animated.View
      {...animationProps}
      style={[styles.container, style]}
      accessibilityViewIsModal={true}
      accessibilityLiveRegion="polite"
    >
      <GlowCard glow="medium" tone="raised" padding="lg" style={styles.card}>
        {/* Progress bar */}
        <View style={styles.progressContainer} accessibilityRole="progressbar">
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%`, backgroundColor: accentColor },
              ]}
            />
          </View>
          <Text
            style={[
              styles.progressText,
              { color: bodyColor, fontFamily: Tokens.type.fontFamily.mono },
            ]}
            accessibilityLabel={`Step ${stepIndex + 1} of ${totalSteps}`}
          >
            {String(stepIndex + 1).padStart(2, '0')} /{' '}
            {String(totalSteps).padStart(2, '0')}
          </Text>
        </View>

        {/* Icon */}
        {step.iconName && (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={step.iconName}
              size={32}
              color={accentColor}
              accessibilityLabel={`${step.iconName} icon`}
            />
          </View>
        )}

        {/* Title */}
        <Text
          style={[
            styles.title,
            {
              color: titleColor,
              fontFamily: Tokens.type.fontFamily.mono,
            },
          ]}
          accessibilityRole="header"
          accessibilityLabel={step.title}
        >
          {step.title}
        </Text>

        {/* Why text (clinical benefit) */}
        <Text
          style={[
            styles.whyText,
            {
              color: bodyColor,
              fontFamily: Tokens.type.fontFamily.sans,
            },
          ]}
          accessibilityLabel={`Why: ${step.whyText}`}
        >
          {step.whyText}
        </Text>

        {/* How text (actionable instruction) */}
        <View style={styles.howContainer}>
          <View
            style={[styles.howIndicator, { backgroundColor: accentColor }]}
          />
          <Text
            style={[
              styles.howText,
              {
                color: titleColor,
                fontFamily: Tokens.type.fontFamily.sans,
              },
            ]}
            accessibilityLabel={`How: ${step.howText}`}
          >
            {step.howText}
          </Text>
        </View>

        {/* Navigation buttons */}
        <View style={styles.buttonContainer}>
          {/* Previous button - hidden on first step */}
          <View style={styles.buttonWrapper}>
            {!isFirstStep ? (
              <RuneButton
                variant="ghost"
                size="md"
                onPress={onPrevious}
                accessibilityLabel="Previous step"
                accessibilityHint="Go back to the previous tutorial step"
                testID="tutorial-previous-button"
              >
                Previous
              </RuneButton>
            ) : (
              <View style={styles.placeholderButton} />
            )}
          </View>

          {/* Next button */}
          <View style={styles.buttonWrapper}>
            <RuneButton
              variant="primary"
              size="md"
              glow="medium"
              onPress={onNext}
              accessibilityLabel={isLastStep ? 'Finish tutorial' : 'Next step'}
              accessibilityHint={
                isLastStep
                  ? 'Complete the tutorial and start using the app'
                  : 'Go to the next tutorial step'
              }
              testID="tutorial-next-button"
            >
              {isLastStep ? 'Finish' : 'Next'}
            </RuneButton>
          </View>
        </View>

        {/* Skip button */}
        <View style={styles.skipContainer}>
          <RuneButton
            variant="ghost"
            size="sm"
            onPress={onSkip}
            accessibilityLabel="Skip tutorial"
            accessibilityHint="Skip the rest of the tutorial and start using the app"
            testID="tutorial-skip-button"
          >
            Skip Tutorial
          </RuneButton>
        </View>
      </GlowCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Math.min(SCREEN_WIDTH - 32, 400),
    alignSelf: 'center',
  },
  card: {
    width: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Tokens.spacing[4],
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(185, 194, 217, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: Tokens.type.xs,
    marginLeft: Tokens.spacing[3],
    minWidth: 40,
    textAlign: 'right',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Tokens.spacing[3],
  },
  title: {
    fontSize: Tokens.type.lg,
    fontWeight: '600',
    marginBottom: Tokens.spacing[3],
    lineHeight: Tokens.type.lg * 1.3,
  },
  whyText: {
    fontSize: Tokens.type.sm,
    lineHeight: Tokens.type.sm * 1.5,
    marginBottom: Tokens.spacing[3],
    opacity: 0.9,
  },
  howContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: Tokens.radii.md,
    padding: Tokens.spacing[3],
    marginBottom: Tokens.spacing[4],
  },
  howIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: Tokens.spacing[3],
    alignSelf: 'stretch',
  },
  howText: {
    flex: 1,
    fontSize: Tokens.type.sm,
    lineHeight: Tokens.type.sm * 1.5,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Tokens.spacing[3],
  },
  buttonWrapper: {
    flex: 1,
  },
  placeholderButton: {
    width: '100%',
    height: 44, // Minimum touch target size
  },
  skipContainer: {
    alignItems: 'center',
    marginTop: Tokens.spacing[3],
  },
});

export default TutorialBubble;
