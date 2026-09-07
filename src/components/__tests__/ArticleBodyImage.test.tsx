import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { ArticleBodyImage } from "../ArticleBodyImage";

// ZoomModal is Reanimated-driven (useAnimatedRef), which this Jest environment doesn't provide.
// Stubbing it keeps this file testing ArticleBodyImage's wiring rather than the modal's internals.
jest.mock("../ZoomModal", () => ({
  ZoomModal: ({ visible, children }: { visible: boolean; children: React.ReactNode }) => {
    const { View } = require("react-native");
    return visible ? <View testID="zoom-modal">{children}</View> : null;
  },
}));

const flattenStyle = (style: StyleProp<ViewStyle>): Record<string, unknown> => {
  const list = Array.isArray(style) ? style : [style];
  return list.reduce<Record<string, unknown>>((acc, s) => ({ ...acc, ...(s as object) }), {});
};

describe("ArticleBodyImage", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sizes the image by its true aspect ratio instead of a fixed height", async () => {
    const { getByTestId } = render(<ArticleBodyImage uri="https://example.com/wide.jpg" />);
    const image = getByTestId("article-body-image");

    // Dimensions arrive on the load event of the image already being fetched, rather than a
    // second Image.getSize request for the same file.
    fireEvent(image, "load", { nativeEvent: { source: { width: 1200, height: 600 } } });

    const flattened = flattenStyle(getByTestId("article-body-image").props.style);
    expect(flattened.aspectRatio).toBe(2);
    expect(flattened.height).toBeUndefined();
  });

  it("clamps an extreme aspect ratio so the layout doesn't collapse or dominate", async () => {
    const { getByTestId } = render(<ArticleBodyImage uri="https://example.com/tall.jpg" />);

    fireEvent(getByTestId("article-body-image"), "load", {
      nativeEvent: { source: { width: 100, height: 3000 } }, // extremely tall
    });

    const flattened = flattenStyle(getByTestId("article-body-image").props.style);
    expect(flattened.aspectRatio as number).toBeGreaterThanOrEqual(0.5);
  });

  it("shows a fallback instead of a blank box when the image fails to load", async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <ArticleBodyImage uri="https://example.com/missing.jpg" />,
    );

    fireEvent(getByTestId("article-body-image"), "error");

    await waitFor(() => expect(getByText("Image unavailable")).toBeTruthy());
    expect(queryByTestId("article-body-image")).toBeNull();
  });

  it("keeps a fixed height in compressed mode even after the image reports its size", () => {
    const { getByTestId } = render(<ArticleBodyImage uri="https://example.com/x.jpg" compressed />);

    fireEvent(getByTestId("article-body-image"), "load", {
      nativeEvent: { source: { width: 1200, height: 600 } },
    });

    const flattened = flattenStyle(getByTestId("article-body-image").props.style);
    expect(flattened.height).toBeDefined();
    expect(flattened.aspectRatio).toBeUndefined();
  });

  it("renders the caption when provided", async () => {
    const { getByText } = render(
      <ArticleBodyImage uri="https://example.com/x.jpg" caption="AP Photo/Jane Doe" />,
    );

    await waitFor(() => expect(getByText("AP Photo/Jane Doe")).toBeTruthy());
  });
});

describe("ArticleBodyImage zoom", () => {
  it("exposes the photo as an image button with its caption", () => {
    const { getByRole } = render(
      <ArticleBodyImage uri="https://example.com/x.jpg" caption="A mural downtown" />,
    );

    const button = getByRole("imagebutton");
    expect(button.props.accessibilityLabel).toBe("Photo: A mural downtown");
    expect(button.props.accessibilityHint).toBe("Opens the photo full screen");
  });

  it("keeps the zoom view unmounted until the photo is tapped", () => {
    // An article can hold a dozen images; a dozen always-mounted Modals is pure waste.
    const { queryByTestId, getByRole } = render(
      <ArticleBodyImage uri="https://example.com/x.jpg" />,
    );

    expect(queryByTestId("zoom-modal")).toBeNull();

    fireEvent.press(getByRole("imagebutton"));

    expect(queryByTestId("zoom-modal")).toBeTruthy();
  });
});
