import React from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tokens } from '../theme/tokens';
import HapticsService from '../services/HapticsService';

export const WebNavBar = ({ state, navigation }: BottomTabBarProps) => {
  const { width } = useWindowDimensions();
  // Mobile breakpoint for "Android Chrome" feel vs desktop
  // We want to keep it usable on small screens.
  const isSmallScreen = width < 450;

  return (
    <View
      style={[
        styles.container,
        {
          paddingHorizontal: isSmallScreen
            ? Tokens.spacing[3]
            : Tokens.spacing[6],
        },
        Platform.OS === 'web' ? styles.absolute : styles.relative,
      ]}
    >
      {/* Logo Area */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>SPARK</Text>
      </View>

      {/* Navigation Links */}
      <View
        style={[
          styles.navLinksContainer,
          {
            gap: isSmallScreen ? Tokens.spacing[1] : Tokens.spacing[4], // Wider gap for desktop
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
                  borderBottomColor: isFocused
                    ? Tokens.colors.indigo.primary
                    : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                  ...Platform.select({
                    web: {
                      cursor: 'pointer',
                      transition: Tokens.motion.transitions.fast,
                    },
                  }),
                },
              ]}
            >
              <Text
                testID={`nav-label-${route.name.toLowerCase()}`}
                style={[
                  styles.navText,
                  isFocused ? styles.textPrimary : styles.textSecondary,
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
    backgroundColor: Tokens.colors.neutral.darkest,
    borderBottomWidth: 1,
    borderBottomColor: Tokens.colors.neutral.borderSubtle,
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
    color: Tokens.colors.text.primary,
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
  textPrimary: {
    color: Tokens.colors.text.primary,
  },
  textSecondary: {
    color: Tokens.colors.text.secondary,
  },
});
