import { Platform, StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../theme/types';
import type { ThemeVariant } from '../../theme/themeVariant';
import { Tokens } from '../../theme/tokens';

export const getInboxStyles = (
  variant: ThemeVariant,
  t: ThemeTokens = Tokens,
) => {
  const isCosmic = variant === 'cosmic';
  const isNightAwe = variant === 'nightAwe';
  const textColors = t.colors.text ?? Tokens.colors.text;

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    skeletonBgLinear: {
      backgroundColor: Tokens.colors.neutral.darker,
      borderColor: Tokens.colors.neutral.borderSubtle,
    },
    skeletonBgCosmic: {
      backgroundColor: 'rgba(17, 26, 51, 0.4)',
      borderColor: 'rgba(185, 194, 217, 0.08)',
    },
    skeletonBgNightAwe: {
      backgroundColor: '#16283F',
      borderColor: 'rgba(175, 199, 255, 0.16)',
    },
    skeletonBlockLinear: {
      backgroundColor: Tokens.colors.neutral[500],
    },
    skeletonBlockCosmic: {
      backgroundColor: 'rgba(185, 194, 217, 0.2)',
    },
    skeletonBlockNightAwe: {
      backgroundColor: 'rgba(175, 199, 255, 0.18)',
    },
    skeletonBadge: { width: 60, height: 16, borderRadius: 4 },
    skeletonTime: { width: 40, height: 12, borderRadius: 4 },
    skeletonContent: { marginVertical: 4 },
    skeletonText: { height: 12, borderRadius: 4 },
    w90: { width: '90%', marginBottom: 8 },
    w60: { width: '60%' },
    skeletonBtn: { width: 70, height: 28, borderRadius: 6 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Tokens.spacing[4],
      paddingVertical: Tokens.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: Tokens.colors.neutral.borderSubtle,
    },
    headerCosmic: { borderBottomColor: 'rgba(185, 194, 217, 0.12)' },
    headerNightAwe: { borderBottomColor: 'rgba(175, 199, 255, 0.16)' },
    closeBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtnText: { fontSize: 18, color: Tokens.colors.text.secondary },
    closeBtnTextCosmic: { color: '#B9C2D9' },
    closeBtnTextNightAwe: { color: textColors.secondary || '#C9D5E8' },
    closeBtnPlaceholder: { width: 44 },
    title: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.base,
      fontWeight: '700',
      color: Tokens.colors.text.primary,
      letterSpacing: 2,
      textTransform: 'uppercase',
      ...Platform.select({ web: { textShadow: 'none' } as object }),
    },
    titleCosmic: {
      color: '#EEF2FF',
      fontFamily: 'Space Grotesk',
      ...Platform.select({
        web: { textShadow: '0 0 16px rgba(139, 92, 246, 0.3)' } as object,
      }),
    },
    titleNightAwe: {
      color: textColors.primary || '#F6F1E7',
      fontFamily: 'Space Grotesk',
      ...Platform.select({
        web: { textShadow: '0 0 14px rgba(175, 199, 255, 0.18)' } as object,
      }),
    },
    tabs: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: Tokens.colors.neutral.borderSubtle,
      backgroundColor: Tokens.colors.neutral.darker,
    },
    tabsCosmic: {
      backgroundColor: '#0B1022',
      borderBottomColor: 'rgba(42, 53, 82, 0.3)',
    },
    tabsNightAwe: {
      backgroundColor: 'rgba(8, 17, 30, 0.82)',
      borderBottomColor: 'rgba(175, 199, 255, 0.12)',
    },
    tab: {
      flex: 1,
      minHeight: 44,
      justifyContent: 'center',
      paddingVertical: Tokens.spacing[3],
      alignItems: 'center',
    },
    tabActiveLinear: {
      borderBottomWidth: 2,
      borderBottomColor: Tokens.colors.indigo.primary,
    },
    tabActiveCosmic: {
      borderBottomWidth: 2,
      borderBottomColor: '#8B5CF6',
    },
    tabActiveNightAwe: {
      borderBottomWidth: 2,
      borderBottomColor: t.colors.nightAwe?.feature?.brainDump || '#AFC7FF',
    },
    tabText: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.xs,
      fontWeight: '600',
      color: Tokens.colors.text.tertiary,
      letterSpacing: 0.5,
    },
    tabTextCosmic: { color: '#6B7A9C' },
    tabTextNightAwe: { color: textColors.secondary || '#C9D5E8' },
    tabTextActiveLinear: { color: Tokens.colors.indigo.primary },
    tabTextActiveCosmic: { color: '#8B5CF6' },
    tabTextActiveNightAwe: {
      color: t.colors.nightAwe?.feature?.brainDump || '#AFC7FF',
    },
    listContent: { padding: Tokens.spacing[4], gap: Tokens.spacing[3] },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Tokens.spacing[8],
    },
    emptyText: {
      fontFamily: Tokens.type.fontFamily.body,
      fontSize: Tokens.type.base,
      color: Tokens.colors.text.tertiary,
      textAlign: 'center',
      lineHeight: 24,
    },
    emptyTextCosmic: { color: '#6B7A9C' },
    emptyTextNightAwe: { color: textColors.secondary || '#C9D5E8' },
    row: {
      borderRadius: 8,
      padding: Tokens.spacing[4],
      borderWidth: 1,
      gap: Tokens.spacing[3],
    },
    rowLinear: {
      backgroundColor: Tokens.colors.neutral.darker,
      borderColor: Tokens.colors.neutral.borderSubtle,
    },
    rowCosmic: {
      backgroundColor: 'rgba(17, 26, 51, 0.7)',
      borderColor: 'rgba(185, 194, 217, 0.12)',
      ...Platform.select({
        web: {
          backdropFilter: 'blur(12px)',
          boxShadow:
            '0 0 0 1px rgba(139, 92, 246, 0.06), 0 4px 16px rgba(7, 7, 18, 0.3)',
        } as object,
      }),
    },
    rowNightAwe: {
      backgroundColor: '#16283F',
      borderColor: 'rgba(175, 199, 255, 0.16)',
      ...Platform.select({
        web: {
          backdropFilter: 'blur(12px)',
          boxShadow:
            '0 0 0 1px rgba(175, 199, 255, 0.08), 0 6px 18px rgba(8, 17, 30, 0.28)',
        } as object,
      }),
    },
    rowReviewed: { opacity: 0.65 },
    rowMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Tokens.spacing[2],
      flexWrap: 'wrap',
    },
    sourceBadge: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '600',
      color: Tokens.colors.brand[500],
      backgroundColor: Tokens.colors.neutral.dark,
      paddingHorizontal: Tokens.spacing[2],
      paddingVertical: 2,
      borderRadius: 4,
      overflow: 'hidden',
    },
    sourceBadgeCosmic: {
      color: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.12)',
    },
    sourceBadgeNightAwe: {
      color: t.colors.nightAwe?.feature?.brainDump || '#AFC7FF',
      backgroundColor: 'rgba(175, 199, 255, 0.12)',
    },
    timestamp: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: Tokens.colors.text.tertiary,
    },
    timestampCosmic: { color: '#6B7A9C' },
    timestampNightAwe: { color: textColors.secondary || '#C9D5E8' },
    statusBadge: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 10,
      fontWeight: '700',
      paddingHorizontal: Tokens.spacing[2],
      paddingVertical: 2,
      borderRadius: 4,
      overflow: 'hidden',
      letterSpacing: 0.5,
    },
    statusBadgePromotedLinear: {
      color: Tokens.colors.success.main,
      backgroundColor: Tokens.colors.success.subtle,
    },
    statusBadgePromotedCosmic: {
      color: '#2DD4BF',
      backgroundColor: 'rgba(45, 212, 191, 0.12)',
    },
    statusBadgePromotedNightAwe: {
      color: '#D9BC92',
      backgroundColor: 'rgba(217, 188, 146, 0.12)',
    },
    statusBadgeDiscardedLinear: {
      color: Tokens.colors.error.main,
      backgroundColor: Tokens.colors.error.subtle,
    },
    statusBadgeDiscardedCosmic: {
      color: '#FB7185',
      backgroundColor: 'rgba(251, 113, 133, 0.1)',
    },
    statusBadgeDiscardedNightAwe: {
      color: '#FB7185',
      backgroundColor: 'rgba(251, 113, 133, 0.1)',
    },
    rawText: {
      fontFamily: Tokens.type.fontFamily.body,
      fontSize: Tokens.type.sm,
      color: Tokens.colors.text.primary,
      lineHeight: 20,
    },
    rawTextCosmic: { color: '#B9C2D9' },
    rawTextNightAwe: { color: textColors.primary || '#F6F1E7' },
    actions: { flexDirection: 'row', gap: Tokens.spacing[2], flexWrap: 'wrap' },
    actionBtn: {
      paddingHorizontal: Tokens.spacing[3],
      paddingVertical: Tokens.spacing[1],
      borderRadius: 6,
      borderWidth: 1,
    },
    actionBtnPressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
    actionBtnTaskLinear: {
      borderColor: Tokens.colors.indigo.primary,
      backgroundColor: Tokens.colors.indigo.subtle,
    },
    actionBtnTaskCosmic: {
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.12)',
    },
    actionBtnTaskNightAwe: {
      borderColor: t.colors.nightAwe?.feature?.brainDump || '#AFC7FF',
      backgroundColor: 'rgba(175, 199, 255, 0.12)',
    },
    actionBtnNoteLinear: {
      borderColor: Tokens.colors.brand[400],
      backgroundColor: 'transparent',
    },
    actionBtnNoteCosmic: {
      borderColor: '#B9C2D9',
      backgroundColor: 'rgba(185, 194, 217, 0.08)',
    },
    actionBtnNoteNightAwe: {
      borderColor: 'rgba(217, 188, 146, 0.4)',
      backgroundColor: 'rgba(217, 188, 146, 0.08)',
    },
    actionBtnDiscardLinear: {
      borderColor: Tokens.colors.error.main,
      backgroundColor: 'transparent',
    },
    actionBtnDiscardCosmic: {
      borderColor: 'rgba(251, 113, 133, 0.4)',
      backgroundColor: 'transparent',
    },
    actionBtnDiscardNightAwe: {
      borderColor: 'rgba(251, 113, 133, 0.4)',
      backgroundColor: 'transparent',
    },
    actionBtnText: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.xs,
      fontWeight: '600',
      color: Tokens.colors.text.primary,
      letterSpacing: 0.3,
    },
    actionBtnTextCosmic: { color: '#EEF2FF' },
    actionBtnTextNightAwe: { color: textColors.primary || '#F6F1E7' },
    actionBtnTextDiscard: { color: Tokens.colors.error.main },
    bgCosmic: { backgroundColor: '#070712' },
    bgLinear: { backgroundColor: Tokens.colors.neutral.darkest },
    bgNightAwe: { backgroundColor: 'transparent' },
  });
};
