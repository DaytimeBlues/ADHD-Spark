import { Platform, StyleSheet } from 'react-native';
import { Tokens } from '../../theme/tokens';
import type { ThemeTokens } from '../../theme/types';
import type { ThemeVariant } from '../../theme/themeVariant';

export const getCbtGuideStyles = (variant: ThemeVariant, t: ThemeTokens) => {
  const isCosmic = variant === 'cosmic';
  const isNightAwe = variant === 'nightAwe';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        variant === 'linear' ? Tokens.colors.neutral.darkest : 'transparent',
    },
    scrollContent: {
      flexGrow: 1,
      padding: Tokens.spacing[6],
      alignItems: 'center',
    },
    maxWidthWrapper: {
      width: '100%',
      maxWidth: Tokens.layout.maxWidth.prose,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Tokens.spacing[8],
      paddingTop: Tokens.spacing[2],
    },
    headerTitle: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type['4xl'],
      fontWeight: '800',
      color: isNightAwe
        ? t.colors.text?.primary || '#F6F1E7'
        : isCosmic
          ? '#EEF2FF'
          : Tokens.colors.text.primary,
      letterSpacing: 2,
    },
    headerSubtitle: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.base,
      color: isNightAwe
        ? t.colors.text?.secondary || '#C9D5E8'
        : Tokens.colors.text.secondary,
      marginTop: 2,
      letterSpacing: 1,
    },
    backButton: {
      marginRight: Tokens.spacing[4],
      width: 44,
      height: 44,
      borderRadius: variant === 'linear' ? Tokens.radii.none : 8,
      backgroundColor: isNightAwe
        ? '#16283F'
        : isCosmic
          ? 'rgba(42, 53, 82, 0.3)'
          : Tokens.colors.neutral.darker,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isNightAwe
        ? 'rgba(175, 199, 255, 0.16)'
        : isCosmic
          ? 'rgba(42, 53, 82, 0.3)'
          : Tokens.colors.neutral.borderSubtle,
      ...Platform.select({
        web: {
          transition: Tokens.motion.transitions.base,
          cursor: 'pointer',
        },
      }),
    },
    backButtonHovered: {
      backgroundColor: isNightAwe
        ? '#21344D'
        : isCosmic
          ? 'rgba(42, 53, 82, 0.5)'
          : Tokens.colors.neutral.dark,
      borderColor: isNightAwe
        ? t.colors.nightAwe?.feature?.cbtGuide || '#AFC7FF'
        : isCosmic
          ? '#8B5CF6'
          : Tokens.colors.text.tertiary,
      transform: [{ scale: Tokens.motion.scales.hover }],
    },
    backButtonPressed: {
      backgroundColor: isCosmic
        ? 'rgba(42, 53, 82, 0.2)'
        : Tokens.colors.neutral.darkest,
      transform: [{ scale: Tokens.motion.scales.press }],
    },
    backButtonText: {
      color: isNightAwe
        ? t.colors.text?.primary || '#F6F1E7'
        : isCosmic
          ? '#EEF2FF'
          : Tokens.colors.text.primary,
      fontSize: Tokens.type.h3,
      fontWeight: 'bold',
      marginTop: -2,
    },
    compactCard: {
      marginBottom: Tokens.spacing[6],
    },
    compactHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Tokens.spacing[2],
      gap: Tokens.spacing[3],
    },
    compactTitle: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: Tokens.type.sm,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      letterSpacing: 1,
    },
    compactDescription: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.xs,
      color: Tokens.colors.text.secondary,
      lineHeight: 18,
      marginBottom: Tokens.spacing[3],
    },
    evidenceRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Tokens.spacing[3],
      marginBottom: Tokens.spacing[3],
    },
    evidenceBullet: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 10,
      color: isNightAwe
        ? t.colors.nightAwe?.feature?.cbtGuide || '#AFC7FF'
        : isCosmic
          ? '#8B5CF6'
          : Tokens.colors.brand[400],
      textTransform: 'uppercase',
    },
    linksRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Tokens.spacing[2],
    },
    linkButton: {
      backgroundColor: isCosmic
        ? 'rgba(42, 53, 82, 0.3)'
        : Tokens.colors.neutral.dark,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: isCosmic
        ? 'rgba(42, 53, 82, 0.3)'
        : Tokens.colors.neutral.borderSubtle,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Tokens.spacing[2],
      borderRadius: isCosmic ? 6 : Tokens.radii.none,
      ...Platform.select({
        web: {
          cursor: 'pointer',
          transition: Tokens.motion.transitions.base,
        },
      }),
    },
    linkButtonHovered: {
      borderColor: isCosmic ? '#8B5CF6' : Tokens.colors.text.secondary,
      backgroundColor: isCosmic
        ? 'rgba(42, 53, 82, 0.5)'
        : Tokens.colors.neutral.darkest,
    },
    linkButtonPressed: {
      opacity: 0.7,
    },
    linkButtonText: {
      fontFamily: Tokens.type.fontFamily.mono,
      fontSize: 10,
      color: isNightAwe
        ? t.colors.text?.secondary || '#C9D5E8'
        : Tokens.colors.text.secondary,
      fontWeight: '600',
    },
    linkBadge: {
      marginLeft: -2,
    },
    categoryCard: {
      marginBottom: Tokens.spacing[4],
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Tokens.spacing[4],
    },
    categoryEmoji: {
      fontSize: Tokens.type.h1,
      marginRight: Tokens.spacing[4],
    },
    categoryTitleContainer: {
      flex: 1,
    },
    categoryTitle: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.lg,
      fontWeight: '700',
      color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
      letterSpacing: 1,
      marginBottom: 2,
    },
    categoryPillar: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.xs,
      color: isCosmic ? '#8B5CF6' : Tokens.colors.brand[400],
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    categoryDescription: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.sm,
      color: Tokens.colors.text.secondary,
      lineHeight: Tokens.type.sm * 1.5,
      marginBottom: Tokens.spacing[6],
    },
    featuresRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Tokens.spacing[2],
    },
    featureButton: {
      backgroundColor: isNightAwe ? '#16283F' : Tokens.colors.neutral.dark,
      paddingVertical: Tokens.spacing[2],
      paddingHorizontal: Tokens.spacing[4],
      borderRadius: variant === 'linear' ? Tokens.radii.none : 8,
      borderWidth: 1,
      borderColor: isNightAwe
        ? 'rgba(175, 199, 255, 0.16)'
        : isCosmic
          ? 'rgba(42, 53, 82, 0.3)'
          : Tokens.colors.neutral.borderSubtle,
      ...Platform.select({
        web: {
          cursor: 'pointer',
          transition: Tokens.motion.transitions.base,
        },
      }),
    },
    featureButtonHovered: {
      borderColor: isNightAwe
        ? t.colors.nightAwe?.feature?.cbtGuide || '#AFC7FF'
        : isCosmic
          ? '#8B5CF6'
          : Tokens.colors.brand[500],
      transform: [{ translateY: -2 }],
    },
    featureButtonPressed: {
      transform: [{ scale: Tokens.motion.scales.press }],
      backgroundColor: Tokens.colors.neutral.darker,
    },
    featureButtonText: {
      fontFamily: Tokens.type.fontFamily.sans,
      fontSize: Tokens.type.xs,
      color: isNightAwe
        ? t.colors.text?.primary || '#F6F1E7'
        : isCosmic
          ? '#EEF2FF'
          : Tokens.colors.text.primary,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    featureButtonNightAwe: {
      backgroundColor: '#16283F',
      borderColor: 'rgba(175, 199, 255, 0.16)',
      borderRadius: 10,
    },
    featureButtonTextNightAwe: {
      color: t.colors.text?.primary || '#F6F1E7',
    },
  });
};
