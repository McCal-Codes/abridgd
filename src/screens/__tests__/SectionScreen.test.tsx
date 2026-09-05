import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";
import { SectionScreen } from "../SectionScreen";
import { useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn() }),
    useRoute: jest.fn(),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(),
}));

let mockProfileContext: any = {
  activeProfile: null,
  recordLastFetchedArticles: jest.fn(),
};

jest.mock("../../context/ProfileContext", () => ({
  useProfilesOptional: () => mockProfileContext,
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

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
}));

let mockInsets = { top: 0, bottom: 0, left: 0, right: 0 };
(useSafeAreaInsets as jest.Mock).mockImplementation(() => mockInsets);

(useRoute as jest.Mock).mockReturnValue({
  params: { category: "Technology" },
});

const sampleArticle = {
  id: "1",
  headline: "Tech Story",
  summary: "",
  body: "",
  source: "Test",
  timestamp: "Today",
  publishedAt: Date.now(),
  category: "Technology",
  readTimeMinutes: 1,
};

describe("SectionScreen", () => {
  const settleVirtualizedList = async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockProfileContext = {
      activeProfile: null,
      recordLastFetchedArticles: jest.fn(),
    };
    mockUseCategoryFeed.mockReturnValue({
      ...baseFeedState,
      loading: false,
      lastUpdated: new Date(),
      articles: [sampleArticle],
    });
  });

  it("shows updated timestamp after load", async () => {
    const { findByTestId } = render(<SectionScreen />);
    const updated = await findByTestId("section-updated");
    expect(updated).toBeTruthy();
    expect(mockProfileContext.recordLastFetchedArticles).toHaveBeenCalledWith(["1"]);
    await settleVirtualizedList();
  });

  it("refresh sets updated timestamp and swaps in new articles", async () => {
    const refreshedArticle = { ...sampleArticle, id: "2", headline: "Refreshed Story" };

    // Stateful mock so pull-to-refresh actually triggers a re-render, like the real hook.
    mockUseCategoryFeed.mockImplementation(() => {
      const [state, setState] = React.useState({
        ...baseFeedState,
        loading: false,
        lastUpdated: new Date(),
        articles: [sampleArticle],
      });
      return {
        ...state,
        refresh: async () => {
          setState((prev: any) => ({ ...prev, articles: [refreshedArticle] }));
          return { count: 1, failed: false };
        },
      };
    });

    const { getByTestId, findByText } = render(<SectionScreen />);
    await findByText("Tech Story");

    await act(async () => {
      const list = getByTestId("section-list");
      await list.props.onRefresh();
    });

    expect(await findByText("Refreshed Story")).toBeTruthy();
    await settleVirtualizedList();
  });

  it("shows a network error state when there is no cache and the fetch fails", async () => {
    mockUseCategoryFeed.mockReturnValue({ ...baseFeedState, loading: false, error: "Boom" });

    const { findByText } = render(<SectionScreen />);

    expect(await findByText(/Network error/i)).toBeTruthy();
    expect(await findByText(/Boom/i)).toBeTruthy();
    await settleVirtualizedList();
  });

  it("keeps cached articles visible when a background refresh fails", async () => {
    mockUseCategoryFeed.mockReturnValue({
      ...baseFeedState,
      loading: false,
      error: "Boom",
      articles: [{ ...sampleArticle, id: "cached-1", headline: "Cached Tech Story" }],
    });

    const { findByText, findByTestId, queryByText } = render(<SectionScreen />);

    expect(await findByText("Cached Tech Story")).toBeTruthy();
    expect(await findByTestId("section-feed-status")).toBeTruthy();
    expect(queryByText(/Network error/i)).toBeNull();
    expect(mockProfileContext.recordLastFetchedArticles).toHaveBeenCalledWith(["cached-1"]);
    await settleVirtualizedList();
  });

  it("renders a skeleton, not the empty state, while a cold-start fetch is in flight", async () => {
    mockUseCategoryFeed.mockReturnValue({ ...baseFeedState, loading: true, articles: [] });

    const { getAllByTestId, queryByText } = render(<SectionScreen />);
    expect(getAllByTestId("article-card-skeleton").length).toBeGreaterThan(0);
    expect(queryByText(/No articles in/i)).toBeNull();
    await settleVirtualizedList();
  });
});
