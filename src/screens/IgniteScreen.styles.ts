import { Platform, StyleSheet } from 'react-native';
import { CosmicTokens, Tokens } from '../theme/tokens';
import type { ThemeTokens } from '../theme/types';
import type { ThemeVariant } from '../theme/themeVariant';
import { isWeb } from '../utils/PlatformUtils';

const hexToRgba = (hex: string, alpha: number) => {
  const normalizedHex = hex.replace('#', '');
  const numericValue = Number.parseInt(normalizedHex, 16);
  /* eslint-disable no-bitwise */
  const red = (numericValue >> 16) & 255;
  const green = (numericValue >> 8) & 255;
  const blue = numericValue & 255;
  /* eslint-enable no-bitwise */

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const getIgniteScreenStyles = (
  variant: ThemeVariant,
  t: ThemeTokens,
) => {
  const isCosmic = variant === 'cosmic';
  const isNightAwe = variant === 'nightAwe';

  const titleColor = isNightAwe
    ? t.colors.text?.primary || Tokens.colors.text.primary
    : isCosmic
      ? '#EEF2FF'
      : Tokens.colors.text.primary;
  const textSecondary = isNightAwe
    ? t.colors.text?.secondary || Tokens.colors.text.secondary
    : isCosmic
      ? '#B9C2D9'
      : Tokens.colors.text.secondary;
  const subtleBorder = isNightAwe
    ? t.colors.nightAwe?.surface?.border || Tokens.colors.neutral.border
    : isCosmic
      ? 'rgba(42, 53, 82, 0.3)'
      : Tokens.colors.neutral.dark;
  const timerSurface = isNightAwe
    ? t.colors.nightAwe?.surface?.timer || Tokens.colors.neutral.darker
    : isCosmic
      ? '#111A33'
      : Tokens.colors.neutral.darker;
  const timerBorder = isNightAwe
    ? t.colors.nightAwe?.surface?.timerBorder || Tokens.colors.neutral.border
    : isCosmic
      ? 'rgba(185, 194, 217, 0.12)'
      : Tokens.colors.neutral.border;
  const timerActive = isNightAwe
    ? t.colors.nightAwe?.surface?.timerActive || Tokens.colors.neutral.dark
    : isCosmic
      ? 'rgba(17, 26, 51, 0.8)'
      : Tokens.colors.neutral.dark;
  const accent = isNightAwe
    ? t.colors.nightAwe?.feature?.ignite ||
      t.colors.semantic.secondary ||
      Tokens.colors.indigo.primary
    : isCosmic
      ? CosmicTokens.colors.semantic.primary
      : Tokens.colors.brand[500];

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    centerWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      width: '100%',
      maxWidth: Tokens.layout.maxWidth.prose,
      padding: Tokens.spacing[6],
      justifyContent: 'space-between',
      paddingVertical: Tokens.spacing[8],
    },
    restoringText: {
      marginTop: Tokens.spacing[4],
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      color: textSecondary,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    header: {
      alignItems: 'center',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderColor: subtleBorder,
      paddingBottom: Tokens.spacing[4],
    },
    title: {
      fontFamily:
        isCosmic || isNightAwe ? 'Space Grotesk' : Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.lg,
      fontWeight: '700',
      color: titleColor,
      letterSpacing: 1,
      textTransform: 'uppercase',
      ...((isCosmic || isNightAwe) && isWeb
        ? {
            textShadow: isNightAwe
              ? `0 0 16px ${hexToRgba(accent, 0.14)}`
              : `0 0 20px ${hexToRgba(
                  CosmicTokens.colors.semantic.primary,
                  0.3,
                )}`,
          }
        : {}),
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: timerSurface,
      borderWidth: 1,
      borderColor: timerBorder,
      borderRadius: isCosmic || isNightAwe ? 8 : 0,
      ...((isCosmic || isNightAwe) && isWeb
        ? {
            backdropFilter: 'blur(8px)',
            boxShadow: isNightAwe
              ? '0 8px 20px rgba(8, 17, 30, 0.14)'
              : `0 0 0 1px ${hexToRgba(
                  CosmicTokens.colors.semantic.primary,
                  0.1,
                )}, 0 4px 12px rgba(7, 7, 18, 0.3)`,
          }
        : {}),
    },
    statusText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      color: accent,
      letterSpacing: 1,
    },
    rationaleCard: {
      marginTop: Tokens.spacing[4],
      marginBottom: Tokens.spacing[2],
    },
    rationaleCardSurface: {
      marginTop: Tokens.spacing[4],
      marginBottom: Tokens.spacing[2],
      borderRadius: 24,
      padding: Tokens.spacing[4],
      backgroundColor: isNightAwe
        ? t.colors.nightAwe?.surface?.base || Tokens.colors.neutral.dark
        : timerSurface,
      borderWidth: 1,
      borderColor: subtleBorder,
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
    timerCard: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    timerSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timerOverlay: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timer: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 140,
      fontWeight: '200',
      color: titleColor,
      fontVariant: ['tabular-nums'],
      letterSpacing: -8,
      includeFontPadding: false,
    },
    nightAweTimerFrame: {
      width: 280,
      height: 280,
      borderRadius: 140,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: timerSurface,
      borderWidth: 1,
      borderColor: timerBorder,
      ...Platform.select({
        web: {
          boxShadow: '0 18px 40px rgba(8, 17, 30, 0.18)',
        },
        default: {
          shadowColor: '#08111E',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.16,
          shadowRadius: 18,
          elevation: 3,
        },
      }),
    },
    nightAweTimerFrameActive: {
      backgroundColor: timerActive,
      borderColor: hexToRgba(accent, 0.34),
    },
    nightAweTimerInner: {
      width: 232,
      height: 232,
      borderRadius: 116,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: hexToRgba(accent, 0.16),
      backgroundColor: 'rgba(8, 17, 30, 0.18)',
    },
    nightAweTimerDigits: {
      fontFamily: 'Space Grotesk',
      fontSize: 68,
      fontWeight: '500',
      letterSpacing: -2,
      color: titleColor,
      fontVariant: ['tabular-nums'],
    },
    nightAweTimerCaption: {
      marginTop: Tokens.spacing[2],
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: textSecondary,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
    },
    controls: {
      width: '100%',
      maxWidth: 360,
      alignSelf: 'center',
      gap: Tokens.spacing[3],
    },
    mainButton: {
      width: '100%',
      borderRadius: isCosmic || isNightAwe ? 8 : 0,
      height: 56,
    },
    nightAwePrimaryButton: {
      width: '100%',
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: accent,
    },
    nightAwePrimaryButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: t.colors.text?.onAccent || Tokens.colors.neutral.darkest,
      letterSpacing: 1,
    },
    nightAweSecondaryButton: {
      width: '100%',
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: timerBorder,
      backgroundColor: timerSurface,
    },
    nightAweSecondaryButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: titleColor,
      letterSpacing: 1,
    },
    secondaryControls: {
      flexDirection: 'row',
      gap: Tokens.spacing[3],
    },
    resetButton: {
      flex: 1,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: timerBorder,
      backgroundColor: timerSurface,
      borderRadius: isCosmic || isNightAwe ? 8 : 0,
      ...((isCosmic || isNightAwe) && isWeb
        ? {
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }
        : {}),
    },
    resetButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: textSecondary,
      letterSpacing: 1,
      fontWeight: '700',
    },
    soundButton: {
      flex: 1,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: timerBorder,
      backgroundColor: timerSurface,
      borderRadius: isCosmic || isNightAwe ? 8 : 0,
      ...((isCosmic || isNightAwe) && isWeb
        ? {
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
            cursor: 'pointer',
          }
        : {}),
    },
    soundButtonActive: {
      backgroundColor: timerActive,
      borderColor: isNightAwe
        ? accent
        : isCosmic
          ? hexToRgba(CosmicTokens.colors.semantic.primary, 0.4)
          : Tokens.colors.brand[500],
      ...((isCosmic || isNightAwe) && isWeb
        ? {
            boxShadow: isNightAwe
              ? `0 0 0 1px ${hexToRgba(accent, 0.16)}`
              : `0 0 0 1px ${hexToRgba(
                  CosmicTokens.colors.semantic.primary,
                  0.2,
                )}, 0 0 16px ${hexToRgba(
                  CosmicTokens.colors.semantic.primary,
                  0.15,
                )}`,
          }
        : {}),
    },
    soundButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      color: textSecondary,
      letterSpacing: 1,
      fontWeight: '700',
    },
    textActive: {
      color: titleColor,
    },
    buttonPressed: {
      opacity: 0.8,
      backgroundColor: timerActive,
    },
  });
};
