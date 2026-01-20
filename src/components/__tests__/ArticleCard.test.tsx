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
    FadeInDown: { duration: () => ({ springify: () => ({}) }) },
    Easing: { linear: () => {} },
  };
});

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
});
