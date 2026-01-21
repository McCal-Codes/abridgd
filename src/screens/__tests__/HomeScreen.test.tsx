import React from "react";
import { act, render, fireEvent, waitFor } from "@testing-library/react-native";
import { Animated } from "react-native";
import { HomeScreen } from "../HomeScreen";
import { ScrollContext } from "../../context/ScrollContext";
import { fetchArticlesByCategory } from "../../services/RssService";

jest.mock("../../services/RssService", () => ({
  fetchArticlesByCategory: jest.fn(),
  getLastFetchedAt: jest.fn(() => Date.now()),
}));

jest.mock("../../context/SavedArticlesContext", () => ({
  useSavedArticles: () => mockSavedArticlesContext,
}));

jest.mock("../../context/ReadingProgressContext", () => ({
  useReadingProgressOptional: () => mockReadingProgressContext,
}));

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
}));

jest.mock("../../components/ArticleCard", () => {
  const React = require("react");
  const { Text, Pressable } = require("react-native");
  return {
    ArticleCard: ({ article, onPress }: any) =>
      React.createElement(
        Pressable,
        { onPress, accessibilityRole: "button" },
        React.createElement(Text, {}, article.headline),
      ),
    ArticleCardSkeleton: () =>
      React.createElement(Text, { testID: "article-card-skeleton" }, "Skeleton"),
  };
});

jest.mock("../../components/FunLoadingIndicator", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    FunLoadingIndicator: ({ message }: { message: string }) =>
      React.createElement(Text, {}, message),
  };
});

let mockSettings: any;
const baseSettings = {
  tabBarHeight: 92,
  tabBarBlur: true,
  allowContentUnderTabBar: false,
  tabBarStyle: "standard" as const,
  tabBarDockedHeight: 92,
  tabBarFloatingHeight: 64,
  isContinueReadingEnabled: false,
};

const resetSettings = (overrides: Partial<typeof baseSettings> = {}) => {
  mockSettings = { ...baseSettings, ...overrides };
};

resetSettings();

let mockSavedArticlesContext: any = {
  savedArticles: [],
  saveArticle: jest.fn(),
  unsaveArticle: jest.fn(),
  isArticleSaved: jest.fn(),
  isLoading: false,
  error: null,
};

let mockReadingProgressContext: any = {
  progressData: {},
  isLoading: false,
  error: null,
  updateProgress: jest.fn(),
  getProgress: jest.fn(),
  clearProgress: jest.fn(),
  inProgressArticles: [],
  readingStats: {
    totalArticlesRead: 0,
    totalReadTimeSeconds: 0,
    averageCompletionPercentage: 0,
    articlesInProgress: 0,
  },
  refreshStats: jest.fn(),
};

jest.mock("../../context/SettingsContext", () => ({
  useSettings: () => mockSettings,
}));

const mockNavigation = { navigate: jest.fn() };
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => mockNavigation,
  };
});

describe("HomeScreen", () => {
  const scrollY = new Animated.Value(0);

  const renderScreen = () =>
    render(
      <ScrollContext.Provider value={{ scrollY }}>
        <HomeScreen />
      </ScrollContext.Provider>,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    resetSettings();
    (fetchArticlesByCategory as jest.Mock).mockResolvedValue([]);
    mockSavedArticlesContext = {
      savedArticles: [],
      saveArticle: jest.fn(),
      unsaveArticle: jest.fn(),
      isArticleSaved: jest.fn(),
      isLoading: false,
      error: null,
    };
    mockReadingProgressContext = {
      progressData: {},
      isLoading: false,
      error: null,
      updateProgress: jest.fn(),
      getProgress: jest.fn(),
      clearProgress: jest.fn(),
      inProgressArticles: [],
      readingStats: {
        totalArticlesRead: 0,
        totalReadTimeSeconds: 0,
        averageCompletionPercentage: 0,
        articlesInProgress: 0,
      },
      refreshStats: jest.fn(),
    };
  });

  it("renders loading skeletons initially", () => {
    const { getAllByTestId } = renderScreen();
    expect(getAllByTestId("article-card-skeleton").length).toBeGreaterThan(0);
  });

  it("displays fetched headlines", async () => {
    (fetchArticlesByCategory as jest.Mock).mockResolvedValueOnce([
      {
        id: "1",
        headline: "First",
        summary: "",
        body: "",
        source: "",
        timestamp: "",
        publishedAt: Date.now(),
        category: "Top",
        readTimeMinutes: 1,
      },
    ]);

    const { findByText } = renderScreen();

    expect(await findByText("First")).toBeTruthy();
  });

  it("shows error state when fetch fails", async () => {
    (fetchArticlesByCategory as jest.Mock).mockRejectedValueOnce(new Error("Boom"));

    const { findByText } = renderScreen();

    expect(await findByText(/Network error/i)).toBeTruthy();
    expect(await findByText(/Boom/i)).toBeTruthy();
  });

  it("refreshes the feed via pull-to-refresh", async () => {
    const firstArticles = [
      {
        id: "1",
        headline: "First",
        summary: "",
        body: "",
        source: "",
        timestamp: "",
        publishedAt: Date.now(),
        category: "Top",
        readTimeMinutes: 1,
      },
    ];
    const secondArticles = [
      {
        id: "2",
        headline: "Second",
        summary: "",
        body: "",
        source: "",
        timestamp: "",
        publishedAt: Date.now(),
        category: "Top",
        readTimeMinutes: 1,
      },
    ];

    (fetchArticlesByCategory as jest.Mock).mockResolvedValueOnce(firstArticles);

    const { findByText, getByTestId } = renderScreen();

    expect(await findByText("First")).toBeTruthy();

    (fetchArticlesByCategory as jest.Mock).mockResolvedValueOnce(secondArticles);

    act(() => {
      const list = getByTestId("home-list");
      list.props.onRefresh();
    });

    expect(await findByText("Second")).toBeTruthy();
    expect(fetchArticlesByCategory).toHaveBeenCalledTimes(2);
  });

  it("shows continue reading items and toggles Show all", async () => {
    resetSettings({ isContinueReadingEnabled: true });
    const inProgress = Array.from({ length: 4 }).map((_, index) => ({
      id: `${index + 1}`,
      headline: `Story ${index + 1}`,
      summary: "",
      body: "",
      source: "Test Source",
      timestamp: "Today",
      publishedAt: Date.now(),
      category: "Top",
      readTimeMinutes: 1,
    }));

    mockSavedArticlesContext.savedArticles = inProgress;
    mockReadingProgressContext.inProgressArticles = inProgress.map((article) => ({
      articleId: article.id,
      scrollPosition: 0.5,
      completionPercentage: 50,
      startedAt: Date.now() - 1000,
      lastReadAt: Date.now(),
      totalReadTimeSeconds: 60,
      status: "in-progress",
    }));

    const { findByTestId, findByText, getByText } = renderScreen();

    expect(await findByTestId("continue-reading")).toBeTruthy();

    const showAllButton = await findByText(/Show all/i);
    act(() => {
      fireEvent.press(showAllButton);
    });

    await waitFor(() => expect(getByText(/Hide/i)).toBeTruthy());
  });
});
