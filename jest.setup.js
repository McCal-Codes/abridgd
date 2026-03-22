// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock SafeAreaContext
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  return {
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock lucide-react-native icons
jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");
  const createMockIcon = () =>
    React.forwardRef((props, ref) =>
      React.createElement(View, { ref, ...props, testID: "lucide-icon" }, null),
    );

  return {
    // ArticleScreen icons
    Waypoints: createMockIcon(),
    Zap: createMockIcon(),
    Bookmark: createMockIcon(),
    // Other icons used in the app
    Flame: createMockIcon(),
    MapPin: createMockIcon(),
    Briefcase: createMockIcon(),
    Trophy: createMockIcon(),
    Palette: createMockIcon(),
    Newspaper: createMockIcon(),
    Settings: createMockIcon(),
    Home: createMockIcon(),
    Search: createMockIcon(),
    Star: createMockIcon(),
    BookOpen: createMockIcon(),
    Rss: createMockIcon(),
    Layout: createMockIcon(),
    Bug: createMockIcon(),
    ChevronRight: createMockIcon(),
    ArrowRight: createMockIcon(),
    Plus: createMockIcon(),
    Trash2: createMockIcon(),
    RefreshCw: createMockIcon(),
    Database: createMockIcon(),
    FileText: createMockIcon(),
    GripVertical: createMockIcon(),
    Check: createMockIcon(),
    PauseCircle: createMockIcon(),
    Wind: createMockIcon(),
    Sliders: createMockIcon(),
    CheckCircle: createMockIcon(),
    RotateCcw: createMockIcon(),
    Undo2: createMockIcon(),
    Sparkles: createMockIcon(),
    ArrowRightCircle: createMockIcon(),
  };
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

  const createChain = () => {
    const chain = {
      onBegin: jest.fn(() => chain),
      onStart: jest.fn(() => chain),
      onUpdate: jest.fn(() => chain),
      onEnd: jest.fn(() => chain),
      onFinalize: jest.fn(() => chain),
    };
    return chain;
  };

  return {
    GestureHandlerRootView: ({ children }) => React.createElement(View, {}, children),
    GestureDetector: ({ children }) => React.createElement(React.Fragment, null, children),
    Gesture: {
      Pan: createChain,
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
