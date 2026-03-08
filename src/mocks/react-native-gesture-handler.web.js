const React = require('react');
const RN = require('react-native');

const createPassthrough = (Component = RN.View) =>
  React.forwardRef(({ children, ...props }, ref) =>
    React.createElement(Component, { ...props, ref }, children),
  );

const GestureHandlerRootView = createPassthrough(RN.View);
const PanGestureHandler = createPassthrough(RN.View);
const TapGestureHandler = createPassthrough(RN.View);
const LongPressGestureHandler = createPassthrough(RN.View);
const FlingGestureHandler = createPassthrough(RN.View);
const ForceTouchGestureHandler = createPassthrough(RN.View);
const PinchGestureHandler = createPassthrough(RN.View);
const RotationGestureHandler = createPassthrough(RN.View);
const NativeViewGestureHandler = createPassthrough(RN.View);
const DrawerLayout = createPassthrough(RN.View);

const gestureHandlerRootHOC = (Component) => Component;
const createNativeWrapper = (Component) => Component;

const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

const Directions = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
};

module.exports = {
  __esModule: true,
  default: {},
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  FlingGestureHandler,
  ForceTouchGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  NativeViewGestureHandler,
  DrawerLayout,
  TouchableOpacity: RN.TouchableOpacity,
  TouchableHighlight: RN.TouchableHighlight,
  TouchableWithoutFeedback: RN.TouchableWithoutFeedback,
  ScrollView: RN.ScrollView,
  FlatList: RN.FlatList,
  Switch: RN.Switch,
  TextInput: RN.TextInput,
  gestureHandlerRootHOC,
  createNativeWrapper,
  State,
  Directions,
};
