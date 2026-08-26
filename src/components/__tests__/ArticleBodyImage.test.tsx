import React from "react";
import { Image, StyleProp, ViewStyle } from "react-native";
import { render, waitFor } from "@testing-library/react-native";
import { ArticleBodyImage } from "../ArticleBodyImage";

const flattenStyle = (style: StyleProp<ViewStyle>): Record<string, unknown> => {
  const list = Array.isArray(style) ? style : [style];
  return list.reduce<Record<string, unknown>>((acc, s) => ({ ...acc, ...(s as object) }), {});
};

describe("ArticleBodyImage", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sizes the image by its true aspect ratio instead of a fixed height", async () => {
    jest.spyOn(Image, "getSize").mockImplementation((_uri, success) => {
      success(1200, 600); // 2:1 landscape
    });

    const { getByTestId } = render(<ArticleBodyImage uri="https://example.com/wide.jpg" />);
    const image = await waitFor(() => getByTestId("article-body-image"));

    const flattened = flattenStyle(image.props.style);
    expect(flattened.aspectRatio).toBe(2);
    expect(flattened.height).toBeUndefined();
  });

  it("clamps an extreme aspect ratio so the layout doesn't collapse or dominate", async () => {
    jest.spyOn(Image, "getSize").mockImplementation((_uri, success) => {
      success(100, 3000); // extremely tall
    });

    const { getByTestId } = render(<ArticleBodyImage uri="https://example.com/tall.jpg" />);
    const image = await waitFor(() => getByTestId("article-body-image"));

    const flattened = flattenStyle(image.props.style);
    expect(flattened.aspectRatio as number).toBeGreaterThanOrEqual(0.5);
  });

  it("shows a fallback instead of a blank box when the image fails to load", async () => {
    jest.spyOn(Image, "getSize").mockImplementation((_uri, _success, failure) => {
      failure?.(new Error("404"));
    });

    const { getByText, queryByTestId } = render(
      <ArticleBodyImage uri="https://example.com/missing.jpg" />,
    );

    await waitFor(() => expect(getByText("Image unavailable")).toBeTruthy());
    expect(queryByTestId("article-body-image")).toBeNull();
  });

  it("keeps a fixed height in compressed mode without calling Image.getSize", () => {
    const getSizeSpy = jest.spyOn(Image, "getSize");
    const { getByTestId } = render(<ArticleBodyImage uri="https://example.com/x.jpg" compressed />);

    expect(getSizeSpy).not.toHaveBeenCalled();
    const image = getByTestId("article-body-image");
    const flattened = flattenStyle(image.props.style);
    expect(flattened.height).toBeDefined();
  });

  it("renders the caption when provided", async () => {
    jest.spyOn(Image, "getSize").mockImplementation((_uri, success) => {
      success(800, 600);
    });

    const { getByText } = render(
      <ArticleBodyImage uri="https://example.com/x.jpg" caption="AP Photo/Jane Doe" />,
    );

    await waitFor(() => expect(getByText("AP Photo/Jane Doe")).toBeTruthy());
  });
});
