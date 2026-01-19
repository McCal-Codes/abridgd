import React from "react";
import { act, render } from "@testing-library/react-native";
import { Animated } from "react-native";
import { HomeScreen } from "../HomeScreen";
import { ScrollContext } from "../../context/ScrollContext";
import { fetchArticlesByCategory } from "../../services/RssService";

jest.mock("../../services/RssService", () => ({
  fetchArticlesByCategory: jest.fn(),
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
};

const resetSettings = (overrides: Partial<typeof baseSettings> = {}) => {
  mockSettings = { ...baseSettings, ...overrides };
};

resetSettings();

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
  });

  it("renders loading indicator initially", () => {
    const { getByText } = renderScreen();
    expect(getByText(/Fetching top stories/i)).toBeTruthy();
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
});
