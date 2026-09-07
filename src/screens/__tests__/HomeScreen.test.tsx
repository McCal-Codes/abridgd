import React from "react";
import { act, render, fireEvent, waitFor } from "@testing-library/react-native";
import { Animated } from "react-native";
import { HomeScreen } from "../HomeScreen";
import { ScrollContext } from "../../context/ScrollContext";
import { useCategoryFeed } from "../../hooks/useCategoryFeed";

const mockUseCategoryFeed = jest.fn();
jest.mock("../../hooks/useCategoryFeed", () => ({
  useCategoryFeed: (...args: unknown[]) => mockUseCategoryFeed(...args),
}));

const baseFeedState = {
  articles: [] as any[],
  loading: true,
  refreshing: false,
  error: null as string | null,
  stale: false,
  lastUpdated: null as Date | null,
  refresh: jest.fn(async () => ({ count: 0, failed: false })),
};

jest.mock("../../context/SavedArticlesContext", () => ({
  useSavedArticles: () => mockSavedArticlesContext,
}));

jest.mock("../../context/ReadingProgressContext", () => ({
  useReadingProgressOptional: () => mockReadingProgressContext,
}));

let mockProfileContext: any = {
  activeProfile: null,
  recordLastFetchedArticles: jest.fn(),
};

jest.mock("../../context/ProfileContext", () => ({
  useProfilesOptional: () => mockProfileContext,
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

  const settleVirtualizedList = async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetSettings();
    mockUseCategoryFeed.mockReturnValue({ ...baseFeedState, refresh: jest.fn(async () => ({ count: 0, failed: false })) });
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
    mockProfileContext = {
      activeProfile: null,
      recordLastFetchedArticles: jest.fn(),
    };
  });

  afterEach(async () => {
    await settleVirtualizedList();
  });

  it("renders loading indicator initially", () => {
    mockUseCategoryFeed.mockReturnValue({ ...baseFeedState, loading: true });
    const { getByText } = renderScreen();
    expect(getByText("Preparing your morning brief…")).toBeTruthy();
  });

  it("displays fetched headlines without a blocking spinner once cache/fresh data arrives", async () => {
    mockUseCategoryFeed.mockReturnValue({
      ...baseFeedState,
      articles: [
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
      ],
      loading: false,
    });

    const { findByText } = renderScreen();

    expect(await findByText("Morning Brief")).toBeTruthy();
    expect(await findByText("Today's Brief")).toBeTruthy();
    expect(await findByText("First")).toBeTruthy();
    expect(mockProfileContext.recordLastFetchedArticles).toHaveBeenCalledWith(["1"]);
    await settleVirtualizedList();
  });

  it("shows error state when there is no cache and the fetch fails", async () => {
    mockUseCategoryFeed.mockReturnValue({ ...baseFeedState, loading: false, error: "Boom" });

    const { findByText } = renderScreen();

    expect(await findByText(/We couldn't refresh your brief/i)).toBeTruthy();
    expect(await findByText(/Boom/i)).toBeTruthy();
    await settleVirtualizedList();
  });

  it("keeps cached stories visible when a background refresh fails", async () => {
    mockUseCategoryFeed.mockReturnValue({
      ...baseFeedState,
      loading: false,
      error: "Boom",
      articles: [
        {
          id: "cached-1",
          headline: "Cached Story",
          summary: "",
          body: "",
          source: "Cache",
          timestamp: "",
          publishedAt: Date.now(),
          category: "Top",
          readTimeMinutes: 1,
        },
      ],
    });

    const { findByText, findByTestId, queryByText } = renderScreen();

    expect(await findByText("Cached Story")).toBeTruthy();
    expect(await findByTestId("home-feed-status")).toBeTruthy();
    expect(queryByText(/We couldn't refresh your brief/i)).toBeNull();
    expect(mockProfileContext.recordLastFetchedArticles).toHaveBeenCalledWith(["cached-1"]);
    await settleVirtualizedList();
  });

  it("shows the cached banner (not fresh) when the feed hook reports stale data", async () => {
    mockUseCategoryFeed.mockReturnValue({
      ...baseFeedState,
      loading: false,
      stale: true,
      articles: [
        {
          id: "1",
          headline: "Stale Story",
          summary: "",
          body: "",
          source: "",
          timestamp: "",
          publishedAt: Date.now(),
          category: "Top",
          readTimeMinutes: 1,
        },
      ],
    });

    const { findByTestId } = renderScreen();
    expect(await findByTestId("home-feed-status")).toBeTruthy();
    await settleVirtualizedList();
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

    // Stateful mock so pull-to-refresh actually triggers a re-render, like the real hook.
    mockUseCategoryFeed.mockImplementation(() => {
      const [state, setState] = React.useState({
        ...baseFeedState,
        loading: false,
        articles: firstArticles,
      });
      return {
        ...state,
        refresh: async () => {
          setState((prev: any) => ({ ...prev, articles: secondArticles }));
          return { count: secondArticles.length, failed: false };
        },
      };
    });

    const { findByText, getByTestId } = renderScreen();

    expect(await findByText("First")).toBeTruthy();

    await act(async () => {
      const list = getByTestId("home-list");
      await list.props.onRefresh();
    });

    expect(await findByText("Second")).toBeTruthy();
    await settleVirtualizedList();
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
    mockUseCategoryFeed.mockReturnValue({
      ...baseFeedState,
      loading: false,
      articles: [inProgress[0]],
    });

    const { findByTestId, findByText, getByText } = renderScreen();

    expect(await findByTestId("continue-reading")).toBeTruthy();

    const showAllButton = await findByText(/Show all/i);
    act(() => {
      fireEvent.press(showAllButton);
    });

    await waitFor(() => expect(getByText(/Hide/i)).toBeTruthy());
    await settleVirtualizedList();
  });
});
