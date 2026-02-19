// Mock for react-native-reanimated to prevent Jest transformation issues
// Provides minimal stub implementations for the hooks and components we use

const React = require('react');
const { View } = require('react-native');

// Create a simple Animated View mock
const AnimatedView = React.forwardRef((props, ref) => React.createElement(View, { ...props, ref }));

// Mock shared value hook
const useSharedValue = (initial) => ({
  value: initial,
});

// Mock animated style hook
const useAnimatedStyle = (factory, deps) => {
  // Just return an empty style object
  return {};
};

// Mock with timing
const withTiming = (value, config, callback) => value;

// Mock with spring
const withSpring = (value, config, callback) => value;

// Mock with delay
const withDelay = (delay, animation) => animation;

// Mock with sequence
const withSequence = (...animations) => animations[animations.length - 1];

// Mock interpolate
const interpolate = (value, inputRange, outputRange, options) => outputRange[0] || 0;

// Mock useAnimatedProps
const useAnimatedProps = (factory, deps) => ({});

// Mock createAnimatedComponent
const createAnimatedComponent = (Component) => {
  return React.forwardRef((props, ref) => {
    return React.createElement(Component, { ...props, ref });
  });
};

// Mock the main Animated object
const Animated = Object.assign(
  React.forwardRef((props, ref) => React.createElement(View, { ...props, ref })),
  {
    View: AnimatedView,
    createAnimatedComponent,
    // Add any other components that might be used
    Text: React.forwardRef((props, ref) => React.createElement('Text', { ...props, ref })),
    Image: React.forwardRef((props, ref) => React.createElement('Image', { ...props, ref })),
    ScrollView: React.forwardRef((props, ref) => React.createElement('ScrollView', { ...props, ref })),
    FlatList: React.forwardRef((props, ref) => React.createElement('FlatList', { ...props, ref })),
  }
);

module.exports = {
  default: Animated,
  __esModule: true,
  ...Animated,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  interpolate,
  interpolateColor: interpolate,
  Easing: {
    linear: (t) => t,
    ease: (t) => t,
    quad: (t) => t * t,
    cubic: (t) => t * t * t,
  },
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
};
