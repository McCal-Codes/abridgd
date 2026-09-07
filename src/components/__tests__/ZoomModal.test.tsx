import React from "react";
import { Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import { ZoomModal } from "../ZoomModal";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 47, bottom: 34, left: 0, right: 0 }),
}));

describe("ZoomModal", () => {
  it("offers a labelled close control, not just a backdrop tap", () => {
    // Content that fills the screen leaves almost no backdrop to tap, and a drag-to-dismiss
    // gesture is not an action VoiceOver can perform — without this button a screen-reader
    // user cannot leave the viewer.
    const onClose = jest.fn();

    const { getByLabelText } = render(
      <ZoomModal visible onClose={onClose}>
        <Text>photo</Text>
      </ZoomModal>,
    );

    fireEvent.press(getByLabelText("Close"));

    expect(onClose).toHaveBeenCalled();
  });

  it("renders its content while visible", () => {
    const { getByText } = render(
      <ZoomModal visible onClose={jest.fn()}>
        <Text>photo</Text>
      </ZoomModal>,
    );

    expect(getByText("photo")).toBeTruthy();
  });
});
