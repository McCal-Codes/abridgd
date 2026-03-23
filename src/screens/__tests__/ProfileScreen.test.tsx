import React from "react";
import { render } from "@testing-library/react-native";
import ProfileScreen from "../ProfileScreen";

const mockNavigation = {
  navigate: jest.fn(),
  getParent: () => ({
    setOptions: jest.fn(),
  }),
};

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => mockNavigation,
  };
});

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("lucide-react-native", () => {
  const React = require("react");
  const { View } = require("react-native");

  const createMockIcon = () =>
    React.forwardRef((props: object, ref: React.Ref<typeof View>) =>
      React.createElement(View, { ref, ...props }),
    );

  return {
    BookOpen: createMockIcon(),
    Flame: createMockIcon(),
    Mail: createMockIcon(),
    Shield: createMockIcon(),
    Sparkles: createMockIcon(),
    Target: createMockIcon(),
    UploadCloud: createMockIcon(),
    Download: createMockIcon(),
    User: createMockIcon(),
  };
});

jest.mock("../../components/GlassButton", () => ({
  GlassButton: ({ label, onPress }: { label: string; onPress?: () => void }) => {
    const React = require("react");
    const { Pressable, Text } = require("react-native");
    return React.createElement(
      Pressable,
      { onPress },
      React.createElement(Text, {}, label),
    );
  },
}));

jest.mock("../../components/SignInWithApple", () => ({
  SignInWithApple: () => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, {}, "Sign in with Apple");
  },
}));

jest.mock("../../components/ComingSoon", () => ({
  ComingSoon: ({ title }: { title: string }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, {}, title);
  },
}));

jest.mock("../../components/HeroHeader", () => ({
  HeroHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => {
    const React = require("react");
    const { View, Text } = require("react-native");
    return React.createElement(
      View,
      {},
      React.createElement(Text, {}, title),
      subtitle ? React.createElement(Text, {}, subtitle) : null,
    );
  },
}));

const twoDaysAgo = (() => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 12).getTime();
})();

const todayAtNoon = (() => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12).getTime();
})();

let mockProfiles: any = {
  activeProfile: {
    id: "profile-1",
    name: "Test Reader",
    codename: "Calm Otter",
    email: "",
    settingsTag: "Local profile",
    transferKey: "profile-key-123",
    savedArticles: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }],
    stats: {
      articlesRead: 2,
      savedActions: 3,
      lastReadAt: twoDaysAgo,
      lastSavedAt: todayAtNoon,
    },
  },
  signInWithAppleProfile: jest.fn(),
  signOut: jest.fn(),
  exportProfileKey: jest.fn(() => "profile-key-123"),
  importProfileKey: jest.fn(() => true),
  updateSettingsTag: jest.fn(),
};

jest.mock("../../context/ProfileContext", () => ({
  useProfiles: () => mockProfiles,
  getAchievementStatuses: () => [{ earned: true }, { earned: false }, { earned: false }],
}));

let mockSettings = {
  subscriptionFeaturesLocked: false,
  reduceMotion: false,
};

jest.mock("../../context/SettingsContext", () => ({
  useSettings: () => mockSettings,
}));

let mockReadingProgress = {
  readingStats: {
    totalArticlesRead: 5,
    totalReadTimeSeconds: 600,
    averageCompletionPercentage: 68,
    articlesInProgress: 2,
  },
};

jest.mock("../../context/ReadingProgressContext", () => ({
  useReadingProgressOptional: () => mockReadingProgress,
}));

describe("ProfileScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSettings = {
      subscriptionFeaturesLocked: false,
      reduceMotion: false,
    };
    mockReadingProgress = {
      readingStats: {
        totalArticlesRead: 5,
        totalReadTimeSeconds: 600,
        averageCompletionPercentage: 68,
        articlesInProgress: 2,
      },
    };
  });

  it("shows derived reading metrics and relative profile activity", () => {
    const { getByLabelText, getByText, queryByText } = render(<ProfileScreen />);

    expect(getByLabelText("Reads tracked 5")).toBeTruthy();
    expect(getByLabelText("Saved articles 4")).toBeTruthy();
    expect(getByLabelText("In progress, 2. Articles with saved reading progress")).toBeTruthy();
    expect(
      getByLabelText("Average completion, 68%. Average completion across tracked reads"),
    ).toBeTruthy();
    expect(getByText("Read time")).toBeTruthy();
    expect(getByText("10 min")).toBeTruthy();
    expect(getByLabelText("Last read, 2 days ago. Relative to today")).toBeTruthy();
    expect(getByLabelText("Last saved, Today. Most recent save action")).toBeTruthy();
    expect(getByLabelText("Karma tier, Warm tier. Steady up next")).toBeTruthy();
    expect(getByText("Account & backup")).toBeTruthy();
    expect(getByText("Support")).toBeTruthy();
    expect(getByText("View achievements (1/3)")).toBeTruthy();
    expect(
      getByText("Reading stats come from tracked sessions and stay on this device until sync launches."),
    ).toBeTruthy();
    expect(queryByText("Personalization & advanced features")).toBeNull();
    expect(queryByText("Sync & privacy")).toBeNull();
    expect(queryByText("Reading streak")).toBeNull();
  });
});
