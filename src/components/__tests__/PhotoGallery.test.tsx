import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { PhotoGallery } from "../PhotoGallery";

// ZoomModal is Reanimated-driven, which this Jest environment doesn't provide.
jest.mock("../ZoomModal", () => ({
  ZoomModal: ({ visible, children }: { visible: boolean; children: React.ReactNode }) => {
    const { View } = require("react-native");
    return visible ? <View testID="zoom-modal">{children}</View> : null;
  },
}));

jest.mock("../ZoomableImage", () => ({
  ZoomableImage: () => null,
}));

const photos = [
  { uri: "https://example.com/1.jpg", caption: "Riders wait at the stop.", credit: "A. Reporter" },
  { uri: "https://example.com/2.jpg", caption: "Council votes." },
  { uri: "https://example.com/3.jpg" },
];

describe("PhotoGallery", () => {
  it("renders nothing for a single photo", () => {
    const { queryByTestId } = render(<PhotoGallery photos={[photos[0]]} />);
    expect(queryByTestId("photo-gallery-strip")).toBeNull();
  });

  it("shows every photo with its caption and credit, and a position count", () => {
    const { getByText, getByLabelText } = render(<PhotoGallery photos={photos} />);

    expect(getByText("Riders wait at the stop.")).toBeTruthy();
    expect(getByText("A. Reporter")).toBeTruthy();
    expect(getByText("Council votes.")).toBeTruthy();
    expect(getByText("1 of 3 photos · tap to enlarge")).toBeTruthy();
    expect(getByLabelText("Photo 1 of 3: Riders wait at the stop.")).toBeTruthy();
    expect(getByLabelText("Photo 3 of 3")).toBeTruthy();
  });

  it("updates the count when the strip settles on another photo", () => {
    const { getByTestId, getByText } = render(<PhotoGallery photos={photos} />);

    fireEvent(getByTestId("photo-gallery-strip"), "momentumScrollEnd", {
      nativeEvent: { contentOffset: { x: 10000, y: 0 } },
    });

    expect(getByText("3 of 3 photos · tap to enlarge")).toBeTruthy();
  });

  it("opens the zoom viewer when a photo is tapped", () => {
    const { getByLabelText, queryByTestId, getByTestId } = render(<PhotoGallery photos={photos} />);
    expect(queryByTestId("zoom-modal")).toBeNull();

    fireEvent.press(getByLabelText("Photo 2 of 3: Council votes."));

    expect(getByTestId("zoom-modal")).toBeTruthy();
  });
});
