import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Tokens } from '../../theme/tokens';
import { useTheme } from '../../theme/ThemeProvider';

export interface DumpItem {
  id: string;
  text: string;
  createdAt: string;
  source: 'text' | 'audio';
  audioPath?: string;
}

interface BrainDumpItemProps {
  item: DumpItem;
  onDelete: (id: string) => void;
}

const HIT_SLOP = {
  top: Tokens.spacing[4],
  bottom: Tokens.spacing[4],
  left: Tokens.spacing[4],
  right: Tokens.spacing[4],
};

export const BrainDumpItem: React.FC<BrainDumpItemProps> = ({
  item,
  onDelete,
}) => {
  const { isCosmic } = useTheme();
  const styles = getStyles(isCosmic);

  return (
    <View style={styles.item} testID="brain-dump-item">
      <Text style={styles.itemText}>{item.text}</Text>
      <Pressable
        onPress={() => onDelete(item.id)}
        testID="delete-item-button"
        accessibilityRole="button"
        accessibilityLabel="Delete brain dump item"
        accessibilityHint="Removes this item from the list"
        style={({ pressed, hovered }: any) => [
          styles.deleteButton,
          hovered && styles.deleteButtonHovered,
          pressed && styles.deleteButtonPressed,
        ]}
        hitSlop={HIT_SLOP}
      >
        <Text style={styles.deleteText}>×</Text>
      </Pressable>
    </View>
  );
};

const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    item: {
      backgroundColor: isCosmic
        ? 'rgba(17, 26, 51, 0.4)'
        : Tokens.colors.neutral.darkest,
      borderRadius: isCosmic ? 8 : Tokens.radii.none,
      paddingHorizontal: isCosmic ? 12 : Tokens.spacing[3],
      paddingVertical: isCosmic ? 8 : Tokens.spacing[2],
      marginBottom: isCosmic ? 6 : -1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(139, 92, 246, 0.2)'
        : Tokens.colors.neutral.border,
      minHeight: isCosmic ? 40 : 48,
      ...(isCosmic
        ? Platform.select({
            web: {
              backdropFilter: 'blur(12px) saturate(150%)',
              boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.1),
              0 4px 20px rgba(7, 7, 18, 0.35),
              inset 0 1px 0 rgba(255, 255, 255, 0.04)
            `,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          })
        : Platform.select({
            web: {
              transition: 'all 0.2s ease',
            },
          })),
    },
    itemText: {
      flex: 1,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      lineHeight: 16,
      marginRight: isCosmic ? 8 : Tokens.spacing[3],
    },
    deleteButton: {
      padding: 0,
      borderRadius: isCosmic ? 6 : Tokens.radii.none,
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        web: { transition: 'all 0.2s ease' },
      }),
    },
    deleteButtonHovered: {
      backgroundColor: Tokens.colors.neutral.dark,
    },
    deleteButtonPressed: {
      backgroundColor: Tokens.colors.neutral.border,
    },
    deleteText: {
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      fontSize: Tokens.type.lg,
      fontWeight: '300',
      marginTop: -2,
    },
  });
