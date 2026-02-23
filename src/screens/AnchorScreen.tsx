import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { LinearButton } from '../components/ui/LinearButton';
import useTimer from '../hooks/useTimer';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/ThemeProvider';
import {
  ChronoDigits,
  RuneButton,
  HaloRing,
  GlowCard,
  CosmicBackground,
} from '../ui/cosmic';

type BreathingPattern = '478' | 'box' | 'energize';

const PATTERNS: Record<
  BreathingPattern,
  { name: string; inhale: number; hold: number; exhale: number; wait: number }
> = {
  '478': { name: '4-7-8 RELAX', inhale: 4, hold: 7, exhale: 8, wait: 0 },
  box: { name: 'BOX BREATHING', inhale: 4, hold: 4, exhale: 4, wait: 4 },
  energize: { name: 'ENERGIZE', inhale: 6, hold: 0, exhale: 2, wait: 0 },
};

const CIRCLE_TRANSITION = 'transform 1s ease-in-out';
const BREATHING_CIRCLE_SIZE = 240;
const INNER_CIRCLE_SIZE = 140;

const AnchorScreen = () => {
  const { isCosmic } = useTheme();
  const [pattern, setPattern] = useState<BreathingPattern | null>(null);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'wait'>(
    'inhale',
  );
  const phaseRef = useRef<'inhale' | 'hold' | 'exhale' | 'wait'>('inhale');
  const patternRef = useRef<BreathingPattern | null>(null);

  const {
    timeLeft: count,
    start,
    reset,
    setTime,
  } = useTimer({
    initialTime: 4,
    onComplete: () => {
      if (!patternRef.current) {
        return;
      }
      const p = PATTERNS[patternRef.current];
      const phases: Record<
        'inhale' | 'hold' | 'exhale' | 'wait',
        'inhale' | 'hold' | 'exhale' | 'wait'
      > = {
        inhale: p.hold > 0 ? 'hold' : 'exhale',
        hold: 'exhale',
        exhale: p.wait > 0 ? 'wait' : 'inhale',
        wait: 'inhale',
      };
      const currentPhase = phaseRef.current;
      const nextPhase = phases[currentPhase];

      // Animate transition on native
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPhase(nextPhase);
      phaseRef.current = nextPhase;
      setTime(p[nextPhase] || p.inhale);
      // Re-start for the next phase
      setTimeout(() => start(), 0);
    },
  });

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    patternRef.current = pattern;
  }, [pattern]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);

  const startPattern = (selectedPattern: BreathingPattern) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPattern(selectedPattern);
    patternRef.current = selectedPattern;
    setPhase('inhale');
    phaseRef.current = 'inhale';
    setTime(PATTERNS[selectedPattern].inhale);
    start();
  };

  const stopPattern = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    reset();
    setPattern(null);
    patternRef.current = null;
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'BREATHE IN';
      case 'hold':
        return 'HOLD';
      case 'exhale':
        return 'BREATHE OUT';
      case 'wait':
        return 'REST';
      default:
        return '';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.5;
      case 'hold':
        return 1.5;
      case 'exhale':
        return 1;
      case 'wait':
        return 1;
      default:
        return 1;
    }
  };

  const content = (
    <SafeAreaView style={getStyles(isCosmic).container}>
      <View style={getStyles(isCosmic).scrollContent}>
        <View style={getStyles(isCosmic).content}>
          <View style={getStyles(isCosmic).header}>
            <Text style={getStyles(isCosmic).title}>ANCHOR</Text>
            <Text style={getStyles(isCosmic).subtitle}>
              BREATHING EXERCISES FOR CALM AND FOCUS.
            </Text>
          </View>

          <GlowCard
            glow="soft"
            tone="base"
            padding="md"
            style={getStyles(isCosmic).rationaleCard}
          >
            <Text style={getStyles(isCosmic).rationaleTitle}>
              WHY THIS WORKS
            </Text>
            <Text style={getStyles(isCosmic).rationaleText}>
              Emotional dysregulation is core to ADHD. These breathing patterns
              activate the parasympathetic nervous system, reducing cortisol and
              creating a pause between stimulus and response. CBT techniques for
              emotional regulation, made tangible through guided breath.
            </Text>
          </GlowCard>

          {pattern && (
            <View style={getStyles(isCosmic).activeContainer}>
              <View style={getStyles(isCosmic).activeHeader}>
                <Text style={getStyles(isCosmic).patternName}>
                  {PATTERNS[pattern].name}
                </Text>
              </View>

              <View style={getStyles(isCosmic).breathingCircle}>
                {isCosmic ? (
                  <HaloRing
                    mode="breath"
                    size={240}
                    strokeWidth={6}
                    glow="medium"
                    testID="anchor-breathing-ring"
                  />
                ) : (
                  <View
                    style={[
                      getStyles(isCosmic).circle,
                      { transform: [{ scale: getCircleScale() }] },
                    ]}
                  />
                )}
                <View style={getStyles(isCosmic).breathingOverlay}>
                  <Text style={getStyles(isCosmic).phaseText}>
                    {getPhaseText()}
                  </Text>
                  {isCosmic ? (
                    <ChronoDigits
                      value={count.toString().padStart(2, '0')}
                      size="hero"
                      glow="medium"
                      testID="anchor-count"
                    />
                  ) : (
                    <Text
                      testID="anchor-count"
                      style={getStyles(isCosmic).countText}
                    >
                      {count}
                    </Text>
                  )}
                </View>
              </View>

              {isCosmic ? (
                <RuneButton
                  onPress={stopPattern}
                  variant="danger"
                  size="lg"
                  testID="anchor-stop-button"
                >
                  Stop Session
                </RuneButton>
              ) : (
                <LinearButton
                  title="Stop Session"
                  onPress={stopPattern}
                  variant="error"
                  size="lg"
                  style={getStyles(isCosmic).stopButton}
                />
              )}
            </View>
          )}

          {!pattern && (
            <View style={getStyles(isCosmic).patternsContainer}>
              {(Object.keys(PATTERNS) as BreathingPattern[]).map((p) => (
                <GlowCard
                  key={p}
                  testID={`anchor-pattern-${p}`}
                  glow="soft"
                  tone="base"
                  padding="lg"
                  onPress={() => startPattern(p)}
                  style={getStyles(isCosmic).patternButton}
                >
                  <View style={getStyles(isCosmic).patternIcon}>
                    <Text style={getStyles(isCosmic).patternEmoji}>
                      {p === '478' ? '🌙' : p === 'box' ? '📦' : '⚡'}
                    </Text>
                  </View>
                  <View style={getStyles(isCosmic).patternInfo}>
                    <Text style={getStyles(isCosmic).patternButtonText}>
                      {PATTERNS[p].name}
                    </Text>
                    <Text style={getStyles(isCosmic).patternDetails}>
                      {[
                        { label: 'In', val: PATTERNS[p].inhale },
                        { label: 'Hold', val: PATTERNS[p].hold },
                        { label: 'Out', val: PATTERNS[p].exhale },
                        { label: 'Wait', val: PATTERNS[p].wait },
                      ]
                        .filter((s) => s.val > 0)
                        .map((s) => `${s.label} ${s.val}`)
                        .join(' • ')}
                    </Text>
                  </View>
                </GlowCard>
              ))}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );

  if (isCosmic) {
    return (
      <CosmicBackground variant="moon" testID="anchor-cosmic-background">
        {content}
      </CosmicBackground>
    );
  }

  return content;
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isCosmic ? 'transparent' : Tokens.colors.neutral.darkest,
    },
    scrollContent: {
      flex: 1,
      alignItems: 'center',
    },
    content: {
      flex: 1,
      width: '100%',
      maxWidth: Tokens.layout.maxWidth.prose,
      paddingHorizontal: Tokens.spacing[6],
      paddingTop: Tokens.spacing[12],
      paddingBottom: Tokens.spacing[8],
      alignItems: 'center',
    },
    header: {
      width: '100%',
      marginBottom: Tokens.spacing[10],
      alignItems: 'center',
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
      textAlign: 'center',
      maxWidth: 400,
      lineHeight: Tokens.type.base * 1.5,
      letterSpacing: 1,
    },
    rationaleCard: {
      marginBottom: Tokens.spacing[6],
      width: '100%',
    },
    rationaleTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
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
    activeContainer: {
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      flex: 1,
      paddingVertical: Tokens.spacing[8],
    },
    activeHeader: {
      alignItems: 'center',
      width: '100%',
    },
    patternName: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[400],
      fontSize: Tokens.type['2xl'],
      fontWeight: '600',
      letterSpacing: 1,
    },
    breathingCircle: {
      width: BREATHING_CIRCLE_SIZE,
      height: BREATHING_CIRCLE_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      marginVertical: Tokens.spacing[8],
    },
    breathingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    circle: {
      width: INNER_CIRCLE_SIZE,
      height: INNER_CIRCLE_SIZE,
      borderRadius: Tokens.radii.full,
      backgroundColor: Tokens.colors.brand[600],
      position: 'absolute',
      opacity: 0.3,
      ...Platform.select({
        web: {
          transition: CIRCLE_TRANSITION,
        },
      }),
    },
    phaseText: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontSize: Tokens.type['2xl'],
      fontWeight: '700',
      zIndex: 1,
      marginBottom: Tokens.spacing[2],
      letterSpacing: 1,
    },
    countText: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: Tokens.colors.text.tertiary,
      fontSize: Tokens.type['5xl'],
      fontWeight: '800',
      zIndex: 1,
    },
    stopButton: {
      minWidth: 200,
    },
    patternsContainer: {
      width: '100%',
      gap: Tokens.spacing[4],
      maxWidth: 500,
    },
    patternButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    patternButtonHovered: {},
    patternButtonPressed: {},
    patternIcon: {
      width: Tokens.spacing[12],
      height: Tokens.spacing[12],
      borderRadius: isCosmic ? Tokens.radii.md : 0,
      backgroundColor: isCosmic
        ? 'rgba(11, 16, 34, 0.5)'
        : Tokens.colors.neutral.dark,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Tokens.spacing[4],
    },
    patternEmoji: {
      fontSize: Tokens.type['2xl'],
    },
    patternInfo: {
      flex: 1,
    },
    patternButtonText: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontSize: Tokens.type.lg,
      fontWeight: '600',
      marginBottom: 4,
      letterSpacing: 1,
    },
    patternDetails: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.tertiary,
      fontSize: Tokens.type.sm,
    },
  });

export default AnchorScreen;
