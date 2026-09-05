// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock expo-secure-store (no official jest mock ships with it). Stateless by default — test
// files that need to exercise read/write/migration behavior override with their own
// jest.mock("expo-secure-store") + mockImplementation, same pattern used for AsyncStorage above.
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

Object.defineProperty(global, "__ExpoImportMetaRegistry", {
  configurable: true,
  enumerable: false,
  value: {},
  writable: true,
});

Object.defineProperty(global, "structuredClone", {
  configurable: true,
  enumerable: false,
  value:
    global.structuredClone ||
    ((value) => {
      if (value === undefined) {
        return undefined;
      }
      return JSON.parse(JSON.stringify(value));
    }),
  writable: true,
});

// Mock SafeAreaContext
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock lucide-react-native icons.
//
// A Proxy rather than a hand-maintained list: the previous allowlist meant any icon nobody had
// remembered to add resolved to undefined, and React only complains when that branch actually
// renders — so a missing entry surfaced as "Element type is invalid" in an unrelated test.
jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");

  const createMockIcon = (name) => {
    const Icon = React.forwardRef((props, ref) =>
      React.createElement(View, { ref, ...props, testID: "lucide-icon" }, null),
    );
    Icon.displayName = name;
    return Icon;
  };

  const cache = new Map();

  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop !== "string") return undefined;
        // Let Jest and the module system see through to the real module semantics.
        if (prop === "__esModule") return true;
        if (prop === "default") return undefined;
        if (!cache.has(prop)) cache.set(prop, createMockIcon(prop));
        return cache.get(prop);
      },
      has: () => true,
    },
  );
});

// Mock react-native-worklets
jest.mock("react-native-worklets", () => ({}));

// Mock react-native-reanimated (improved mock to avoid worklets issues)
jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const { View, ScrollView, FlatList } = require("react-native");

  const AnimatedView = View;
  AnimatedView.displayName = "Animated.View";

  const AnimatedScrollView = ScrollView;
  AnimatedScrollView.displayName = "Animated.ScrollView";

  const AnimatedFlatList = FlatList;
  AnimatedFlatList.displayName = "Animated.FlatList";

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      ScrollView: AnimatedScrollView,
      FlatList: AnimatedFlatList,
      createAnimatedComponent: (component) => component,
      event: jest.fn(() => () => {}),
      call: jest.fn(),
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    interpolate: jest.fn(() => 0),
    runOnJS: jest.fn((fn) => fn),
    Easing: { ease: jest.fn() },
  };
});

jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const { View } = require("react-native");

  // Mirrors the real builder's fluent API: every configuration method returns the gesture, so
  // a chain missing one method here fails only at test time, not on device.
  const createChain = () => {
    const chain = {};
    [
      "onBegin",
      "onStart",
      "onUpdate",
      "onEnd",
      "onFinalize",
      "onTouchesDown",
      "onTouchesUp",
      "activeOffsetX",
      "activeOffsetY",
      "failOffsetX",
      "failOffsetY",
      "minDistance",
      "maxPointers",
      "minPointers",
      "enabled",
      "shouldCancelWhenOutside",
      "simultaneousWithExternalGesture",
      "requireExternalGestureToFail",
      "hitSlop",
      "runOnJS",
      "numberOfTaps",
      "maxDuration",
      "maxDelay",
      "minDuration",
      "averageTouches",
    ].forEach((method) => {
      chain[method] = jest.fn(() => chain);
    });
    return chain;
  };

  return {
    GestureHandlerRootView: ({ children }) => React.createElement(View, {}, children),
    GestureDetector: ({ children }) => React.createElement(React.Fragment, null, children),
    Gesture: {
      Pan: createChain,
      Tap: createChain,
      Pinch: createChain,
      LongPress: createChain,
      Simultaneous: createChain,
      Race: createChain,
      Exclusive: createChain,
    },
    PanGestureHandler: ({ children }) => React.createElement(View, {}, children),
    State: {},
    TapGestureHandler: ({ children }) => React.createElement(View, {}, children),
  };
});

// Mock react-native-svg
jest.mock("react-native-svg", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    __esModule: true,
    default: View,
    Svg: View,
    Path: View,
    Circle: View,
    Rect: View,
    G: View,
    Line: View,
    Polygon: View,
  };
});

// Mock expo modules
jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

// Mock expo-apple-authentication
jest.mock("expo-apple-authentication", () => {
  const React = require("react");
  const { View } = require("react-native");
  const AppleAuthenticationButton = (props) => React.createElement(View, props, props.children);
  return {
    AppleAuthenticationButton,
    AppleAuthenticationButtonType: { SIGN_IN: "SIGN_IN" },
    AppleAuthenticationButtonStyle: { BLACK: "BLACK" },
    AppleAuthenticationScope: { FULL_NAME: "FULL_NAME", EMAIL: "EMAIL" },
    isAvailableAsync: jest.fn(() => Promise.resolve(true)),
    signInAsync: jest.fn(() =>
      Promise.resolve({
        user: "test-user",
        email: "user@example.com",
        fullName: { givenName: "Test", familyName: "User" },
        identityToken: "token",
        authorizationCode: "code",
        realUserStatus: 1,
      }),
    ),
  };
});

jest.mock("expo-status-bar", () => ({
  StatusBar: "StatusBar",
}));

// Mock expo-av Video
jest.mock("expo-av", () => {
  const React = require("react");
  const { View } = require("react-native");
  const MockVideo = React.forwardRef((props, ref) => React.createElement(View, { ref, ...props }));
  return {
    Video: MockVideo,
    Audio: {
      setAudioModeAsync: jest.fn(),
      Sound: function MockSound() {
        return {
          loadAsync: jest.fn(),
          playAsync: jest.fn(),
          unloadAsync: jest.fn(),
          setPositionAsync: jest.fn(),
        };
      },
    },
  };
});

// Use real console for better error visibility during debugging
