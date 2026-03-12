import { Platform, StyleSheet } from 'react-native';
import { Tokens } from '../theme/tokens';
import type { ThemeTokens } from '../theme/types';
import type { ThemeVariant } from '../theme/themeVariant';

export const getFogCutterScreenStyles = (variant: ThemeVariant, t: ThemeTokens) => {
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
      ? '#B9C2D9'
      : Tokens.colors.text.secondary;
  const textMuted = isNightAwe
    ? t.colors.text?.muted || Tokens.colors.text.tertiary
    : Tokens.colors.text.tertiary;
  const accent = isNightAwe
    ? t.colors.nightAwe?.feature?.fogCutter || t.colors.semantic.primary
    : isCosmic
      ? '#8B5CF6'
      : Tokens.colors.brand[500];
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
  const surfacePressed = isNightAwe
    ? t.colors.nightAwe?.surface?.sunken || Tokens.colors.neutral.darker
    : isCosmic
      ? '#0B1022'
      : Tokens.colors.neutral.darker;
  const borderSubtle = isNightAwe
    ? t.colors.nightAwe?.surface?.border || Tokens.colors.neutral.border
    : isCosmic
      ? 'rgba(42, 53, 82, 0.3)'
      : Tokens.colors.neutral.border;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: variant === 'linear' ? Tokens.colors.neutral.darkest : 'transparent',
    },
    scrollContent: {
      flex: 1,
      alignItems: 'center',
    },
    content: {
      flex: 1,
      width: '100%',
      maxWidth: Tokens.layout.maxWidth.prose,
      padding: Tokens.spacing[4],
    },
    header: {
      marginBottom: Tokens.spacing[6],
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      paddingBottom: Tokens.spacing[2],
      justifyContent: 'space-between',
    },
    title: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.lg,
      fontWeight: '700',
      color: textPrimary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    headerLine: {
      flex: 1,
      height: 1,
      backgroundColor: borderSubtle,
      marginLeft: Tokens.spacing[4],
    },
    rationaleCard: {
      marginBottom: Tokens.spacing[4],
    },
    rationaleCardSurface: {
      marginBottom: Tokens.spacing[4],
      borderRadius: isCosmic || isNightAwe ? 24 : 0,
      padding: Tokens.spacing[4],
      backgroundColor: surfaceBase,
      borderWidth: 1,
      borderColor: borderSubtle,
    },
    rationaleTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: accent,
      letterSpacing: 1,
      marginBottom: Tokens.spacing[2],
      textTransform: 'uppercase',
    },
    rationaleText: {
      fontFamily: Tokens.type.fontFamily.body,
      fontSize: Tokens.type.sm,
      color: textSecondary,
      lineHeight: 22,
      flexWrap: 'wrap',
    },
    creationCard: {
      marginBottom: Tokens.spacing[6],
    },
    creationCardSurface: {
      marginBottom: Tokens.spacing[6],
      borderRadius: isCosmic || isNightAwe ? 24 : 0,
      padding: Tokens.spacing[4],
      backgroundColor: surfaceRaised,
      borderWidth: 1,
      borderColor: borderSubtle,
    },
    creationHeader: {
      marginBottom: Tokens.spacing[4],
    },
    cardTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: textSecondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    inputGroup: {
      marginBottom: Tokens.spacing[4],
    },
    aiButtonContainer: {
      alignItems: 'flex-end',
    },
    input: {
      backgroundColor: surfaceBase,
      borderRadius: isCosmic || isNightAwe ? 8 : 0,
      paddingHorizontal: Tokens.spacing[3],
      color: textPrimary,
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      marginBottom: Tokens.spacing[3],
      height: 48,
      borderWidth: 1,
      borderColor: borderSubtle,
      ...Platform.select({
        web: { outlineStyle: 'none', transition: 'border-color 0.2s ease' },
      }),
    },
    marginBottom8: {
      marginBottom: 8,
    },
    inputFocused: {
      borderColor: accent,
      backgroundColor: surfaceRaised,
      ...Platform.select({
        web: isNightAwe
          ? { boxShadow: `0 0 0 1px ${accent}26` }
          : isCosmic
            ? {
                boxShadow:
                  '0 0 0 2px rgba(139,92,246,0.3), 0 0 30px rgba(139,92,246,0.25)',
              }
            : {},
      }),
    },
    addStepRow: {
      flexDirection: 'row',
      marginBottom: Tokens.spacing[3],
      gap: Tokens.spacing[2],
    },
    stepInput: {
      flex: 1,
      backgroundColor: surfaceBase,
      borderRadius: isCosmic || isNightAwe ? 8 : 0,
      paddingHorizontal: Tokens.spacing[3],
      color: textPrimary,
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      height: 48,
      borderWidth: 1,
      borderColor: borderSubtle,
      ...Platform.select({
        web: { outlineStyle: 'none', transition: 'border-color 0.2s ease' },
      }),
    },
    addButton: {
      width: 48,
      height: 48,
      paddingHorizontal: 0,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: isCosmic || isNightAwe ? 8 : 0,
    },
    previewContainer: {
      backgroundColor: surfaceBase,
      borderRadius: isCosmic || isNightAwe ? 8 : 0,
      padding: Tokens.spacing[4],
      marginBottom: Tokens.spacing[3],
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: borderSubtle,
    },
    previewTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: textMuted,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      marginBottom: Tokens.spacing[2],
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    shimmer: {
      marginTop: Tokens.spacing[2],
    },
    saveButton: {
      marginTop: Tokens.spacing[2],
    },
    primaryButton: {
      marginTop: Tokens.spacing[2],
      minHeight: 48,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: accent,
      borderWidth: 1,
      borderColor: accent,
    },
    primaryButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      letterSpacing: 1,
      color: t.colors.text?.onAccent || '#08111E',
      textTransform: 'uppercase',
    },
    secondaryButton: {
      minHeight: 36,
      paddingHorizontal: Tokens.spacing[3],
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: surfaceBase,
      borderWidth: 1,
      borderColor: borderSubtle,
    },
    secondaryButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      letterSpacing: 1,
      color: textPrimary,
      textTransform: 'uppercase',
    },
    divider: {
      height: 1,
      backgroundColor: borderSubtle,
      width: '100%',
      marginBottom: Tokens.spacing[6],
    },
    sectionHeader: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: Tokens.spacing[3],
    },
    taskList: {
      flex: 1,
    },
    listContent: {
      paddingBottom: Tokens.spacing[20],
    },
    taskCard: {
      backgroundColor: surfaceRaised,
      borderRadius: isCosmic || isNightAwe ? 12 : 0,
      padding: Tokens.spacing[4],
      marginBottom: Tokens.spacing[2],
      borderWidth: 1,
      borderColor: borderSubtle,
      minHeight: 64,
      justifyContent: 'center',
      ...Platform.select({
        web: {
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        },
      }),
    },
    taskCardHovered: {
      borderColor: accent,
      zIndex: 1,
      ...Platform.select({
        web: isNightAwe
          ? { boxShadow: '0 8px 20px rgba(8, 17, 30, 0.12)' }
          : isCosmic
            ? {
                boxShadow:
                  '0 0 0 1px rgba(139,92,246,0.3), 0 0 20px rgba(139,92,246,0.2)',
              }
            : {},
      }),
    },
    taskCardPressed: {
      backgroundColor: surfacePressed,
    },
    taskCardCompleted: {
      opacity: 0.5,
      backgroundColor: surfacePressed,
    },
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Tokens.spacing[1],
    },
    taskText: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: textPrimary,
      fontSize: Tokens.type.base,
      fontWeight: '700',
      flex: 1,
      marginRight: Tokens.spacing[2],
    },
    completed: {
      textDecorationLine: 'line-through',
      color: textSecondary,
    },
    doneBadge: {
      backgroundColor: surfaceBase,
      color: textSecondary,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: isCosmic || isNightAwe ? 8 : 0,
      overflow: 'hidden',
      fontFamily: Tokens.type.fontFamily.mono,
    },
    activeStepContainer: {
      marginTop: Tokens.spacing[2],
      paddingLeft: Tokens.spacing[2],
      borderLeftWidth: 1,
      borderLeftColor: accent,
    },
    activeStepLabel: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      color: textMuted,
      marginBottom: 1,
      letterSpacing: 0.5,
    },
    activeStepText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: textSecondary,
    },
    stepCountText: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: textMuted,
      fontSize: Tokens.type.xs,
      letterSpacing: 1,
    },
    progressContainer: {
      marginTop: Tokens.spacing[2],
    },
    progressBar: {
      marginBottom: Tokens.spacing[2],
    },
    loadingContainer: {
      padding: Tokens.spacing[8],
      alignItems: 'center',
      gap: Tokens.spacing[4],
    },
    loadingText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: textSecondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    emptyState: {
      marginTop: Tokens.spacing[8],
      opacity: 0.5,
    },
    guideBanner: {
      backgroundColor: surfaceBase,
      borderWidth: 1,
      borderColor: accent,
      padding: Tokens.spacing[3],
      marginBottom: Tokens.spacing[6],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Tokens.spacing[4],
      borderRadius: isCosmic || isNightAwe ? 12 : 0,
    },
    guideContent: {
      flex: 1,
    },
    guideTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: accent,
      marginBottom: Tokens.spacing[1],
      letterSpacing: 1,
    },
    guideText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: textPrimary,
    },
    guideButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: borderSubtle,
      backgroundColor: surfaceRaised,
      borderRadius: isCosmic || isNightAwe ? 8 : 0,
    },
    guideButtonPressed: {
      backgroundColor: surfacePressed,
    },
    guideButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      fontWeight: '700',
      color: textPrimary,
      textTransform: 'uppercase',
    },
  });
};
