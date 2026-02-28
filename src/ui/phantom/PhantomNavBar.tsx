/**
 * PhantomNavBar
 *
 * P5-style bottom navigation — angled icons, red active indicators.
 * Sharp edges, Impact font labels.
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export interface PhantomNavBarProps {
  items: NavItem[];
  activeKey?: string;
  onSelect: (key: string) => void;
  testID?: string;
}

export const PhantomNavBar = memo(function PhantomNavBar({
  items,
  activeKey,
  onSelect,
  testID,
}: PhantomNavBarProps) {
  const { isPhantom } = useTheme();

  if (!isPhantom) {
    return null;
  }

  const fontFamily = Platform.select({
    web: 'Impact, "Arial Black", sans-serif',
    ios: 'Impact',
    android: 'sans-serif-black',
    default: 'sans-serif',
  });

  return (
    <View testID={testID} style={styles.container}>
      {items.map((item) => {
        const isActive = item.key === activeKey;

        return (
          <Pressable
            key={item.key}
            style={[
              styles.item,
              isActive && styles.itemActive,
            ]}
            onPress={() => onSelect(item.key)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
          >
            {/* Red indicator triangle when active */}
            {isActive && <View style={styles.indicator} />}

            {/* Icon container with rotation */}
            <View
              style={[
                styles.iconContainer,
                isActive && styles.iconContainerActive,
              ]}
            >
              {item.icon}
            </View>

            {/* Label */}
            <Text
              style={[
                styles.label,
                { fontFamily },
                isActive && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderTopWidth: 3,
    borderTopColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  itemActive: {
    backgroundColor: 'rgba(216, 0, 0, 0.15)',
  },
  indicator: {
    position: 'absolute',
    top: -3,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#D80000',
    transform: [{ skewX: '-10deg' }],
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-10deg' }],
    borderWidth: 2,
    borderColor: '#666666',
    borderRadius: 0,
    backgroundColor: '#000000',
  },
  iconContainerActive: {
    borderColor: '#D80000',
    backgroundColor: '#1A0000',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CCCCCC',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#D80000',
  },
});

export default PhantomNavBar;
