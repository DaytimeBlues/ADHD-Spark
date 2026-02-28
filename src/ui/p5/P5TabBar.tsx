/**
 * P5TabBar - Persona 5 Style Bottom Tab Navigation
 * 
 * Angular icon-based tab bar with red active indicator.
 * Thumb-accessible, theatrical presence.
 * 
 * @example
 * <P5TabBar
 *   tabs={[
 *     { key: 'home', icon: 'home', label: 'Home' },
 *     { key: 'tasks', icon: 'tasks', label: 'Tasks' },
 *     { key: 'timer', icon: 'timer', label: 'Focus' },
 *     { key: 'journal', icon: 'journal', label: 'Journal' },
 *   ]}
 *   activeTab="home"
 *   onTabPress={(key) => setActiveTab(key)}
 * />
 */

import React, { memo, useMemo, ReactNode, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import {
  P5Colors,
  P5SemanticColors,
  P5Spacing,
  P5Typography,
  P5FontSizes,
  P5Motion,
  P5Geometry,
} from '../../theme/p5Tokens';

export interface P5TabBarTab {
  /** Unique key for the tab */
  key: string;
  
  /** Icon name (custom or from icon set) */
  icon: string;
  
  /** Optional label */
  label?: string;
  
  /** Badge count */
  badge?: number;
}

export interface P5TabBarProps {
  /** Array of tabs */
  tabs: P5TabBarTab[];
  
  /** Currently active tab key */
  activeTab: string;
  
  /** Tab press handler */
  onTabPress: (key: string) => void;
  
  /** Show labels under icons */
  showLabels?: boolean;
  
  /** Test ID */
  testID?: string;
  
  /** Additional container styles */
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Icon component map - simplified version
const P5Icon = ({ name, size = 24, color = P5Colors.text }: { name: string; size?: number; color?: string }) => {
  // Simplified icon rendering using View shapes
  // In production, use a proper icon library like react-native-vector-icons
  const renderIcon = () => {
    switch (name) {
      case 'home':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.homeRoof, { borderBottomColor: color }]} />
            <View style={[styles.homeBody, { backgroundColor: color }]} />
          </View>
        );
      case 'tasks':
      case 'check':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.checkBox, { borderColor: color }]}>
              <View style={[styles.checkMark, { backgroundColor: color }]} />
            </View>
          </View>
        );
      case 'timer':
      case 'clock':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.clockFace, { borderColor: color }]}>
              <View style={[styles.clockHand1, { backgroundColor: color }]} />
              <View style={[styles.clockHand2, { backgroundColor: color }]} />
            </View>
          </View>
        );
      case 'journal':
      case 'book':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.bookSpine, { backgroundColor: color }]} />
            <View style={[styles.bookPages, { borderColor: color }]} />
          </View>
        );
      case 'plus':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.plusHorizontal, { backgroundColor: color }]} />
            <View style={[styles.plusVertical, { backgroundColor: color }]} />
          </View>
        );
      case 'profile':
      case 'user':
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={[styles.userHead, { borderColor: color }]} />
            <View style={[styles.userBody, { backgroundColor: color }]} />
          </View>
        );
      default:
        return (
          <View style={[styles.iconContainer, { width: size, height: size }]}>
            <View style={{ width: size / 3, height: size / 3, backgroundColor: color }} />
          </View>
        );
    }
  };
  
  return <>{renderIcon()}</>;
};

export const P5TabBar = memo(function P5TabBar({
  tabs,
  activeTab,
  onTabPress,
  showLabels = false,
  testID,
  style,
}: P5TabBarProps) {
  const insets = useSafeAreaInsets();
  
  // Find active tab index
  const activeIndex = useMemo(() => {
    return tabs.findIndex(tab => tab.key === activeTab);
  }, [tabs, activeTab]);
  
  // Animation value for indicator position
  const indicatorPosition = useSharedValue(0);
  
  // Update indicator when active tab changes
  React.useEffect(() => {
    const tabWidth = 100 / tabs.length;
    indicatorPosition.value = withSpring(activeIndex * tabWidth, {
      stiffness: P5Motion.easing.spring.stiffness,
      damping: P5Motion.easing.spring.damping * 1.2,
    });
  }, [activeIndex, tabs.length, indicatorPosition]);
  
  // Animated indicator style
  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));
  
  // Container height
  const height = P5NavTokens.height + insets.bottom;
  
  // Tab width
  const tabWidth = useMemo(() => `${100 / tabs.length}%`, [tabs.length]);
  
  // Render each tab
  const renderTab = (tab: P5TabBarTab, index: number) => {
    const isActive = tab.key === activeTab;
    
    return (
      <TabItem
        key={tab.key}
        tab={tab}
        isActive={isActive}
        showLabel={showLabels}
        onPress={() => onTabPress(tab.key)}
        width={tabWidth}
      />
    );
  };
  
  return (
    <View
      style={[
        styles.container,
        { height, paddingBottom: insets.bottom },
        style,
      ]}
      testID={testID}
    >
      {/* Active indicator background */}
      <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
      
      {/* Tab items */}
      <View style={styles.tabsContainer}>
        {tabs.map(renderTab)}
      </View>
    </View>
  );
});

// Individual tab item component
interface TabItemProps {
  tab: P5TabBarTab;
  isActive: boolean;
  showLabel: boolean;
  onPress: () => void;
  width: string;
}

const TabItem = memo(function TabItem({
  tab,
  isActive,
  showLabel,
  onPress,
  width,
}: TabItemProps) {
  // Animation values
  const scale = useSharedValue(1);
  const iconOpacity = useSharedValue(isActive ? 1 : 0.6);
  const fillOpacity = useSharedValue(isActive ? 1 : 0);
  
  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const animatedIconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));
  
  const animatedFillStyle = useAnimatedStyle(() => ({
    opacity: fillOpacity.value,
  }));
  
  // Press handlers
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, {
      stiffness: P5Motion.easing.spring.stiffness,
      damping: P5Motion.easing.spring.damping,
    });
  }, [scale]);
  
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      stiffness: P5Motion.easing.spring.stiffness,
      damping: P5Motion.easing.spring.damping,
    });
  }, [scale]);
  
  // Update animation on active state change
  React.useEffect(() => {
    iconOpacity.value = withTiming(isActive ? 1 : 0.6, { duration: 200 });
    fillOpacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive, iconOpacity, fillOpacity]);
  
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.tabItem,
        { width },
        animatedContainerStyle,
        Platform.OS === 'web' && { cursor: 'pointer' } as ViewStyle,
      ]}
      accessibilityLabel={tab.label || tab.key}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      {/* Red fill background for active state */}
      <Animated.View style={[styles.tabFill, animatedFillStyle]} />
      
      {/* Icon */}
      <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
        <P5Icon name={tab.icon} size={24} color={isActive ? P5Colors.text : P5Colors.textMuted} />
      </Animated.View>
      
      {/* Label */}
      {showLabel && tab.label && (
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {tab.label}
        </Text>
      )}
      
      {/* Badge */}
      {tab.badge !== undefined && tab.badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{tab.badge > 99 ? '99+' : tab.badge}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
});

const P5NavTokens = {
  height: 64,
  iconSize: 24,
  activeIndicatorSize: 40,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: P5Colors.background,
    borderTopWidth: 1,
    borderTopColor: P5SemanticColors.borderDefault,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '25%', // Will be dynamically set
    height: '100%',
    backgroundColor: 'rgba(230, 0, 18, 0.15)', // Subtle red tint
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabFill: {
    position: 'absolute',
    top: 8,
    left: '20%',
    right: '20%',
    bottom: 8,
    backgroundColor: P5Colors.primary,
    transform: [{ skewX: '-10deg' }],
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: P5FontSizes.caption,
    fontWeight: '500',
    color: P5Colors.textMuted,
    marginTop: 4,
  },
  tabLabelActive: {
    color: P5Colors.text,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: '20%',
    backgroundColor: P5Colors.primary,
    borderRadius: 0, // Sharp corners
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: P5Colors.text,
  },
  // Icon shapes
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeRoof: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  homeBody: {
    position: 'absolute',
    bottom: 0,
    width: 16,
    height: 12,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    width: 10,
    height: 3,
    transform: [{ rotate: '45deg' }, { translateY: 2 }, { translateX: -2 }],
  },
  clockFace: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockHand1: {
    position: 'absolute',
    width: 2,
    height: 6,
    top: 3,
  },
  clockHand2: {
    position: 'absolute',
    width: 6,
    height: 2,
    right: 3,
  },
  bookSpine: {
    position: 'absolute',
    left: 0,
    width: 4,
    height: 20,
  },
  bookPages: {
    position: 'absolute',
    left: 6,
    width: 14,
    height: 18,
    borderWidth: 1,
    borderLeftWidth: 0,
  },
  plusHorizontal: {
    position: 'absolute',
    width: 20,
    height: 3,
  },
  plusVertical: {
    position: 'absolute',
    width: 3,
    height: 20,
  },
  userHead: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 0,
    borderWidth: 2,
  },
  userBody: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 10,
  },
});

export default P5TabBar;
