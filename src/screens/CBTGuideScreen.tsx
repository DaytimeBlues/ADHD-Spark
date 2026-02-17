import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Linking,
  Platform,
} from 'react-native';
import { Tokens } from '../theme/tokens';
import { CADDI_OVERVIEW, CADDI_SOURCES } from '../config/caddi';
import { EvidenceBadge } from '../components/ui/EvidenceBadge';

type CBTCategory = {
  id: string;
  title: string;
  emoji: string;
  pillar: string;
  description: string;
  features: { name: string; route: string }[];
};

type ScreenNavigation = {
  navigate: (route: string) => void;
  goBack: () => void;
};

const CBTGuideScreen = ({ navigation }: { navigation: ScreenNavigation }) => {
  const categories: CBTCategory[] = [
    {
      id: 'activation',
      title: 'BEHAVIORAL ACTIVATION',
      emoji: '🎯',
      pillar: 'CADDI PILLAR 1',
      description:
        "Can't start? Feeling stuck? These tools help overcome initiation paralysis by taking small steps.",
      features: [
        { name: 'Ignite Timer', route: 'Focus' },
        { name: 'Pomodoro', route: 'Pomodoro' },
      ],
    },
    {
      id: 'organization',
      title: 'ORGANIZATION',
      emoji: '📋',
      pillar: 'CADDI PILLAR 2',
      description:
        'Overwhelmed by chaos? Break tasks down and externalize your working memory to reduce load.',
      features: [
        { name: 'Fog Cutter', route: 'FogCutter' },
        { name: 'Brain Dump', route: 'Tasks' },
      ],
    },
    {
      id: 'mindfulness',
      title: 'MINDFULNESS',
      emoji: '🧘',
      pillar: 'CADDI PILLAR 3',
      description:
        'Racing thoughts? Impulsive reactions? Build awareness and emotional regulation skills.',
      features: [{ name: 'Anchor Breathing', route: 'Anchor' }],
    },
    {
      id: 'tracking',
      title: 'SELF-TRACKING',
      emoji: '📊',
      pillar: 'CBT STRATEGY',
      description:
        'Recognize patterns in your mood, energy, and productivity over time to learn what works.',
      features: [
        { name: 'Daily Check In', route: 'CheckIn' },
        { name: 'Calendar', route: 'Calendar' },
      ],
    },
  ];

  const handleFeaturePress = (route: string) => {
    navigation.navigate(route);
  };

  const openSource = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.maxWidthWrapper}>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({
                pressed,
                hovered,
              }: {
                pressed: boolean;
                hovered?: boolean;
              }) => [
                styles.backButton,
                hovered && styles.backButtonHovered,
                pressed && styles.backButtonPressed,
              ]}
            >
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>
            <View>
              <Text style={styles.headerTitle}>CBT FOR ADHD</Text>
              <Text style={styles.headerSubtitle}>
                EVIDENCE-BASED STRATEGIES
              </Text>
            </View>
          </View>

          <View style={styles.compactCard}>
            <View style={styles.compactHeaderRow}>
              <Text style={styles.compactTitle}>{CADDI_OVERVIEW.title}</Text>
              <EvidenceBadge tier="clinical" label={CADDI_OVERVIEW.badge} />
            </View>

            <Text style={styles.compactDescription}>
              {CADDI_OVERVIEW.description}
            </Text>

            <View style={styles.evidenceRow}>
              {CADDI_OVERVIEW.bullets.map((bullet) => (
                <Text key={bullet} style={styles.evidenceBullet}>
                  • {bullet}
                </Text>
              ))}
            </View>

            <View style={styles.linksRow}>
              {CADDI_SOURCES.map((source) => (
                <Pressable
                  key={source.id}
                  onPress={() => openSource(source.url)}
                  style={({
                    pressed,
                    hovered,
                  }: {
                    pressed: boolean;
                    hovered?: boolean;
                  }) => [
                    styles.linkButton,
                    hovered && styles.linkButtonHovered,
                    pressed && styles.linkButtonPressed,
                  ]}
                >
                  <Text style={styles.linkButtonText}>{source.label}</Text>
                  <EvidenceBadge
                    tier={source.sourceType === 'rct' ? 'rct' : 'clinical'}
                    style={styles.linkBadge}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {categories.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <View style={styles.categoryTitleContainer}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categoryPillar}>{category.pillar}</Text>
                </View>
              </View>
              <Text style={styles.categoryDescription}>
                {category.description}
              </Text>
              <View style={styles.featuresRow}>
                {category.features.map((feature) => (
                  <Pressable
                    key={feature.route}
                    style={({
                      pressed,
                      hovered,
                    }: {
                      pressed: boolean;
                      hovered?: boolean;
                    }) => [
                      styles.featureButton,
                      hovered && styles.featureButtonHovered,
                      pressed && styles.featureButtonPressed,
                    ]}
                    onPress={() => handleFeaturePress(feature.route)}
                  >
                    <Text style={styles.featureButtonText}>
                      {feature.name.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Tokens.spacing[6],
    alignItems: 'center',
  },
  maxWidthWrapper: {
    width: '100%',
    maxWidth: Tokens.layout.maxWidth.prose,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Tokens.spacing[8],
    paddingTop: Tokens.spacing[2],
  },
  headerTitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type['4xl'],
    fontWeight: '800',
    color: Tokens.colors.text.primary,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.base,
    color: Tokens.colors.text.secondary,
    marginTop: 2,
    letterSpacing: 1,
  },
  backButton: {
    marginRight: Tokens.spacing[4],
    width: 40,
    height: 40,
    borderRadius: Tokens.radii.none, // Sharp
    backgroundColor: Tokens.colors.neutral.darker,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: {
        transition: Tokens.motion.transitions.base,
        cursor: 'pointer',
      },
    }),
  },
  backButtonHovered: {
    backgroundColor: Tokens.colors.neutral.dark,
    borderColor: Tokens.colors.text.tertiary,
    transform: [{ scale: Tokens.motion.scales.hover }],
  },
  backButtonPressed: {
    backgroundColor: Tokens.colors.neutral.darkest,
    transform: [{ scale: Tokens.motion.scales.press }],
  },
  backButtonText: {
    color: Tokens.colors.text.primary,
    fontSize: Tokens.type.h3,
    fontWeight: 'bold',
    marginTop: -2,
  },
  compactCard: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.none,
    padding: Tokens.spacing[4],
    marginBottom: Tokens.spacing[6],
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
  },
  compactHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Tokens.spacing[2],
    gap: Tokens.spacing[3],
  },
  compactTitle: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: Tokens.type.sm,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    letterSpacing: 1,
  },
  compactDescription: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.secondary,
    lineHeight: 18,
    marginBottom: Tokens.spacing[3],
  },
  evidenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing[3],
    marginBottom: Tokens.spacing[3],
  },
  evidenceBullet: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 10,
    color: Tokens.colors.brand[400],
    textTransform: 'uppercase',
  },
  linksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing[2],
  },
  linkButton: {
    backgroundColor: Tokens.colors.neutral.dark,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing[2],
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: Tokens.motion.transitions.base,
      },
    }),
  },
  linkButtonHovered: {
    borderColor: Tokens.colors.text.secondary,
    backgroundColor: Tokens.colors.neutral.darkest,
  },
  linkButtonPressed: {
    opacity: 0.7,
  },
  linkButtonText: {
    fontFamily: Tokens.type.fontFamily.mono,
    fontSize: 10,
    color: Tokens.colors.text.secondary,
    fontWeight: '600',
  },
  linkBadge: {
    marginLeft: -2,
  },
  categoryCard: {
    backgroundColor: Tokens.colors.neutral.darker,
    borderRadius: Tokens.radii.none, // Sharp
    padding: Tokens.spacing[6],
    marginBottom: Tokens.spacing[4],
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: {
        transition: Tokens.motion.transitions.base,
      },
    }),
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Tokens.spacing[4],
  },
  categoryEmoji: {
    fontSize: Tokens.type.h1,
    marginRight: Tokens.spacing[4],
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.lg,
    fontWeight: '700',
    color: Tokens.colors.text.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  categoryPillar: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.brand[400],
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryDescription: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.sm,
    color: Tokens.colors.text.secondary,
    lineHeight: Tokens.type.sm * 1.5,
    marginBottom: Tokens.spacing[6],
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing[2],
  },
  featureButton: {
    backgroundColor: Tokens.colors.neutral.dark,
    paddingVertical: Tokens.spacing[2],
    paddingHorizontal: Tokens.spacing[4],
    borderRadius: Tokens.radii.none, // Sharp
    borderWidth: 1,
    borderColor: Tokens.colors.neutral.borderSubtle,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: Tokens.motion.transitions.base,
      },
    }),
  },
  featureButtonHovered: {
    borderColor: Tokens.colors.brand[500],
    transform: [{ translateY: -2 }],
  },
  featureButtonPressed: {
    transform: [{ scale: Tokens.motion.scales.press }],
    backgroundColor: Tokens.colors.neutral.darker,
  },
  featureButtonText: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.xs,
    color: Tokens.colors.text.primary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default CBTGuideScreen;
