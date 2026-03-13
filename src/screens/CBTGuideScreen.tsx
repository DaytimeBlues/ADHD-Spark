import React, { useMemo } from 'react';
import {
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { CosmicBackground } from '../ui/cosmic';
import { NightAweBackground } from '../ui/nightAwe';
import { buildCbtCategories } from './cbt-guide/cbtGuideData';
import { CbtGuideCategoryCard } from './cbt-guide/CbtGuideCategoryCard';
import { CbtGuideOverviewCard } from './cbt-guide/CbtGuideOverviewCard';
import { getCbtGuideStyles } from './cbt-guide/cbtGuideStyles';

type ScreenNavigation = {
  navigate: (route: string) => void;
  goBack: () => void;
};

const CBTGuideScreen = ({ navigation }: { navigation: ScreenNavigation }) => {
  const { isCosmic, isNightAwe, variant, t } = useTheme();
  const styles = getCbtGuideStyles(variant, t);
  const categories = useMemo(() => buildCbtCategories(), []);

  const content = (
    <SafeAreaView
      style={styles.container}
      accessibilityLabel="CBT guide screen"
      accessibilityRole="summary"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.maxWidthWrapper}>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={(state) => [
                styles.backButton,
                (state as { pressed: boolean; hovered?: boolean }).hovered &&
                  styles.backButtonHovered,
                state.pressed && styles.backButtonPressed,
              ]}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Text style={styles.backButtonText}>{'<'}</Text>
            </Pressable>
            <View>
              <Text style={styles.headerTitle}>CBT FOR ADHD</Text>
              <Text style={styles.headerSubtitle}>
                EVIDENCE-BASED STRATEGIES
              </Text>
            </View>
          </View>

          <CbtGuideOverviewCard
            variant={variant}
            t={t}
            onOpenSource={(url) => Linking.openURL(url)}
          />

          {categories.map((category) => (
            <CbtGuideCategoryCard
              key={category.id}
              category={category}
              variant={variant}
              t={t}
              onFeaturePress={(route) => navigation.navigate(route)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  if (isNightAwe) {
    return (
      <NightAweBackground
        variant="focus"
        activeFeature="cbtGuide"
        motionMode="idle"
      >
        {content}
      </NightAweBackground>
    );
  }

  if (isCosmic) {
    return <CosmicBackground variant="ridge">{content}</CosmicBackground>;
  }

  return content;
};

export default CBTGuideScreen;
