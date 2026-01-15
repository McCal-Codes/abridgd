// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock SafeAreaContext
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const createMockIcon = () => React.forwardRef((props, ref) => 
    React.createElement(View, { ref, ...props, testID: 'lucide-icon' }, null)
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
  };
});

// Mock react-native-worklets
jest.mock('react-native-worklets', () => ({}));

// Mock react-native-reanimated (improved mock to avoid worklets issues)
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    default: {
      View: View,
      ScrollView: View,
      FlatList: View,
      createAnimatedComponent: (component) => component,
      event: jest.fn(() => () => {}),
      call: jest.fn(),
    },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    Easing: { ease: jest.fn() },
  };
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  
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
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Use real console for better error visibility during debugging
