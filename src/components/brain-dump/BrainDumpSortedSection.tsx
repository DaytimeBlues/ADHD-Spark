import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/useTheme';
import { SortedItem } from '../../services/AISortService';

interface BrainDumpSortedSectionProps {
  groupedItems: Array<{ category: string; items: SortedItem[] }>;
  getPriorityStyle: (priority: SortedItem['priority']) => object;
}

export const BrainDumpSortedSection: React.FC<BrainDumpSortedSectionProps> = ({
  groupedItems,
  getPriorityStyle,
}) => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);

  if (groupedItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.sortedSection}>
      <Text style={styles.sortedHeader}>AI_SUGGESTIONS</Text>
      {groupedItems.map(({ category, items: catItems }) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {catItems.map((item, idx) => (
            <View key={idx} style={styles.sortedItemRow}>
              <Text style={styles.sortedItemText}>
                {item.duration ? `[${item.duration}] ` : ''}
                {item.text}
              </Text>
              <View
                style={[styles.priorityBadge, getPriorityStyle(item.priority)]}
              >
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    sortedSection: {
      marginTop: Tokens.spacing[6],
      paddingTop: Tokens.spacing[4],
      borderTopWidth: 1,
      borderTopColor: isCosmic
        ? 'rgba(139, 92, 246, 0.2)'
        : Tokens.colors.neutral.border,
    },
    sortedHeader: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      marginBottom: Tokens.spacing[4],
      letterSpacing: 1,
    },
    categorySection: {
      marginBottom: Tokens.spacing[4],
    },
    categoryTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      textTransform: 'uppercase',
      marginBottom: Tokens.spacing[2],
      backgroundColor: isCosmic
        ? 'rgba(139, 92, 246, 0.1)'
        : Tokens.colors.neutral.dark,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
    },
    sortedItemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 4,
      marginBottom: 0,
    },
    sortedItemText: {
      flex: 1,
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      lineHeight: Tokens.type.sm * 1.5,
      marginRight: Tokens.spacing[3],
    },
    priorityBadge: {
      paddingHorizontal: 6,
      paddingVertical: 0,
      borderRadius: isCosmic ? 4 : Tokens.radii.none,
      minWidth: 40,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.border,
    },
    priorityText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      textTransform: 'uppercase',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
    },
  });
