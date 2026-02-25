import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

export interface BrainDumpActionBarProps {
    itemCount: number;
    isSorting: boolean;
    onSort: () => void;
    onClear: () => void;
}

export const BrainDumpActionBar: React.FC<BrainDumpActionBarProps> = ({
    itemCount,
    isSorting,
    onSort,
    onClear,
}) => {
    const { isCosmic } = useTheme();
    const styles = getStyles(isCosmic);

    if (itemCount === 0) return null;

    return (
        <View style={styles.actionsBar}>
            <Text style={styles.countText}>{itemCount} ITEMS</Text>
            <View style={styles.actionsRight}>
                <Pressable
                    testID="brain-dump-ai-sort"
                    onPress={onSort}
                    disabled={isSorting}
                    accessibilityRole="button"
                    accessibilityLabel="AI sort"
                    accessibilityHint="Sorts and groups items using AI suggestions"
                    style={({ pressed, hovered }: any) => [
                        styles.actionButton,
                        hovered && styles.clearHovered,
                        pressed && styles.clearPressed,
                        isSorting && styles.actionButtonDisabled,
                    ]}
                >
                    <Text style={styles.aiSortText}>
                        {isSorting ? 'SORTING...' : 'AI_SORT'}
                    </Text>
                </Pressable>
                <Pressable
                    onPress={onClear}
                    accessibilityRole="button"
                    accessibilityLabel="Clear all items"
                    accessibilityHint="Opens a confirmation to remove all items"
                    style={({ pressed, hovered }: any) => [
                        styles.actionButton,
                        hovered && styles.clearHovered,
                        pressed && styles.clearPressed,
                    ]}
                >
                    <Text style={styles.clearText}>CLEAR</Text>
                </Pressable>
            </View>
        </View>
    );
};

const getStyles = (isCosmic: boolean) =>
    StyleSheet.create({
        actionsBar: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: Tokens.spacing[4],
            paddingHorizontal: Tokens.spacing[2],
            alignItems: 'center',
        },
        actionsRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: Tokens.spacing[4],
        },
        actionButton: {
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: isCosmic ? 8 : Tokens.radii.none,
            borderWidth: 1,
            borderColor: isCosmic
                ? 'rgba(185, 194, 217, 0.12)'
                : Tokens.colors.neutral.border,
            ...Platform.select({
                web: { transition: 'all 0.2s ease' },
            }),
        },
        actionButtonDisabled: {
            opacity: 0.5,
            pointerEvents: 'none',
        },
        clearHovered: {
            backgroundColor: isCosmic
                ? 'rgba(17, 26, 51, 0.6)'
                : Tokens.colors.neutral.dark,
            ...(isCosmic
                ? Platform.select({
                    web: {
                        boxShadow:
                            '0 0 0 1px rgba(139, 92, 246, 0.2), 0 0 16px rgba(139, 92, 246, 0.15), 0 8px 24px rgba(7, 7, 18, 0.5)',
                    },
                })
                : {}),
        },
        clearPressed: {
            opacity: 0.7,
        },
        countText: {
            fontFamily: Tokens.type.fontFamily.mono,
            color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
            fontSize: Tokens.type.xs,
            fontWeight: '700',
            letterSpacing: 1,
        },
        clearText: {
            fontFamily: Tokens.type.fontFamily.mono,
            color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
            fontSize: Tokens.type.xs,
            fontWeight: '700',
            letterSpacing: 1,
        },
        aiSortText: {
            fontFamily: Tokens.type.fontFamily.mono,
            color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
            fontSize: Tokens.type.xs,
            fontWeight: '700',
            letterSpacing: 1,
        },
    });
