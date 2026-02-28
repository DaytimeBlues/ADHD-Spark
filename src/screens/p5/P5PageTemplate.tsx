import React from 'react';
import { ScrollView, View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { P5Screen } from '../../ui/p5/P5Screen';
import { P5Header } from '../../ui/p5/P5Header';
import { useP5Theme } from '../../theme/p5Tokens';

export interface P5PageTemplateProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: ViewStyle;
}

export const P5PageTemplate: React.FC<P5PageTemplateProps> = ({
  title,
  showBack = false,
  onBack,
  children,
  scrollable = true,
  contentContainerStyle,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useP5Theme();

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, theme.spacing.xl) },
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View
        style={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, theme.spacing.xl) },
          contentContainerStyle,
        ]}
      >
        {children}
      </View>
    );
  };

  return (
    <P5Screen preset="fixed" backgroundColor={theme.colors.background.primary}>
      <P5Header
        title={title}
        showBack={showBack}
        onBack={onBack}
        style={{ paddingTop: Math.max(insets.top, theme.spacing.m) }}
      />
      {renderContent()}
    </P5Screen>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
});
