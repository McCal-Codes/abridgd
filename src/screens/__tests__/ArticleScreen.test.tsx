import React from "react";
import { fireEvent, render, waitFor, act } from "@testing-library/react-native";
import { ArticleScreen } from "../ArticleScreen";
import { Article } from "../../types/Article";
import { ScrollView } from "react-native";

const baseArticle: Article = {
  id: "test-article-1",
  headline: "Test Headline",
  summary: "Short summary for testing",
  body: "<p>This is a test article body.</p>",
  source: "Test Source",
  timestamp: "Jan 15, 2026",
  publishedAt: Date.now(),
  category: "Top",
  readTimeMinutes: 3,
  isSensitive: true,
  link: "https://example.com/article",
  contentWarnings: ["politics"],
  emotionalIntensity: "high",
};

let mockRouteArticle: Article = { ...baseArticle };

let mockSettings: any;
const baseSettings = {
  isReaderEnabled: true,
  isGroundingEnabled: true,
  isSummarizationEnabled: false,
  autoSaveOnComplete: false,
  fontSize: 16,
  sensitivePromptLevel: "full" as const,
  sensitiveActionPreference: "decide" as const,
  sensitiveTone: "gentle" as const,
  tabBarHeight: 92,
  tabBarBlur: true,
  allowContentUnderTabBar: false,
  tabBarStyle: "standard" as const,
  tabBarDockedHeight: 92,
  tabBarFloatingHeight: 64,
  groundingColor: "#4A90E2",
  groundingBreathDuration: 4,
  groundingCycles: 3,
};

const resetSettings = (overrides: Partial<typeof baseSettings> = {}) => {
  mockSettings = { ...baseSettings, ...overrides };
};

resetSettings();

const mockSavedArticlesApi = {
  savedArticles: [] as Article[],
  saveArticle: jest.fn(),
  unsaveArticle: jest.fn(),
  isArticleSaved: jest.fn(() => false),
};

jest.mock("../../context/SavedArticlesContext", () => ({
  useSavedArticles: () => mockSavedArticlesApi,
}));

jest.mock("../../context/SettingsContext", () => ({
  useSettings: () => mockSettings,
}));

const mockReadingProgressApi = {
  progressData: {},
  isLoading: false,
  error: null,
  updateProgress: jest.fn(() => Promise.resolve()),
  getProgress: jest.fn<any, any>(() => undefined),
  clearProgress: jest.fn(() => Promise.resolve()),
  inProgressArticles: [],
  readingStats: {
    totalArticlesRead: 0,
    totalReadTimeSeconds: 0,
    averageCompletionPercentage: 0,
    articlesInProgress: 0,
  },
  refreshStats: jest.fn(() => Promise.resolve()),
};

jest.mock("../../context/ReadingProgressContext", () => ({
  useReadingProgress: () => mockReadingProgressApi,
  useReadingProgressOptional: () => mockReadingProgressApi,
}));

jest.mock("react-native-gesture-handler", () => {
  const React = require("react");

  const createChain = (): any => {
    const chain: any = {
      onBegin: jest.fn(() => chain),
      onUpdate: jest.fn(() => chain),
      onEnd: jest.fn(() => chain),
      onFinalize: jest.fn(() => chain),
    };
    return chain;
  };

  return {
    GestureDetector: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    Gesture: {
      Pan: createChain,
    },
  };
});

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  getParent: jest.fn(),
};

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useRoute: () => ({ key: "test-key", name: "Article", params: { article: mockRouteArticle } }),
    useNavigation: () => mockNavigation,
  };
});

jest.mock("../../components/AbridgedReader", () => {
  const React = require("react");
  const { Text } = require("react-native");
  const AbridgedReader = ({ content }: any) =>
    React.createElement(Text, {}, `Reader:${content?.length || 0}`);
  return {
    AbridgedReader,
  };
});

jest.mock("../../components/GroundingOverlay", () => {
  const React = require("react");
  const { Text, Pressable } = require("react-native");
  const GroundingOverlay = ({ onClose }: { onClose: () => void }) =>
    React.createElement(
      Pressable,
      { onPress: onClose },
      React.createElement(Text, {}, "Grounding overlay active"),
    );
  return {
    GroundingOverlay,
  };
});

jest.mock("../../services/FullStoryService", () => ({
  fetchFullArticleBody: jest.fn(() => Promise.resolve("<p>full body</p>")),
}));

jest.mock("../../services/AiService", () => ({
  summarizeArticle: jest.fn(() => Promise.resolve("Mock summary")),
}));

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
  NotificationFeedbackType: { Success: "success", Warning: "warning" },
}));

describe("ArticleScreen sensitive gating", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    mockRouteArticle = { ...baseArticle };
    mockSavedArticlesApi.isArticleSaved.mockReturnValue(false);
    resetSettings();
    mockReadingProgressApi.getProgress.mockReturnValue(undefined);
  });

  it("shows sensitive gating prompt when article triggers grounding", () => {
    const { getByText, queryByText } = render(<ArticleScreen />);

    expect(getByText("Sensitive Content")).toBeTruthy();
    expect(getByText(/Take a short grounding pause/i)).toBeTruthy();
    expect(queryByText(mockRouteArticle.headline)).toBeNull();
  });

  it("allows continuing without grounding", async () => {
    const { getByText, queryByText, findByText } = render(<ArticleScreen />);

    const continueButton = getByText("Continue without grounding");

    await act(async () => {
      fireEvent.press(continueButton);
    });

    // Wait for the sensitive content screen to disappear
    await waitFor(
      () => {
        expect(queryByText("Sensitive Content")).toBeNull();
      },
      { timeout: 3000 },
    );

    // Verify the article headline is now visible
    expect(await findByText(mockRouteArticle.headline)).toBeTruthy();
  });

  it("opens the grounding overlay when choosing to take a breath", async () => {
    const { getByText, findByText } = render(<ArticleScreen />);

    const breathButton = getByText("Take a breath first");

    await act(async () => {
      fireEvent.press(breathButton);
    });

    // Wait for the grounding overlay to appear
    const groundingText = await findByText("Grounding overlay active", {}, { timeout: 3000 });
    expect(groundingText).toBeTruthy();
  });

  it("marks completion safely when the article has no scrollable distance", async () => {
    const { getByText, findByText, UNSAFE_getByType } = render(<ArticleScreen />);

    await act(async () => {
      fireEvent.press(getByText("Continue without grounding"));
    });

    await findByText(mockRouteArticle.headline);

    const scrollView = UNSAFE_getByType(ScrollView);

    act(() => {
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 0 },
          contentSize: { height: 600 },
          layoutMeasurement: { height: 600 },
        },
      });
    });

    await waitFor(() => {
      expect(mockReadingProgressApi.updateProgress).toHaveBeenCalledWith(
        mockRouteArticle.id,
        expect.objectContaining({
          status: "completed",
          scrollPosition: 1,
          completionPercentage: 100,
        }),
      );
    });
  });

  it("keeps completed articles completed during reading-time sync", async () => {
    jest.useFakeTimers();
    mockReadingProgressApi.getProgress.mockReturnValue({
      articleId: mockRouteArticle.id,
      scrollPosition: 1,
      completionPercentage: 100,
      startedAt: 1,
      lastReadAt: 2,
      totalReadTimeSeconds: 20,
      status: "completed",
    });

    render(<ArticleScreen />);

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => {
      expect(mockReadingProgressApi.updateProgress).toHaveBeenCalledWith(
        mockRouteArticle.id,
        expect.objectContaining({
          totalReadTimeSeconds: 30,
          status: "completed",
        }),
      );
    });
  });
});
