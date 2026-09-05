import React from "react";
import { Image, StyleProp, ViewStyle } from "react-native";
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

describe("ArticleBodyImage zoom", () => {
  beforeEach(() => {
    jest.spyOn(Image, "getSize").mockImplementation((_uri, success) => {
      success(1200, 600);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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
