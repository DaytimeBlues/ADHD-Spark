import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';
import { GlowCard } from '../ui/cosmic';

export const BrainDumpRationale: React.FC = () => {
    const { isCosmic } = useTheme();
    const styles = getStyles(isCosmic);

    const Title = <Text style={styles.rationaleTitle}>WHY THIS WORKS</Text>;
    const Body = (
        <Text style={styles.rationaleText}>
            Cognitive offloading is essential for ADHD working memory. Externalizing
            thoughts reduces mental clutter and prevents thought chasing. CBT/CADDI
            uses this to create space for prioritization and prevent overwhelm from
            competing demands.
        </Text>
    );

    if (isCosmic) {
        return (
            <GlowCard style={styles.rationaleCard} testID="rationale-card">
                {Title}
                {Body}
            </GlowCard>
        );
    }

    return (
        <View style={styles.rationaleCard}>
            {Title}
            {Body}
        </View>
    );
};

const getStyles = (isCosmic: boolean) =>
    StyleSheet.create({
        rationaleCard: {
            backgroundColor: isCosmic ? 'transparent' : Tokens.colors.neutral.darker,
            padding: Tokens.spacing[3],
            borderRadius: isCosmic ? 12 : Tokens.radii.none,
            borderWidth: 1,
            borderColor: isCosmic
                ? 'rgba(139, 92, 246, 0.2)'
                : Tokens.colors.neutral.border,
            borderLeftWidth: isCosmic ? 1 : 2,
            borderLeftColor: isCosmic
                ? 'rgba(139, 92, 246, 0.5)'
                : Tokens.colors.brand[500],
            marginBottom: isCosmic ? 16 : Tokens.spacing[5],
            ...(isCosmic
                ? Platform.select({
                    web: {
                        backdropFilter: 'blur(16px) saturate(180%)',
                        boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.1),
              0 8px 32px rgba(7, 7, 18, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
                    },
                })
                : {}),
        },
        rationaleTitle: {
            fontFamily: Tokens.type.fontFamily.mono,
            fontSize: Tokens.type.xxs,
            fontWeight: '700',
            color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
            letterSpacing: 1,
            marginBottom: isCosmic ? 4 : Tokens.spacing[2],
            textTransform: 'uppercase',
        },
        rationaleText: {
            fontFamily: Tokens.type.fontFamily.body,
            fontSize: Tokens.type.xs,
            color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
            lineHeight: 18,
            flexWrap: 'wrap',
        },
    });
