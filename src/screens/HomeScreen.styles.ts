import { StyleSheet } from 'react-native';
import { Tokens } from '../theme/tokens';
import { isWeb } from '../utils/PlatformUtils';

export const getStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollContent: {
      flexGrow: 1,
      padding: Tokens.spacing[4],
      alignItems: 'center',
    },
    maxWidthWrapper: {
      width: '100%',
      maxWidth: 960,
    },
    header: {
      marginBottom: Tokens.spacing[8],
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingTop: Tokens.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: isCosmic
        ? 'rgba(185, 194, 217, 0.08)'
        : Tokens.colors.neutral.dark,
      paddingBottom: Tokens.spacing[6],
    },
    title: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xl,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      letterSpacing: -1,
      ...(isCosmic && isWeb
        ? {
            textShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          }
        : {}),
    },
    systemStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    systemStatusText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 10,
      color: isCosmic
        ? 'rgba(185, 194, 217, 0.6)'
        : Tokens.colors.text.tertiary,
      marginRight: 6,
      letterSpacing: 1.5,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: isCosmic ? '#2DD4BF' : Tokens.colors.success.main,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isCosmic
        ? 'rgba(14, 20, 40, 0.8)'
        : Tokens.colors.neutral.darker,
      paddingHorizontal: Tokens.spacing[3],
      paddingVertical: 4,
      borderRadius: isCosmic ? 12 : Tokens.radii.none,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.border,
    },
    streakText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[500],
      letterSpacing: 1,
    },
    activationCard: {
      marginBottom: Tokens.spacing[6],
    },
    activationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Tokens.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: isCosmic
        ? 'rgba(185, 194, 217, 0.08)'
        : Tokens.colors.neutral.dark,
      paddingBottom: Tokens.spacing[2],
    },
    activationTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: isCosmic
        ? 'rgba(185, 194, 217, 0.8)'
        : Tokens.colors.text.secondary,
      letterSpacing: 1,
    },
    activationRate: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.lg,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
    },
    activationGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statBox: {
      flex: 1,
    },
    statLabel: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 10,
      color: isCosmic
        ? 'rgba(185, 194, 217, 0.6)'
        : Tokens.colors.text.tertiary,
      marginBottom: 2,
      letterSpacing: 0.5,
    },
    statValue: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.base,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontWeight: '700',
    },
    textSuccess: { color: isCosmic ? '#2DD4BF' : Tokens.colors.success.main },
    textError: { color: isCosmic ? '#FB7185' : Tokens.colors.error.main },
    textNeutral: { color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary },
    overlayCard: {
      marginBottom: Tokens.spacing[6],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    overlayCardActive: {},
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Tokens.spacing[3],
    },
    settingsButton: {
      width: 32,
      height: 32,
      borderRadius: isCosmic ? 8 : 0,
      backgroundColor: isCosmic
        ? 'rgba(14, 20, 40, 0.8)'
        : Tokens.colors.neutral.darker,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsButtonText: {
      fontSize: 18,
      color: isCosmic
        ? 'rgba(185, 194, 217, 0.8)'
        : Tokens.colors.text.secondary,
      marginTop: isWeb ? -2 : 0,
    },
    overlayTextGroup: {
      flex: 1,
    },
    overlayTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      letterSpacing: 1,
    },
    overlayStatus: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 10,
      color: isCosmic
        ? 'rgba(185, 194, 217, 0.6)'
        : Tokens.colors.text.secondary,
      marginTop: 2,
      letterSpacing: 0.5,
    },
    overlayStatusActive: {
      color: isCosmic ? '#2DD4BF' : Tokens.colors.success.main,
    },
    modesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: Tokens.spacing[3],
    },
    debugPanel: {
      marginBottom: Tokens.spacing[6],
      padding: Tokens.spacing[3],
      backgroundColor: isCosmic
        ? 'rgba(14, 20, 40, 0.8)'
        : Tokens.colors.neutral.darker,
      borderWidth: 1,
      borderColor: 'rgba(185, 194, 217, 0.12)',
      borderStyle: 'dashed',
      borderRadius: isCosmic ? 12 : 0,
    },
    debugTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 10,
      color: isCosmic ? '#6B7A9C' : Tokens.colors.text.tertiary,
      marginBottom: Tokens.spacing[2],
      textTransform: 'uppercase',
    },
    debugText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 10,
      color: isCosmic
        ? 'rgba(185, 194, 217, 0.6)'
        : Tokens.colors.text.secondary,
      marginBottom: 2,
    },
    debugButtonRow: {
      flexDirection: 'row',
      gap: Tokens.spacing[2],
      marginTop: Tokens.spacing[2],
    },
    debugButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: isCosmic
        ? 'rgba(14, 20, 40, 0.8)'
        : Tokens.colors.neutral.dark,
      borderWidth: 1,
      borderColor: 'rgba(185, 194, 217, 0.12)',
      borderRadius: isCosmic ? 6 : 0,
    },
    debugButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 10,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
    },
    negativeMarginTop24: {
      marginTop: -24,
    },
    zIndex10: {
      zIndex: 10,
    },
  });
