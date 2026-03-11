import { Platform, StyleSheet } from 'react-native';
import { CosmicTokens, Tokens } from '../theme/tokens';
import { isWeb } from '../utils/PlatformUtils';

const HOVER_SHADOW = '0 0 0 rgba(0,0,0,0)';

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

export const getCheckInScreenStyles = (isCosmic: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    webContainer: {
      flex: 1,
      width: '100%',
      maxWidth: Tokens.layout.maxWidth.prose,
      alignSelf: 'center',
    },
    content: {
      flexGrow: 1,
      padding: Tokens.spacing[6],
    },
    title: {
      fontFamily: isCosmic ? 'Space Grotesk' : Tokens.type.fontFamily.sans,
      fontSize: Tokens.type['4xl'],
      fontWeight: '800',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      marginBottom: Tokens.spacing[2],
      letterSpacing: 2,
      textAlign: 'center',
      ...(isCosmic && isWeb
        ? {
            textShadow: `0 0 20px ${hexToRgba(
              CosmicTokens.colors.semantic.primary,
              0.3,
            )}`,
          }
        : {}),
    },
    subtitle: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.base,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      marginBottom: Tokens.spacing[4],
      textAlign: 'center',
      letterSpacing: 1,
    },
    rationaleCard: {
      marginBottom: Tokens.spacing[8],
    },
    rationaleTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      color: isCosmic
        ? CosmicTokens.colors.semantic.success
        : Tokens.colors.brand[500],
      letterSpacing: 1,
      marginBottom: Tokens.spacing[2],
      textTransform: 'uppercase',
    },
    rationaleText: {
      fontFamily: Tokens.type.fontFamily.body,
      fontSize: Tokens.type.sm,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.secondary,
      lineHeight: 22,
      flexWrap: 'wrap',
    },
    section: {
      marginBottom: Tokens.spacing[8],
    },
    sectionTitle: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      fontSize: Tokens.type.sm,
      fontWeight: '600',
      marginBottom: Tokens.spacing[4],
      letterSpacing: 1,
    },
    options: {
      flexDirection: 'column',
      gap: Tokens.spacing[3],
    },
    option: {
      padding: Tokens.spacing[5],
      borderRadius: isCosmic ? 20 : Tokens.radii.none,
      backgroundColor: isCosmic
        ? 'rgba(14, 20, 40, 0.6)'
        : Tokens.colors.neutral.darker,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(185, 194, 217, 0.12)'
        : Tokens.colors.neutral.borderSubtle,
      ...Platform.select({
        web: {
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          ...(isCosmic
            ? {
                backdropFilter: 'blur(8px)',
              }
            : {}),
        },
      }),
    },
    optionHovered: {
      borderColor: isCosmic
        ? hexToRgba(CosmicTokens.colors.semantic.primary, 0.5)
        : Tokens.colors.text.tertiary,
      transform: [{ translateY: -2 }],
      ...Platform.select({
        web: {
          boxShadow: HOVER_SHADOW,
        },
      }),
    },
    optionPressed: {
      transform: [{ scale: Tokens.motion.scales.press }],
      backgroundColor: isCosmic ? '#111A33' : Tokens.colors.neutral.dark,
    },
    selected: {
      borderColor: isCosmic
        ? CosmicTokens.colors.semantic.primary
        : Tokens.colors.brand[500],
      borderTopColor: isCosmic ? CosmicTokens.colors.brand[400] : undefined,
      borderTopWidth: isCosmic ? 2 : 1,
      backgroundColor: isCosmic
        ? hexToRgba(CosmicTokens.colors.semantic.primary, 0.18)
        : Tokens.colors.brand[900],
      transform: [{ translateY: -4 }, { scale: 1.01 }],
      ...Tokens.elevation.none,
      ...Platform.select({
        web: isCosmic
          ? {
              boxShadow: `0 0 0 2px ${hexToRgba(
                CosmicTokens.colors.semantic.primary,
                0.4,
              )}, 0 0 20px ${hexToRgba(
                CosmicTokens.colors.semantic.primary,
                0.25,
              )}`,
            }
          : {
              boxShadow: '0 0 0 0',
            },
      }),
    },
    optionContent: {
      flexDirection: 'column',
      gap: 2,
    },
    quote: {
      fontFamily: isCosmic
        ? '"Space Grotesk", sans-serif'
        : Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.lg,
      fontStyle: 'italic',
      color: isCosmic
        ? 'rgba(238, 242, 255, 0.78)'
        : Tokens.colors.text.secondary,
      lineHeight: 22,
      marginTop: Tokens.spacing[2],
      marginBottom: Tokens.spacing[1],
    },
    selectedQuote: {
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
    },
    author: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.xs,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.tertiary,
      alignSelf: 'flex-end',
    },
    label: {
      fontFamily: Tokens.type.fontFamily.mono,
      color: isCosmic
        ? CosmicTokens.colors.semantic.primary
        : Tokens.colors.brand[500],
      fontSize: Tokens.type.xs,
      fontWeight: '700',
      letterSpacing: 1,
    },
    selectedLabel: {
      color: isCosmic
        ? CosmicTokens.colors.semantic.success
        : Tokens.colors.text.primary,
    },
    recommendation: {
      marginTop: Tokens.spacing[4],
    },
    recommendationTitle: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.lg,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      marginBottom: Tokens.spacing[1],
    },
    recommendationSubtitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xs,
      fontWeight: '600',
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.tertiary,
      letterSpacing: 1,
      marginBottom: Tokens.spacing[3],
    },
    recommendationText: {
      fontFamily: Tokens.type.fontFamily.sans,
      color: isCosmic ? '#B9C2D9' : Tokens.colors.text.primary,
      fontSize: Tokens.type.base,
      lineHeight: Tokens.type.base * 1.5,
      marginBottom: Tokens.spacing[2],
    },
    evidenceBadge: {
      marginTop: Tokens.spacing[2],
      marginBottom: Tokens.spacing[4],
    },
    insightBox: {
      backgroundColor: isCosmic
        ? hexToRgba(CosmicTokens.colors.semantic.primary, 0.1)
        : Tokens.colors.neutral.darkest,
      borderLeftWidth: 2,
      borderLeftColor: isCosmic
        ? CosmicTokens.colors.semantic.primary
        : Tokens.colors.brand[500],
      padding: Tokens.spacing[3],
      marginVertical: Tokens.spacing[4],
      borderRadius: isCosmic ? 4 : 0,
    },
    insightLabel: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.xxs,
      color: isCosmic
        ? CosmicTokens.colors.semantic.primary
        : Tokens.colors.brand[500],
      marginBottom: 4,
      letterSpacing: 1,
    },
    insightText: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.sm,
      fontStyle: 'italic',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      lineHeight: 20,
    },
  });
