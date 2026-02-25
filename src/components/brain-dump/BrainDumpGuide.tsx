import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

export interface BrainDumpGuideProps {
    showGuide: boolean;
    onDismiss: () => void;
}

export const BrainDumpGuide: React.FC<BrainDumpGuideProps> = ({
    showGuide,
    onDismiss,
}) => {
    const { isCosmic } = useTheme();
    const styles = getStyles(isCosmic);

    if (!showGuide) return null;

    return (
        <View style={styles.guideBanner}>
            <View style={styles.guideContent}>
                <Text style={styles.guideTitle}>DATA_CAPTURED.</Text>
                <Text style={styles.guideText}>NEXT: PROCESS_IN_FOG_CUTTER.</Text>
            </View>
            <Pressable
                onPress={onDismiss}
                style={({ pressed }: any) => [
                    styles.guideButton,
                    pressed && styles.guideButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Dismiss guidance"
            >
                <Text style={styles.guideButtonText}>ACK</Text>
            </Pressable>
        </View>
    );
};

const getStyles = (isCosmic: boolean) =>
    StyleSheet.create({
        guideBanner: {
            backgroundColor: isCosmic
                ? 'rgba(17, 26, 51, 0.45)'
                : Tokens.colors.neutral.dark,
            borderWidth: 1,
            borderColor: isCosmic
                ? 'rgba(139, 92, 246, 0.35)'
                : Tokens.colors.brand[500],
            borderRadius: isCosmic ? 10 : Tokens.radii.none,
            padding: isCosmic ? 10 : Tokens.spacing[3],
            marginBottom: isCosmic ? 16 : Tokens.spacing[5],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: isCosmic ? 8 : Tokens.spacing[3],
            ...(isCosmic
                ? Platform.select({
                    web: {
                        backdropFilter: 'blur(20px) saturate(160%)',
                        boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.2),
              0 6px 28px rgba(7, 7, 18, 0.45),
              inset 0 1px 0 rgba(255, 255, 255, 0.06)
            `,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                })
                : {}),
        },
        guideContent: {
            flex: 1,
        },
        guideTitle: {
            fontFamily: Tokens.type.fontFamily.mono,
            fontSize: Tokens.type.xxs,
            fontWeight: '700',
            color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
            marginBottom: isCosmic ? 2 : Tokens.spacing[1],
            letterSpacing: 1,
        },
        guideText: {
            fontFamily: Tokens.type.fontFamily.mono,
            fontSize: Tokens.type.xxs,
            lineHeight: 14,
            color: isCosmic ? '#B9C2D9' : Tokens.colors.text.primary,
        },
        guideButton: {
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderWidth: 1,
            borderColor: isCosmic
                ? 'rgba(185, 194, 217, 0.12)'
                : Tokens.colors.neutral.border,
            backgroundColor: isCosmic
                ? 'rgba(17, 26, 51, 0.6)'
                : Tokens.colors.neutral.darkest,
            borderRadius: isCosmic ? 8 : Tokens.radii.none,
            ...(isCosmic
                ? Platform.select({
                    web: {
                        backdropFilter: 'blur(8px)',
                    },
                })
                : {}),
        },
        guideButtonPressed: {
            backgroundColor: Tokens.colors.neutral.darker,
        },
        guideButtonText: {
            fontFamily: Tokens.type.fontFamily.mono,
            fontSize: Tokens.type.xxs,
            fontWeight: '700',
            color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
            textTransform: 'uppercase',
        },
    });
