import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";
import { SectionScreen } from "../SectionScreen";
import { fetchArticlesByCategory, getCachedArticles } from "../../services/RssService";
import { useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

jest.mock("../../services/RssService", () => ({
  fetchArticlesByCategory: jest.fn(),
  getCachedArticles: jest.fn(() => null),
  getLastFetchedAt: jest.fn(() => Date.now()),
}));

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
    (getCachedArticles as jest.Mock).mockReturnValue(null);
    (fetchArticlesByCategory as jest.Mock).mockResolvedValue([
      {
        id: "1",
        headline: "Tech Story",
        summary: "",
        body: "",
        source: "Test",
        timestamp: "Today",
        publishedAt: Date.now(),
        category: "Technology",
        readTimeMinutes: 1,
      },
    ]);
  });

  it("shows updated timestamp after load", async () => {
    const { findByTestId } = render(<SectionScreen />);
    const updated = await findByTestId("section-updated");
    expect(updated).toBeTruthy();
    expect(mockProfileContext.recordLastFetchedArticles).toHaveBeenCalledWith(["1"]);
    await settleVirtualizedList();
  });

  it("refresh sets updated timestamp", async () => {
    const { getByTestId, findByText } = render(<SectionScreen />);
    await findByText("Tech Story");

    (fetchArticlesByCategory as jest.Mock).mockResolvedValueOnce([
      {
        id: "2",
        headline: "Refreshed Story",
        summary: "",
        body: "",
        source: "Test",
        timestamp: "Today",
        publishedAt: Date.now(),
        category: "Technology",
        readTimeMinutes: 1,
      },
    ]);

    act(() => {
      const list = getByTestId("section-list");
      list.props.onRefresh();
    });

    expect(await findByText("Refreshed Story")).toBeTruthy();
    await settleVirtualizedList();
  });

  it("shows an error state when no articles can be loaded", async () => {
    (fetchArticlesByCategory as jest.Mock).mockRejectedValueOnce(new Error("Boom"));

    const { findByText } = render(<SectionScreen />);

    expect(await findByText(/Network error/i)).toBeTruthy();
    expect(await findByText(/Boom/i)).toBeTruthy();
    await settleVirtualizedList();
  });

  it("keeps cached articles visible when refresh fails", async () => {
    (getCachedArticles as jest.Mock).mockReturnValue([
      {
        id: "cached-1",
        headline: "Cached Tech Story",
        summary: "",
        body: "",
        source: "Test",
        timestamp: "Today",
        publishedAt: Date.now(),
        category: "Technology",
        readTimeMinutes: 1,
      },
    ]);
    (fetchArticlesByCategory as jest.Mock).mockRejectedValueOnce(new Error("Boom"));

    const { findByText, findByTestId, queryByText } = render(<SectionScreen />);

    expect(await findByText("Cached Tech Story")).toBeTruthy();
    expect(await findByTestId("section-feed-status")).toBeTruthy();
    expect(queryByText(/Network error/i)).toBeNull();
    expect(mockProfileContext.recordLastFetchedArticles).toHaveBeenCalledWith(["cached-1"]);
    await settleVirtualizedList();
  });
});
