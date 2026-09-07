import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ArticleCard } from "../ArticleCard";

const mockOnPress = jest.fn();
const mockProgress = jest.fn();

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  const Animated = { View };
  return {
    __esModule: true,
    default: Animated,
    View,
    useSharedValue: (init = 0) => ({ value: init }),
    useAnimatedStyle: (fn: any) => fn(),
    withSpring: (v: any) => v,
    withTiming: (v: any) => v,
    runOnJS: (fn: any) => fn,
    // useAnimatedStyle here actually invokes the worklet, so every helper the card's animated
    // styles call has to exist.
    interpolate: (value: number) => value,
    FadeInDown: { duration: () => ({ springify: () => ({}) }) },
    Easing: { linear: () => {} },
  };
});

let mockSaved = false;
const mockSaveArticle = jest.fn();
const mockUnsaveArticle = jest.fn();

jest.mock("../../context/SavedArticlesContext", () => ({
  useSavedArticlesOptional: () => ({
    savedArticles: [],
    saveArticle: mockSaveArticle,
    unsaveArticle: mockUnsaveArticle,
    isArticleSaved: () => mockSaved,
    isLoading: false,
    error: null,
  }),
}));

jest.mock("../ArticleProgressIndicator", () => ({
  ArticleProgressIndicator: ({ articleId, size }: any) => {
    mockProgress(articleId, size);
    const { Text } = require("react-native");
    return <Text testID="progress-indicator">{`${articleId}-${size}`}</Text>;
  },
}));

describe("ArticleCard", () => {
  beforeEach(() => {
    mockOnPress.mockClear();
    mockProgress.mockClear();
  });

  const baseArticle = {
    id: "article-1",
    headline: "Sample Headline",
    summary: "Summary text",
    source: "Test Source",
    timestamp: "2026-01-20",
    publishedAt: Date.now(),
    category: "Top" as const,
    readTimeMinutes: 2,
    imageUrl: undefined,
    body: "",
  };

  it("renders progress indicator and forwards press", () => {
    const { getByText } = render(<ArticleCard article={baseArticle} onPress={mockOnPress} />);

    expect(getByText("article-1-small")).toBeTruthy();
    fireEvent.press(getByText("Sample Headline"));
    expect(mockOnPress).toHaveBeenCalledWith(baseArticle);
    expect(mockProgress).toHaveBeenCalledWith("article-1", "small");
  });

  it("does not render a byline when the article has no author", () => {
    const { queryByText } = render(<ArticleCard article={baseArticle} onPress={mockOnPress} />);
    expect(queryByText(/^By /)).toBeNull();
  });

  it("renders the author as a byline when present", () => {
    const article = { ...baseArticle, author: "Jane Doe" };
    const { getByText } = render(<ArticleCard article={article} onPress={mockOnPress} />);
    expect(getByText("By Jane Doe")).toBeTruthy();
  });

  it("hides the thumbnail after the image fails to load", () => {
    const article = { ...baseArticle, imageUrl: "https://example.com/broken.jpg" };
    const { getByTestId, queryByTestId } = render(
      <ArticleCard article={article} onPress={mockOnPress} />,
    );

    const image = getByTestId("article-thumbnail");
    fireEvent(image, "onError");

    expect(queryByTestId("article-thumbnail")).toBeNull();
  });
});

describe("ArticleCard accessibility", () => {
  const fixture = {
    id: "article-a11y",
    headline: "Council approves riverfront plan",
    summary: "Summary text",
    source: "Post-Gazette",
    timestamp: "2h ago",
    publishedAt: Date.now(),
    category: "Local" as const,
    readTimeMinutes: 3,
    body: "",
  };

  it("announces as one button carrying headline, source, time and byline", () => {
    const article = { ...fixture, author: "Jane Doe" };

    const { getByRole } = render(<ArticleCard article={article} onPress={jest.fn()} />);

    const card = getByRole("button");
    expect(card.props.accessibilityLabel).toBe(
      "Council approves riverfront plan, Post-Gazette, 2h ago, By Jane Doe",
    );
    expect(card.props.accessibilityHint).toBe("Opens the full story");
  });

  it("omits the byline from the label when the story has no author", () => {
    const article = { ...fixture, author: undefined };

    const { getByRole } = render(<ArticleCard article={article} onPress={jest.fn()} />);

    expect(getByRole("button").props.accessibilityLabel).not.toContain("By ");
  });
});

describe("ArticleCard swipe-to-save", () => {
  const fixture = {
    id: "article-swipe",
    headline: "Council approves riverfront plan",
    summary: "Summary text",
    source: "Post-Gazette",
    timestamp: "2h ago",
    publishedAt: Date.now(),
    category: "Local" as const,
    readTimeMinutes: 3,
    body: "",
  };

  afterEach(() => {
    mockSaved = false;
  });

  it("offers Save on a card that isn't saved yet", () => {
    const { getByText } = render(<ArticleCard article={fixture} onPress={jest.fn()} />);

    // Saved's empty state has told readers to swipe cards since long before a gesture existed.
    expect(getByText("Save")).toBeTruthy();
  });

  it("offers Unsave once the article is saved", () => {
    mockSaved = true;

    const { getByText } = render(<ArticleCard article={fixture} onPress={jest.fn()} />);

    expect(getByText("Unsave")).toBeTruthy();
  });
});
