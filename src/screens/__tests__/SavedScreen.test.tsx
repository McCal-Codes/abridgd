import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
jest.mock("../../theme/ThemeContext", () => ({
  ThemeProvider: ({ children }: any) => children,
  useTheme: () => ({
    colors: {
      background: "#fff",
      secondaryBackground: "#fff",
      surface: "#fff",
      text: "#000",
      textSecondary: "#666",
      textTertiary: "#999",
      separator: "#eee",
      border: "#eee",
      tint: "#0097A7",
      tintTransparent: "rgba(0,151,167,0.12)",
      accent: "#8B2E2E",
      primary: "#0097A7",
      systemRed: "#D32F2F",
      systemBlue: "#007AFF",
      error: "#D32F2F",
    },
    isDark: false,
    colorScheme: "light",
  }),
}));
const { ThemeProvider } = jest.requireMock("../../theme/ThemeContext");

import { SavedScreen } from "../SavedScreen";

const mockNavigate = jest.fn();
const mockParentNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      getParent: () => ({ navigate: mockParentNavigate }),
    }),
  };
});

jest.mock("../../components/ArticleCard", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    ArticleCard: ({ article }: any) => React.createElement(Text, {}, article.headline),
  };
});

let mockSavedArticlesState: any;
const createSavedArticlesState = (articles: any[] = []) => ({
  savedArticles: articles,
  saveArticle: jest.fn(),
  unsaveArticle: jest.fn(),
  isArticleSaved: jest.fn(),
});

jest.mock("../../context/SavedArticlesContext", () => ({
  useSavedArticles: () => mockSavedArticlesState,
}));

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: "medium" },
}));

jest.mock("lucide-react-native", () => {
  const React = require("react");
  return new Proxy(
    {},
    {
      get: (_target, name) =>
        ({ ...props }: any) => React.createElement("Icon", { name, ...props }),
    },
  );
});

let mockSettings: any;
const baseSettings: {
  tabBarHeight: number;
  allowContentUnderTabBar: boolean;
  tabBarStyle: "standard";
  tabBarDockedHeight: number;
  tabBarFloatingHeight: number;
  tabLayout: "simple" | "standard" | "power";
} = {
  tabBarHeight: 92,
  allowContentUnderTabBar: false,
  tabBarStyle: "standard" as const,
  tabBarDockedHeight: 92,
  tabBarFloatingHeight: 64,
  tabLayout: "standard" as const,
};

const resetSettings = (overrides: Partial<typeof baseSettings> = {}) => {
  mockSettings = { ...baseSettings, ...overrides };
};

resetSettings();

jest.mock("../../context/SettingsContext", () => ({
  useSettings: () => mockSettings,
}));

describe("SavedScreen", () => {
  beforeEach(() => {
    mockSavedArticlesState = createSavedArticlesState();
    resetSettings();
    mockNavigate.mockClear();
    mockParentNavigate.mockClear();
  });

const renderWithProviders = (ui: React.ReactNode) => render(ui);

  it("renders empty state when no saved articles", () => {
    const { getByText, getByTestId } = renderWithProviders(<SavedScreen />);

    expect(getByTestId("saved-empty-state")).toBeTruthy();
    expect(getByText("Your reading list is empty")).toBeTruthy();
    expect(getByText(/Swipe left on any article card/i)).toBeTruthy();
    expect(getByText("Explore Top Stories")).toBeTruthy();
  });

  it("renders saved articles when present", () => {
    mockSavedArticlesState = createSavedArticlesState([
      {
        id: "saved-1",
        headline: "Saved Story",
        summary: "",
        body: "",
        source: "",
        timestamp: "",
        publishedAt: Date.now(),
        category: "Top",
        readTimeMinutes: 1,
      },
    ]);

    const { getByText, queryByTestId, queryByText } = renderWithProviders(<SavedScreen />);

    expect(queryByTestId("saved-empty-state")).toBeNull();
    expect(queryByText("Saved Story")).toBeTruthy();
    expect(getByText("Saved Story")).toBeTruthy();
  });

  it("pull-to-refresh shows updated timestamp", () => {
    jest.useFakeTimers();
    mockSavedArticlesState = createSavedArticlesState([
      {
        id: "saved-1",
        headline: "Saved Story",
        summary: "",
        body: "",
        source: "",
        timestamp: "",
        publishedAt: Date.now(),
        category: "Top",
        readTimeMinutes: 1,
      },
    ]);

    const { getByTestId } = renderWithProviders(<SavedScreen />);

    const list = getByTestId("saved-list");
    expect(getByTestId("saved-updated")).toBeTruthy();

    act(() => {
      list.props.onRefresh();
      jest.runAllTimers();
    });

    expect(getByTestId("saved-updated")).toBeTruthy();
    jest.useRealTimers();
  });

  it("CTA navigates to Home tab for standard layout", () => {
    const { getByText } = renderWithProviders(<SavedScreen />);

    fireEvent.press(getByText("Explore Top Stories"));

    expect(mockParentNavigate).toHaveBeenCalledWith("Home");
  });

  it("CTA navigates to Top tab for power layout", () => {
    resetSettings({ tabLayout: "power" });
    const { getByText } = renderWithProviders(<SavedScreen />);

    fireEvent.press(getByText("Explore Top Stories"));

    expect(mockParentNavigate).toHaveBeenCalledWith("Top");
  });

  it("shows no-results state when search has no matches and clears filters", () => {
    jest.useFakeTimers();
    mockSavedArticlesState = createSavedArticlesState([
      {
        id: "saved-1",
        headline: "Saved Story",
        summary: "",
        body: "",
        source: "Local",
        timestamp: "",
        publishedAt: Date.now(),
        category: "Top",
        readTimeMinutes: 1,
      },
    ]);

    const {
      getByLabelText,
      getByPlaceholderText,
      getByTestId,
      getByText,
      queryByText,
      queryByTestId,
    } = renderWithProviders(<SavedScreen />);

    expect(queryByTestId("saved-empty-state")).toBeNull();

    fireEvent.press(getByLabelText("Open search"));
    fireEvent.changeText(getByPlaceholderText("Search saved articles"), "nomatch");
    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(getByTestId("saved-no-results")).toBeTruthy();
    fireEvent.press(getByText("Clear search & filters"));
    act(() => jest.advanceTimersByTime(20));

    expect(queryByText("Saved Story")).toBeTruthy();
    jest.useRealTimers();
  });
});
