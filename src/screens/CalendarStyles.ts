import { StyleSheet, Platform } from 'react-native';
import { Tokens } from '../theme/tokens';
import { CosmicTokens } from '../theme/cosmicTokens';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Tokens.colors.neutral.darkest,
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
    title: {
        fontFamily: Tokens.type.fontFamily.sans,
        fontSize: Tokens.type.h1,
        fontWeight: '800',
        color: Tokens.colors.text.primary,
        marginBottom: Tokens.spacing[4],
        letterSpacing: 2,
    },
    rationaleCard: {
        backgroundColor: Tokens.colors.neutral.darker,
        borderWidth: 1,
        borderColor: Tokens.colors.neutral.borderSubtle,
        padding: Tokens.spacing[4],
        marginBottom: Tokens.spacing[6],
    },
    rationaleTitle: {
        fontFamily: Tokens.type.fontFamily.mono,
        fontSize: Tokens.type.xs,
        fontWeight: '700',
        color: Tokens.colors.brand[500],
        letterSpacing: 1,
        marginBottom: Tokens.spacing[2],
        textTransform: 'uppercase',
    },
    rationaleText: {
        fontFamily: Tokens.type.fontFamily.body,
        fontSize: Tokens.type.sm,
        color: Tokens.colors.text.secondary,
        lineHeight: 22,
        flexWrap: 'wrap',
    },
    calendarCard: {
        backgroundColor: Tokens.colors.neutral.darker,
        borderRadius: Tokens.radii.none,
        padding: Tokens.spacing[6],
        borderWidth: 1,
        borderColor: Tokens.colors.neutral.borderSubtle,
        ...Tokens.elevation.none,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Tokens.spacing[8],
    },
    navButton: {
        width: 44,
        height: 44,
        borderRadius: Tokens.radii.none,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Tokens.colors.neutral.dark,
        borderWidth: 1,
        borderColor: Tokens.colors.neutral.borderSubtle,
        ...Platform.select({
            web: {
                transition: Tokens.motion.transitions.base,
                cursor: 'pointer',
            },
        }),
    },
    navButtonHovered: {
        backgroundColor: Tokens.colors.neutral.darker,
        borderColor: Tokens.colors.text.tertiary,
        transform: [{ scale: 1.05 }],
    },
    navButtonPressed: {
        transform: [{ scale: Tokens.motion.scales.press }],
        backgroundColor: Tokens.colors.neutral.darkest,
    },
    navButtonText: {
        color: Tokens.colors.text.primary,
        fontSize: Tokens.type.h2,
        lineHeight: 40, // Match typical h2 line-height roughly
        fontWeight: '300',
        marginTop: -2,
    },
    monthText: {
        fontFamily: Tokens.type.fontFamily.sans,
        color: Tokens.colors.text.primary,
        fontSize: Tokens.type.xl,
        fontWeight: '700',
        letterSpacing: 1,
    },
    weekdays: {
        flexDirection: 'row',
        marginBottom: Tokens.spacing[4],
    },
    weekdayText: {
        flex: 1,
        textAlign: 'center',
        color: Tokens.colors.text.tertiary,
        fontSize: Tokens.type.xs,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Tokens.radii.none,
        borderWidth: 1,
        borderColor: 'transparent',
        ...Platform.select({
            web: {
                transition: Tokens.motion.transitions.fast,
            },
        }),
    },
    dayCellHovered: {
        backgroundColor: Tokens.colors.neutral.dark,
        borderColor: Tokens.colors.neutral.borderSubtle,
        ...Platform.select({
            web: {
                cursor: 'pointer',
            },
        }),
    },
    dayCellPressed: {
        backgroundColor: Tokens.colors.neutral.darkest,
        transform: [{ scale: Tokens.motion.scales.press }],
    },
    dayText: {
        fontFamily: Tokens.type.fontFamily.sans,
        color: Tokens.colors.text.secondary,
        fontSize: Tokens.type.base,
        fontWeight: '500',
    },
    todayCell: {
        backgroundColor: Tokens.colors.brand[600],
        ...Tokens.elevation.none,
    },
    todayText: {
        color: Tokens.colors.neutral[0],
        fontWeight: '700',
    },
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
        borderRadius: 0,
        marginRight: Tokens.spacing[2],
    },
    todayDot: {
        backgroundColor: Tokens.colors.brand[600],
    },
    legendText: {
        fontFamily: Tokens.type.fontFamily.sans,
        color: Tokens.colors.text.tertiary,
        fontSize: Tokens.type.xs,
        fontWeight: '700',
        letterSpacing: 1,
    },
    googleCalendarCard: {
        marginTop: Tokens.spacing[6],
        backgroundColor: Tokens.colors.neutral.darker,
        borderRadius: Tokens.radii.none,
        borderWidth: 1,
        borderColor: Tokens.colors.neutral.borderSubtle,
        padding: Tokens.spacing[6],
        ...Tokens.elevation.none,
    },
    googleCalendarTitle: {
        fontFamily: Tokens.type.fontFamily.sans,
        color: Tokens.colors.text.primary,
        fontSize: Tokens.type.sm,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: Tokens.spacing[3],
    },
    googleCalendarStatus: {
        fontFamily: Tokens.type.fontFamily.sans,
        color: Tokens.colors.text.tertiary,
        fontSize: Tokens.type.xs,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: Tokens.spacing[4],
    },
    googleCalendarButton: {
        minHeight: Tokens.layout.minTapTarget,
        paddingHorizontal: Tokens.spacing[4],
        backgroundColor: Tokens.colors.neutral.dark,
        borderRadius: Tokens.radii.none,
        borderWidth: 1,
        borderColor: Tokens.colors.neutral.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            web: {
                transition: Tokens.motion.transitions.base,
                cursor: 'pointer',
            },
        }),
    },
    googleCalendarButtonHovered: {
        backgroundColor: Tokens.colors.neutral.darker,
        borderColor: Tokens.colors.text.tertiary,
    },
    googleCalendarButtonPressed: {
        transform: [{ scale: Tokens.motion.scales.press }],
        backgroundColor: Tokens.colors.neutral.darkest,
    },
    googleCalendarButtonDisabled: {
        backgroundColor: Tokens.colors.neutral.darkest,
        borderColor: Tokens.colors.neutral.borderSubtle,
        opacity: 0.5,
    },
    googleCalendarButtonText: {
        fontFamily: Tokens.type.fontFamily.sans,
        color: Tokens.colors.text.primary,
        fontSize: Tokens.type.xs,
        fontWeight: '700',
        letterSpacing: 1,
    },
    // Cosmic
    containerCosmic: {
        backgroundColor: 'transparent',
    },
    titleCosmic: {
        color: CosmicTokens.colors.cosmic.starlight,
        fontFamily: 'Space Grotesk',
    },
    rationaleTitleCosmic: {
        color: CosmicTokens.colors.semantic.primary,
    },
    rationaleTextCosmic: {
        color: CosmicTokens.colors.cosmic.mist,
    },
    navButtonCosmic: {
        backgroundColor: CosmicTokens.colors.cosmic.deepSpace + '80',
        borderColor: CosmicTokens.colors.semantic.primary + '40',
        borderRadius: 12,
    },
    navButtonHoveredCosmic: {
        backgroundColor: CosmicTokens.colors.cosmic.deepSpace + 'B3',
        borderColor: CosmicTokens.colors.semantic.primary + '80',
    },
    navButtonPressedCosmic: {
        backgroundColor: CosmicTokens.colors.cosmic.deepSpace + 'E6',
    },
    navButtonTextCosmic: {
        color: CosmicTokens.colors.cosmic.starlight,
    },
    monthTextCosmic: {
        color: CosmicTokens.colors.cosmic.starlight,
    },
    weekdayTextCosmic: {
        color: CosmicTokens.colors.semantic.primary,
    },
    dayCellCosmic: {
        borderColor: CosmicTokens.colors.semantic.primary + '26',
        backgroundColor: CosmicTokens.colors.cosmic.deepSpace + '33',
        borderRadius: 8,
    },
    dayCellHoveredCosmic: {
        backgroundColor: CosmicTokens.colors.cosmic.deepSpace + '80',
        borderColor: CosmicTokens.colors.semantic.primary + '80',
    },
    dayCellPressedCosmic: {
        backgroundColor: CosmicTokens.colors.cosmic.deepSpace + 'CC',
    },
    dayTextCosmic: {
        color: CosmicTokens.colors.cosmic.starlight,
    },
    todayCellCosmic: {
        backgroundColor: CosmicTokens.colors.semantic.warning,
        borderColor: CosmicTokens.colors.semantic.warning,
    },
    todayTextCosmic: {
        color: CosmicTokens.colors.cosmic.obsidian,
    },
    todayDotCosmic: {
        backgroundColor: CosmicTokens.colors.semantic.warning,
    },
    legendTextCosmic: {
        color: CosmicTokens.colors.cosmic.starlight,
    },
    googleCalendarTitleCosmic: {
        color: CosmicTokens.colors.cosmic.starlight,
    },
    googleCalendarStatusCosmic: {
        color: CosmicTokens.colors.semantic.primary,
    },
    googleCalendarButtonCosmic: {
        backgroundColor: CosmicTokens.colors.cosmic.deepSpace + '80',
        borderColor: CosmicTokens.colors.semantic.primary + '40',
        borderRadius: 12,
    },
    googleCalendarButtonHoveredCosmic: {
        backgroundColor: CosmicTokens.colors.cosmic.deepSpace + 'B3',
        borderColor: CosmicTokens.colors.semantic.primary + '80',
    },
    googleCalendarButtonPressedCosmic: {
        backgroundColor: CosmicTokens.colors.cosmic.deepSpace + 'E6',
    },
    googleCalendarButtonDisabledCosmic: {
        backgroundColor: CosmicTokens.colors.cosmic.midnight + '66',
        borderColor: CosmicTokens.colors.cosmic.mist + '14',
    },
    googleCalendarButtonTextCosmic: {
        color: CosmicTokens.colors.cosmic.starlight,
    },
});
