/**
 * Web stub for react-native-reanimated.
 *
 * Reanimated's native hooks (useSharedValue, etc.) rely on Reanimated's
 * Babel plugin + JSI/native runtime which are not available in a webpack
 * web bundle. This stub provides no-op equivalents so components that
 * import reanimated still render on web without crashing.
 *
 * The webpack alias 'react-native-reanimated' → this file is set in
 * webpack.config.js.
 */

const React = require('react');
const { View } = require('react-native');

// ---------------------------------------------------------------------------
// Animated namespace (mirrors RN's own Animated API shape)
// ---------------------------------------------------------------------------

const AnimatedView = React.forwardRef((props, ref) =>
  React.createElement(View, { ...props, ref }),
);

const createAnimatedComponent = (Component) =>
  React.forwardRef((props, ref) =>
    React.createElement(Component, { ...props, ref }),
  );

const Animated = Object.assign(
  React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref }),
  ),
  {
    View: AnimatedView,
    Text: React.forwardRef((props, ref) =>
      React.createElement('Text', { ...props, ref }),
    ),
    Image: React.forwardRef((props, ref) =>
      React.createElement('Image', { ...props, ref }),
    ),
    ScrollView: React.forwardRef((props, ref) =>
      React.createElement('ScrollView', { ...props, ref }),
    ),
    FlatList: React.forwardRef((props, ref) =>
      React.createElement('FlatList', { ...props, ref }),
    ),
    createAnimatedComponent,
  },
);

// ---------------------------------------------------------------------------
// Hooks – all no-ops; animations simply won't run on web
// ---------------------------------------------------------------------------

const useSharedValue = (initial) => ({ value: initial });

const useAnimatedStyle = () => ({});

const useAnimatedProps = () => ({});

// ---------------------------------------------------------------------------
// Animation builders – return final value directly (no interpolation)
// ---------------------------------------------------------------------------

const withTiming = (toValue /*, config, callback */) => toValue;

const withSpring = (toValue /*, config, callback */) => toValue;

const withRepeat = (animation /*, numberOfReps, reverse */) => animation;

const withDelay = (_delay, animation) => animation;

const withSequence = (...animations) => animations[animations.length - 1] ?? 0;

// ---------------------------------------------------------------------------
// interpolate
// ---------------------------------------------------------------------------

const interpolate = (_value, _inputRange, outputRange /*, options */) =>
  Array.isArray(outputRange) ? outputRange[0] ?? 0 : 0;

// ---------------------------------------------------------------------------
// Enums / constants – match the reanimated shape so destructured imports work
// ---------------------------------------------------------------------------

const Extrapolate = {
  CLAMP: 'clamp',
  EXTEND: 'extend',
  IDENTITY: 'identity',
};

const ReduceMotion = {
  System: 'system',
  Always: 'always',
  Never: 'never',
};

const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t * t,
  cubic: (t) => t * t * t,
  inOut: (fn) => fn,
  out: (fn) => fn,
  in: (fn) => fn,
  bezier: () => (t) => t,
  circle: (t) => 1 - Math.sqrt(1 - t * t),
  sin: (t) => Math.sin((t * Math.PI) / 2),
  exp: (t) => Math.pow(2, 10 * (t - 1)),
  elastic: () => (t) => t,
  back: () => (t) => t,
  bounce: (t) => t,
  poly: () => (t) => t,
  step0: () => (t) => (t !== 0 ? 1 : 0),
  step1: () => (t) => (t === 1 ? 1 : 0),
};

// ---------------------------------------------------------------------------
// Worklet utilities
// ---------------------------------------------------------------------------

const runOnJS = (fn) => fn;
const runOnUI = (fn) => fn;

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  withRepeat,
  withDelay,
  withSequence,
  interpolate,
  interpolateColor: interpolate,
  Extrapolate,
  ReduceMotion,
  Easing,
  createAnimatedComponent,
  runOnJS,
  runOnUI,
};
