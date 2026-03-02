/**
 * P5PageTemplate - Persona 5 New Page Template
 *
 * Reusable template for creating new P5-styled screens.
 * Follows Section 6.1 from the Persona 5 UI Implementation Guide.
 *
 * @example
 * <P5PageTemplate
 *   title="NEW SCREEN"
 *   subtitle="Optional subtitle"
 *   showBack
 *   onBack={() => navigation.goBack()}
 *   scrollable={true}
 * >
 *   <YourContent />
 * </P5PageTemplate>
 */

import React, { memo, ReactNode } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { P5Screen, P5Header } from '../../ui/p5';
import { P5Spacing } from '../../theme/p5Tokens';

export interface P5PageTemplateProps {
  /** Page title (displayed in header) */
  title: string;

  /** Optional subtitle */
  subtitle?: string;

  /** Show back button in header */
  showBack?: boolean;

  /** Back button press handler */
  onBack?: () => void;

  /** Page content */
  children: ReactNode;

  /** Enable scrolling (default: true) */
  scrollable?: boolean;

  /** Right-side action element */
  rightAction?: ReactNode;

  /** Additional content container styles */
  contentStyle?: StyleProp<ViewStyle>;

  /** Additional scroll view content container styles */
  scrollContentStyle?: StyleProp<ViewStyle>;

  /** Test ID */
  testID?: string;
}

export const P5PageTemplate = memo(function P5PageTemplate({
  title,
  subtitle,
  showBack = false,
  onBack,
  children,
  scrollable = true,
  rightAction,
  contentStyle,
  scrollContentStyle,
  testID,
}: P5PageTemplateProps) {
  const insets = useSafeAreaInsets();

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + P5Spacing.xl },
        scrollContentStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  return (
    <P5Screen>
      <P5Header
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        onBack={onBack}
        rightAction={rightAction}
        variant="default"
      />
      {content}
    </P5Screen>
  );
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: P5Spacing.md,
  },
  content: {
    flex: 1,
    padding: P5Spacing.md,
  },
});

export default P5PageTemplate;
