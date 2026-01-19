import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
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

let mockSettings: any;
const baseSettings: {
  tabBarHeight: number;
  allowContentUnderTabBar: boolean;
  tabBarStyle: "standard";
  tabBarDockedHeight: number;
  tabBarFloatingHeight: number;
  tabLayout: "minimal" | "comprehensive";
} = {
  tabBarHeight: 92,
  allowContentUnderTabBar: false,
  tabBarStyle: "standard" as const,
  tabBarDockedHeight: 92,
  tabBarFloatingHeight: 64,
  tabLayout: "minimal" as const,
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

  it("renders empty state when no saved articles", () => {
    const { getByText, getByTestId } = render(<SavedScreen />);

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

    const { getByText, queryByTestId } = render(<SavedScreen />);

    expect(queryByTestId("saved-empty-state")).toBeNull();
    expect(getByText("Saved Story")).toBeTruthy();
  });

  it("CTA navigates to Home tab for minimal layout", () => {
    const { getByText } = render(<SavedScreen />);

    fireEvent.press(getByText("Explore Top Stories"));

    expect(mockParentNavigate).toHaveBeenCalledWith("Home");
  });

  it("CTA navigates to Top tab for comprehensive layout", () => {
    resetSettings({ tabLayout: "comprehensive" });
    const { getByText } = render(<SavedScreen />);

    fireEvent.press(getByText("Explore Top Stories"));

    expect(mockParentNavigate).toHaveBeenCalledWith("Top");
  });
});
