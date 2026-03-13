import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LoggerService } from '../../../services/LoggerService';
import { useTheme } from '../../../theme/useTheme';
import { Tokens } from '../../../theme/tokens';
import { GlowCard } from '../../../ui/cosmic';
import type { ThemeOption } from '../types';

type ThemeSectionProps = {
  themeOptions: ThemeOption[];
  onSelectTheme: (variant: ThemeOption['variant']) => Promise<void>;
};

export const ThemeSection = ({
  themeOptions,
  onSelectTheme,
}: ThemeSectionProps) => {
  const { isNightAwe, t } = useTheme();
  const styles = getStyles(
    isNightAwe,
    t.colors.text?.primary,
    t.colors.text?.secondary,
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>APPEARANCE</Text>

      {themeOptions.map((option, index) => (
        <View key={option.variant}>
          <GlowCard
            glow={option.selected ? 'soft' : 'none'}
            onPress={() => {
              onSelectTheme(option.variant).catch((error) => {
                LoggerService.error({
                  service: 'ThemeSection',
                  operation: 'onSelectTheme',
                  message: 'Theme selection failed',
                  error,
                  context: { variant: option.variant },
                });
              });
            }}
            style={styles.themeOption}
            accessibilityLabel={`Select ${option.label} theme`}
            accessibilityHint={`Switches to the ${option.label} theme`}
            accessibilityRole="button"
            accessibilityState={{ selected: option.selected }}
          >
            <View style={styles.themeOptionContent}>
              <View style={styles.themePreview}>
                <View
                  style={[
                    styles.themePreviewBox,
                    { backgroundColor: option.preview.background },
                  ]}
                >
                  <View
                    style={[
                      styles.themePreviewAccent,
                      { backgroundColor: option.preview.accent },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.themeText}>
                <Text style={styles.themeTitle}>{option.label}</Text>
                <Text style={styles.themeDescription}>
                  {option.description}
                </Text>
              </View>

              {option.selected ? (
                <Text style={styles.checkmark}>OK</Text>
              ) : null}
            </View>
          </GlowCard>

          {index < themeOptions.length - 1 ? (
            <View style={styles.spacer8} />
          ) : null}
        </View>
      ))}
    </View>
  );
};

const getStyles = (
  isNightAwe: boolean,
  primaryText: string | undefined = Tokens.colors.text.primary,
  secondaryText: string | undefined = Tokens.colors.text.secondary,
) =>
  StyleSheet.create({
    section: {
      marginBottom: Tokens.spacing[6],
    },
    sectionTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 10,
      fontWeight: '700',
      color: isNightAwe
        ? secondaryText || '#C9D5E8'
        : Tokens.colors.text.secondary,
      letterSpacing: 1,
      marginBottom: Tokens.spacing[2],
    },
    themeOption: {
      marginBottom: 0,
    },
    themeOptionContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    themePreview: {
      marginRight: Tokens.spacing[4],
    },
    themePreviewBox: {
      width: 48,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    themePreviewAccent: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    themeText: {
      flex: 1,
    },
    themeTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.base,
      fontWeight: '700',
      color: isNightAwe ? primaryText || '#F6F1E7' : Tokens.colors.text.primary,
      marginBottom: 2,
    },
    themeDescription: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.sm,
      color: isNightAwe
        ? secondaryText || '#C9D5E8'
        : Tokens.colors.text.secondary,
    },
    spacer8: {
      height: 8,
    },
    checkmark: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 12,
      fontWeight: '700',
      color: Tokens.colors.success.main,
      marginLeft: Tokens.spacing[2],
    },
  });
