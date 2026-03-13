/**
 * Calendar styles
 */

import { StyleSheet, Platform } from 'react-native';
import { Tokens } from '../../theme/tokens';
import type { ThemeTokens } from '../../theme/types';
import type { ThemeVariant } from '../../theme/themeVariant';

const createWebFocusOutline = (color: string): object =>
  Platform.OS === 'web'
    ? {
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: color,
      }
    : {};

export const calendarStyles = (variant: ThemeVariant, t: ThemeTokens) =>
  (() => {
    const isCosmic = variant === 'cosmic';
    const isNightAwe = variant === 'nightAwe';
    return StyleSheet.create({
      // Container
      container: {
        flex: 1,
        backgroundColor:
          variant === 'linear' ? Tokens.colors.neutral.darkest : 'transparent',
      },
      webContainer: {
        flex: 1,
        width: '100%',
        maxWidth: Tokens.layout.maxWidth.content,
        alignSelf: 'center',
      },
      scrollView: {
        flex: 1,
      },
      scrollContent: {
        flexGrow: 1,
        paddingBottom: Tokens.spacing[8],
      },
      content: {
        padding: Tokens.spacing[6],
      },

      // Title
      title: {
        fontFamily:
          variant === 'cosmic' || variant === 'nightAwe'
            ? 'Space Grotesk'
            : Tokens.type.fontFamily.sans,
        fontSize: Tokens.type.h1,
        fontWeight: '800',
        color:
          variant === 'nightAwe'
            ? t.colors.text?.primary || '#F6F1E7'
            : variant === 'cosmic'
              ? '#EEF2FF'
              : Tokens.colors.text.primary,
        marginBottom: Tokens.spacing[4],
        letterSpacing: 2,
        ...Platform.select({
          web:
            variant === 'cosmic'
              ? {
                  textShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                }
              : variant === 'nightAwe'
                ? {
                    textShadow: '0 0 16px rgba(175, 199, 255, 0.24)',
                  }
                : {},
        }),
      },

      // Rationale card
      rationaleCard: {
        backgroundColor:
          variant === 'nightAwe'
            ? '#16283F'
            : variant === 'cosmic'
              ? 'rgba(17, 26, 51, 0.72)'
              : Tokens.colors.neutral.darker,
        borderWidth: 1,
        borderColor:
          variant === 'nightAwe'
            ? 'rgba(175, 199, 255, 0.16)'
            : variant === 'cosmic'
              ? 'rgba(185, 194, 217, 0.12)'
              : Tokens.colors.neutral.borderSubtle,
        padding: Tokens.spacing[4],
        marginBottom: Tokens.spacing[6],
        borderRadius: variant === 'linear' ? Tokens.radii.none : 16,
      },
      rationaleTitle: {
        fontFamily: Tokens.type.fontFamily.mono,
        fontSize: Tokens.type.xs,
        fontWeight: '700',
        color:
          variant === 'nightAwe'
            ? t.colors.nightAwe?.feature?.calendar || '#AFC7FF'
            : variant === 'cosmic'
              ? '#8B5CF6'
              : Tokens.colors.brand[500],
        letterSpacing: 1,
        marginBottom: Tokens.spacing[2],
        textTransform: 'uppercase',
      },
      rationaleText: {
        fontFamily: Tokens.type.fontFamily.body,
        fontSize: Tokens.type.sm,
        color:
          variant === 'nightAwe'
            ? t.colors.text?.secondary || '#C9D5E8'
            : variant === 'cosmic'
              ? '#B9C2D9'
              : Tokens.colors.text.secondary,
        lineHeight: 22,
        flexWrap: 'wrap',
      },

      // Calendar card
      calendarCard: {
        backgroundColor:
          variant === 'nightAwe'
            ? '#16283F'
            : variant === 'cosmic'
              ? 'rgba(17, 26, 51, 0.72)'
              : Tokens.colors.neutral.darker,
        borderRadius: variant === 'linear' ? Tokens.radii.none : 16,
        padding: Tokens.spacing[6],
        borderWidth: 1,
        borderColor:
          variant === 'nightAwe'
            ? 'rgba(175, 199, 255, 0.16)'
            : variant === 'cosmic'
              ? 'rgba(185, 194, 217, 0.12)'
              : Tokens.colors.neutral.borderSubtle,
        ...Tokens.elevation.none,
      },

      // Header
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Tokens.spacing[8],
      },
      navButton: {
        width: 44,
        height: 44,
        borderRadius: variant === 'linear' ? Tokens.radii.none : 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:
          variant === 'nightAwe'
            ? '#16283F'
            : variant === 'cosmic'
              ? 'rgba(17, 26, 51, 0.5)'
              : Tokens.colors.neutral.dark,
        borderWidth: 1,
        borderColor:
          variant === 'nightAwe'
            ? 'rgba(175, 199, 255, 0.24)'
            : variant === 'cosmic'
              ? 'rgba(139, 92, 246, 0.25)'
              : Tokens.colors.neutral.borderSubtle,
        ...Platform.select({
          web: {
            transition: Tokens.motion.transitions.base,
            cursor: 'pointer',
            ...((variant === 'cosmic' || variant === 'nightAwe') && {
              backdropFilter: 'blur(16px) saturate(180%)',
              boxShadow: `
              0 0 0 1px ${variant === 'nightAwe' ? 'rgba(175, 199, 255, 0.12)' : 'rgba(139, 92, 246, 0.15)'},
              0 4px 20px rgba(7, 7, 18, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.06)
            `,
            }),
          },
        }),
      },
      navButtonHovered: {
        backgroundColor:
          variant === 'nightAwe'
            ? '#21344D'
            : variant === 'cosmic'
              ? 'rgba(17, 26, 51, 0.7)'
              : Tokens.colors.neutral.darker,
        borderColor:
          variant === 'nightAwe'
            ? 'rgba(175, 199, 255, 0.4)'
            : variant === 'cosmic'
              ? 'rgba(139, 92, 246, 0.5)'
              : Tokens.colors.text.tertiary,
        ...Platform.select({
          web:
            variant === 'cosmic'
              ? {
                  boxShadow: `
                0 0 0 2px rgba(139, 92, 246, 0.3),
                0 0 24px rgba(139, 92, 246, 0.2),
                0 8px 28px rgba(7, 7, 18, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.08)
              `,
                  transform: 'translateY(-1px)',
                }
              : {
                  transform: [{ scale: 1.05 }],
                },
        }),
      },
      navButtonPressed: {
        backgroundColor: isCosmic
          ? 'rgba(17, 26, 51, 0.9)'
          : Tokens.colors.neutral.darkest,
        ...Platform.select({
          web: {},
        }),
        transform: [{ scale: Tokens.motion.scales.press }],
      },
      navButtonFocused: createWebFocusOutline(
        variant === 'nightAwe'
          ? t.colors.nightAwe?.feature?.calendar || '#AFC7FF'
          : variant === 'cosmic'
            ? '#8B5CF6'
            : Tokens.colors.indigo.primary,
      ),
      navButtonText: {
        color:
          variant === 'nightAwe'
            ? t.colors.text?.primary || '#F6F1E7'
            : variant === 'cosmic'
              ? '#EEF2FF'
              : Tokens.colors.text.primary,
        fontSize: Tokens.type.h2,
        lineHeight: Tokens.type.h2 * 1.2,
        fontWeight: '300',
        marginTop: -2,
      },
      monthText: {
        fontFamily: Tokens.type.fontFamily.sans,
        color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
        fontSize: Tokens.type.xl,
        fontWeight: '700',
        letterSpacing: 1,
      },

      // Weekdays
      weekdays: {
        flexDirection: 'row',
        marginBottom: Tokens.spacing[4],
      },
      weekdayText: {
        flex: 1,
        textAlign: 'center',
        color: isCosmic ? '#8B5CF6' : Tokens.colors.text.tertiary,
        fontSize: Tokens.type.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
      },

      // Days grid
      daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: isCosmic ? 8 : Tokens.radii.none,
        borderWidth: 1,
        borderColor: isCosmic ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
        backgroundColor: isCosmic ? 'rgba(17, 26, 51, 0.2)' : 'transparent',
        ...Platform.select({
          web: {
            transition: Tokens.motion.transitions.fast,
            ...(isCosmic && {
              backdropFilter: 'blur(8px)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }),
          },
        }),
      },
      dayCellHovered: {
        backgroundColor: isCosmic
          ? 'rgba(17, 26, 51, 0.5)'
          : Tokens.colors.neutral.dark,
        borderColor: isCosmic
          ? 'rgba(139, 92, 246, 0.5)'
          : Tokens.colors.neutral.borderSubtle,
        ...Platform.select({
          web: isCosmic
            ? {
                boxShadow: `
                0 0 0 2px rgba(139, 92, 246, 0.25),
                0 0 20px rgba(139, 92, 246, 0.2),
                0 8px 24px rgba(7, 7, 18, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `,
                transform: 'scale(1.05)',
                backdropFilter: 'blur(12px) saturate(150%)',
              }
            : {
                cursor: 'pointer',
              },
        }),
      },
      dayCellPressed: {
        backgroundColor: isCosmic
          ? 'rgba(17, 26, 51, 0.8)'
          : Tokens.colors.neutral.darkest,
        transform: [{ scale: Tokens.motion.scales.press }],
      },
      dayCellFocused: createWebFocusOutline(
        isCosmic ? '#8B5CF6' : Tokens.colors.indigo.primary,
      ),
      dayText: {
        fontFamily: Tokens.type.fontFamily.sans,
        color: isCosmic ? '#EEF2FF' : Tokens.colors.text.secondary,
        fontSize: Tokens.type.base,
        fontWeight: '500',
      },
      todayCell: {
        backgroundColor: isCosmic ? '#F6C177' : Tokens.colors.brand[600],
        borderColor: isCosmic ? '#F6C177' : Tokens.colors.brand[600],
        ...Tokens.elevation.none,
        ...Platform.select({
          web: {
            boxShadow: isCosmic ? undefined : '0 0 0 0',
          },
        }),
      },
      todayText: {
        color: isCosmic ? '#0F172A' : Tokens.colors.neutral[0],
        fontWeight: '700',
      },

      // Legend
      legend: {
        flexDirection: 'row',
        marginTop: Tokens.spacing[6],
        justifyContent: 'center',
      },
      legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      legendDot: {
        width: 8,
        height: 8,
        borderRadius: isCosmic ? 4 : 0,
        marginRight: Tokens.spacing[2],
        backgroundColor: isCosmic ? '#F6C177' : Tokens.colors.brand[600],
      },
      legendText: {
        fontFamily: Tokens.type.fontFamily.sans,
        color: isCosmic ? '#EEF2FF' : Tokens.colors.text.tertiary,
        fontSize: Tokens.type.xs,
        fontWeight: '700',
        letterSpacing: 1,
      },

      // Google Calendar card
      googleCalendarCard: {
        marginTop: Tokens.spacing[6],
        backgroundColor: isCosmic
          ? 'rgba(17, 26, 51, 0.72)'
          : Tokens.colors.neutral.darker,
        borderRadius: isCosmic ? 16 : Tokens.radii.none,
        borderWidth: 1,
        borderColor: isCosmic
          ? 'rgba(185, 194, 217, 0.12)'
          : Tokens.colors.neutral.borderSubtle,
        padding: Tokens.spacing[6],
        ...Tokens.elevation.none,
      },
      googleCalendarTitle: {
        fontFamily: Tokens.type.fontFamily.sans,
        color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
        fontSize: Tokens.type.sm,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: Tokens.spacing[3],
      },
      googleCalendarStatus: {
        fontFamily: Tokens.type.fontFamily.sans,
        color: isCosmic ? '#8B5CF6' : Tokens.colors.text.tertiary,
        fontSize: Tokens.type.xs,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: Tokens.spacing[4],
      },
      googleCalendarButton: {
        minHeight: Tokens.layout.minTapTarget,
        paddingHorizontal: Tokens.spacing[4],
        backgroundColor: isCosmic
          ? 'rgba(17, 26, 51, 0.5)'
          : Tokens.colors.neutral.dark,
        borderRadius: isCosmic ? 12 : Tokens.radii.none,
        borderWidth: 1,
        borderColor: isCosmic
          ? 'rgba(139, 92, 246, 0.25)'
          : Tokens.colors.neutral.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
          web: {
            transition: Tokens.motion.transitions.base,
            cursor: 'pointer',
            ...(isCosmic && {
              backdropFilter: 'blur(16px) saturate(180%)',
              boxShadow: `
              0 0 0 1px rgba(139, 92, 246, 0.15),
              0 4px 20px rgba(7, 7, 18, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.06)
            `,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }),
          },
        }),
      },
      googleCalendarButtonHovered: {
        backgroundColor: isCosmic
          ? 'rgba(17, 26, 51, 0.7)'
          : Tokens.colors.neutral.darker,
        borderColor: isCosmic
          ? 'rgba(139, 92, 246, 0.5)'
          : Tokens.colors.text.tertiary,
        ...Platform.select({
          web: isCosmic
            ? {
                boxShadow: `
                0 0 0 2px rgba(139, 92, 246, 0.3),
                0 0 24px rgba(139, 92, 246, 0.2),
                0 8px 28px rgba(7, 7, 18, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.08)
              `,
                transform: 'translateY(-1px)',
              }
            : {},
        }),
      },
      googleCalendarButtonPressed: {
        transform: [{ scale: Tokens.motion.scales.press }],
        backgroundColor: isCosmic
          ? 'rgba(17, 26, 51, 0.9)'
          : Tokens.colors.neutral.darkest,
      },
      googleCalendarButtonFocused: createWebFocusOutline(
        isCosmic ? '#8B5CF6' : Tokens.colors.indigo.primary,
      ),
      googleCalendarButtonDisabled: {
        backgroundColor: isCosmic
          ? 'rgba(11, 16, 34, 0.4)'
          : Tokens.colors.neutral.darkest,
        borderColor: isCosmic
          ? 'rgba(185, 194, 217, 0.08)'
          : Tokens.colors.neutral.borderSubtle,
        opacity: 0.5,
        ...Platform.select({
          web: {
            cursor: 'not-allowed',
          } as object,
        }),
      },
      googleCalendarButtonText: {
        fontFamily: Tokens.type.fontFamily.sans,
        color: isCosmic ? '#EEF2FF' : Tokens.colors.text.primary,
        fontSize: Tokens.type.xs,
        fontWeight: '700',
        letterSpacing: 1,
      },
    });
  })();
