import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  useWindowDimensions,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tokens } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';
import HapticsService from '../services/HapticsService';
import { isWeb } from '../utils/PlatformUtils';

export const WebNavBar = ({ state, navigation }: BottomTabBarProps) => {
  const { width } = useWindowDimensions();
  const { isCosmic, isNightAwe, t } = useTheme();
  const isSmallScreen = width < 450;

  const cosmicColors = useMemo(
    () => ({
      bg: '#070712',
      border: 'rgba(42, 53, 82, 0.3)',
      textPrimary: '#EEF2FF',
      textSecondary: '#B9C2D9',
      accent: '#8B5CF6',
      logoGlow: isWeb
        ? ({
            textShadow: '0 0 18px rgba(139, 92, 246, 0.35)',
          } as unknown as TextStyle)
        : undefined,
    }),
    [],
  );
  const nightAweColors = useMemo(
    () => ({
      bg: '#08111E',
      border: t.colors.nightAwe?.surface?.border || 'rgba(175, 199, 255, 0.16)',
      textPrimary: t.colors.text?.primary || '#F6F1E7',
      textSecondary: t.colors.text?.secondary || '#C9D5E8',
      accent: t.colors.nightAwe?.feature?.home || '#AFC7FF',
      logoGlow: isWeb
        ? ({
            textShadow: '0 0 18px rgba(175, 199, 255, 0.28)',
          } as unknown as TextStyle)
        : undefined,
    }),
    [t],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isCosmic
            ? cosmicColors.bg
            : isNightAwe
              ? nightAweColors.bg
              : Tokens.colors.neutral.darkest,
          borderBottomColor: isCosmic
            ? cosmicColors.border
            : isNightAwe
              ? nightAweColors.border
              : Tokens.colors.neutral.borderSubtle,
          paddingHorizontal: isSmallScreen
            ? Tokens.spacing[3]
            : Tokens.spacing[6],
        },
        isWeb ? styles.absolute : styles.relative,
      ]}
    >
      {/* Logo Area */}
      <View style={styles.logoContainer}>
        <Text
          style={[
            styles.logoText,
            {
              color: isCosmic
                ? cosmicColors.textPrimary
                : isNightAwe
                  ? nightAweColors.textPrimary
                  : Tokens.colors.text.primary,
            },
            isCosmic
              ? cosmicColors.logoGlow
              : isNightAwe
                ? nightAweColors.logoGlow
                : undefined,
          ]}
        >
          CADDI
        </Text>
      </View>

      {/* Navigation Links */}
      <View
        style={[
          styles.navLinksContainer,
          {
            gap: isSmallScreen ? Tokens.spacing[1] : Tokens.spacing[4],
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            HapticsService.tap({ key: 'navTab', minIntervalMs: 140 });
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const accentColor = isCosmic
            ? cosmicColors.accent
            : isNightAwe
              ? nightAweColors.accent
              : Tokens.colors.indigo.primary;

          return (
            <Pressable
              key={route.key}
              testID={`nav-${route.name.toLowerCase()}`}
              accessibilityRole="button"
              accessibilityLabel={`${route.name} tab`}
              onPress={onPress}
              style={({ pressed }) => [
                styles.navLink,
                {
                  borderBottomColor: isFocused ? accentColor : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                  ...Platform.select({
                    web: {
                      cursor: 'pointer',
                      transition: 'all 0.15s ease-out',
                    },
                  }),
                },
              ]}
            >
              <Text
                testID={`nav-label-${route.name.toLowerCase()}`}
                style={[
                  styles.navText,
                  {
                    color: isFocused
                      ? isCosmic
                        ? cosmicColors.textPrimary
                        : isNightAwe
                          ? nightAweColors.textPrimary
                          : Tokens.colors.text.primary
                      : isCosmic
                        ? cosmicColors.textSecondary
                        : isNightAwe
                          ? nightAweColors.textSecondary
                          : Tokens.colors.text.secondary,
                  },
                  isFocused ? styles.textBold : styles.textMedium,
                ]}
              >
                {route.name.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  absolute: {
    position: 'absolute',
  },
  relative: {
    position: 'relative',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.h3,
    fontWeight: '700',
    letterSpacing: 1,
  },
  navLinksContainer: {
    flexDirection: 'row',
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing[3],
    paddingHorizontal: Tokens.spacing[2],
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
  },
  navText: {
    fontFamily: Tokens.type.fontFamily.sans,
    fontSize: Tokens.type.sm,
    letterSpacing: 1,
  },
  textBold: {
    fontWeight: '700',
  },
  textMedium: {
    fontWeight: '500',
  },
});
