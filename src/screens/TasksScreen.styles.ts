import { Platform, StyleSheet } from 'react-native';
import { Tokens } from '../theme/tokens';
import type { ThemeTokens } from '../theme/types';
import type { ThemeVariant } from '../theme/themeVariant';

export const getTasksScreenStyles = (variant: ThemeVariant, t: ThemeTokens) => {
  const isCosmic = variant === 'cosmic';
  const isNightAwe = variant === 'nightAwe';
  const textPrimary = isNightAwe
    ? t.colors.text?.primary || Tokens.colors.text.primary
    : isCosmic
      ? '#EEF2FF'
      : Tokens.colors.text.primary;
  const textSecondary = isNightAwe
    ? t.colors.text?.secondary || Tokens.colors.text.secondary
    : isCosmic
      ? 'rgba(238, 242, 255, 0.5)'
      : Tokens.colors.text.secondary;
  const textMuted = isNightAwe
    ? t.colors.text?.muted || Tokens.colors.text.tertiary
    : isCosmic
      ? 'rgba(238, 242, 255, 0.4)'
      : Tokens.colors.text.tertiary;
  const surfaceBase = isNightAwe
    ? t.colors.nightAwe?.surface?.base || Tokens.colors.neutral.darkest
    : isCosmic
      ? '#0B1022'
      : Tokens.colors.neutral.darkest;
  const surfaceRaised = isNightAwe
    ? t.colors.nightAwe?.surface?.raised || Tokens.colors.neutral.darker
    : isCosmic
      ? '#111A33'
      : Tokens.colors.neutral.darkest;
  const surfaceBorder = isNightAwe
    ? t.colors.nightAwe?.surface?.border || 'rgba(217, 228, 242, 0.14)'
    : isCosmic
      ? 'rgba(185, 194, 217, 0.18)'
      : Tokens.colors.neutral.border;
  const accent = isNightAwe
    ? t.colors.nightAwe?.feature?.tasks || t.colors.semantic.primary
    : t.colors.semantic.primary;

  return StyleSheet.create({
    header: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: textPrimary,
      letterSpacing: 2,
    },
    headerSubtitle: {
      fontSize: 10,
      fontWeight: '600',
      color: accent,
      letterSpacing: 3,
      marginTop: -2,
    },
    backButton: {
      marginRight: 16,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backIcon: {
      color: textPrimary,
      fontSize: 24,
    },
    syncButton: {
      paddingHorizontal: 12,
    },
    utilityButton: {
      minHeight: 36,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: surfaceBase,
      borderWidth: 1,
      borderColor: surfaceBorder,
    },
    utilityButtonText: {
      fontSize: 10,
      fontWeight: '700',
      color: textPrimary,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
    },
    statCardSurface: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: surfaceBorder,
      backgroundColor: surfaceRaised,
    },
    statValue: {
      fontSize: 28,
      fontWeight: '700',
    },
    statValueCompleted: {
      color: textPrimary,
    },
    statLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: textSecondary,
      letterSpacing: 1.5,
      marginTop: 4,
    },
    addTaskCard: {
      marginTop: 24,
      borderRadius: 16,
    },
    addTaskCardSurface: {
      marginTop: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: surfaceBorder,
      backgroundColor: surfaceRaised,
    },
    addTaskContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 16,
      paddingRight: 8,
      paddingVertical: 8,
    },
    addTaskInput: {
      flex: 1,
      color: textPrimary,
      fontSize: 16,
      paddingVertical: 8,
    },
    addTaskButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    addTaskButtonSurface: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: accent,
      borderWidth: 1,
      borderColor: accent,
    },
    addTaskButtonText: {
      color: t.colors.text?.onAccent || '#08111E',
      fontSize: 18,
      fontWeight: '700',
      lineHeight: 18,
    },
    filterTabs: {
      flexDirection: 'row',
      marginTop: 24,
      gap: 8,
      marginBottom: 8,
    },
    filterTab: {
      flex: 1,
    },
    filterTabButton: {
      flex: 1,
      minHeight: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: surfaceBorder,
      backgroundColor: surfaceBase,
    },
    filterTabButtonActive: {
      backgroundColor: accent,
      borderColor: accent,
    },
    filterTabButtonText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: textPrimary,
    },
    filterTabButtonTextActive: {
      color: t.colors.text?.onAccent || '#08111E',
    },
    taskCard: {
      marginTop: 12,
    },
    taskCardSurface: {
      marginTop: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: surfaceBorder,
      backgroundColor: surfaceRaised,
      padding: 16,
      ...Platform.select({
        web: {
          transition: 'border-color 0.2s ease, transform 0.2s ease',
        },
      }),
    },
    taskCardSurfaceCompleted: {
      opacity: 0.72,
      backgroundColor: surfaceBase,
    },
    taskContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    checkboxDefault: {
      borderColor: surfaceBorder,
    },
    checkmark: {
      color: '#FFFFFF',
      fontWeight: '900',
      fontSize: 12,
    },
    taskInfo: {
      flex: 1,
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: textPrimary,
    },
    taskTitleCompleted: {
      textDecorationLine: 'line-through',
      color: textMuted,
    },
    taskMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    priorityLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    dueDate: {
      fontSize: 11,
      fontWeight: '400',
      color: textMuted,
      marginLeft: 8,
    },
    deleteButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteIcon: {
      color: textMuted,
      fontSize: 18,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '700',
      color: textPrimary,
    },
    emptySubtext: {
      fontSize: 14,
      fontWeight: '400',
      color: textSecondary,
      marginTop: 4,
      textAlign: 'center',
    },
  });
};
