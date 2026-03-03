/**
 * React Native Reanimated Mock
 * Provides minimal stub implementations for the hooks and components we use
 */

const React = require('react');
const { View } = require('react-native');

// Create a simple Animated View mock
const AnimatedView = React.forwardRef((props, ref) =>
  React.createElement(View, { ...props, ref }),
);

// Mock shared value hook
const useSharedValue = (initial) => ({
  value: initial,
});

// Mock animated style hook
const useAnimatedStyle = () => ({});

// Mock with timing
const withTiming = (v) => v;

// Mock with spring
const withSpring = (v) => v;

// Mock with delay
const withDelay = (_, anim) => anim;

// Mock with sequence
const withSequence = (...anims) => anims[0];

// Mock interpolate
const interpolate = (v) => v;

// Mock useAnimatedProps
const useAnimatedProps = () => ({});

// Mock createAnimatedComponent
const createAnimatedComponent = (Component) => Component;

module.exports = {
  default: {
    View: AnimatedView,
    createAnimatedComponent,
  },
  View: AnimatedView,
  createAnimatedComponent,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  interpolate,
  Extrapolate: { CLAMP: 'clamp', IDENTITY: 'identity', EXTEND: 'extend' },
  runOnJS: (f) => f,
  runOnUI: (f) => f,
  useAnimatedReaction: () => {},
  useAnimatedGestureHandler: () => ({}),
  useAnimatedScrollHandler: () => ({}),
  useDerivedValue: (v) => ({ value: v }),
  cancelAnimation: () => {},
};
