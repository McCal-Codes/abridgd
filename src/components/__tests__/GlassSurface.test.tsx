import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";
import { GlassSurface } from "../GlassSurface";

let mockReduceTransparency = false;

jest.mock("../../context/SettingsContext", () => ({
  useSettings: () => ({ reduceTransparency: mockReduceTransparency }),
}));

jest.mock("expo-blur", () => {
  const { View } = require("react-native");
  return {
    BlurView: ({ children, ...props }: any) => (
      <View {...props} testID={props.testID ?? "blur-view"}>
        {children}
      </View>
    ),
  };
});

describe("GlassSurface", () => {
  beforeEach(() => {
    mockReduceTransparency = false;
  });

  it("renders its children", () => {
    const { getByText } = render(
      <GlassSurface>
        <Text>toolbar</Text>
      </GlassSurface>,
    );

    expect(getByText("toolbar")).toBeTruthy();
  });

  it("uses the opaque tone when Reduce Transparency is on", () => {
    mockReduceTransparency = true;

    const { getByTestId } = render(
      <GlassSurface
        testID="surface"
        tone={{ light: "rgba(255,255,255,0.85)", dark: "rgba(28,28,30,0.85)" }}
        opaqueTone={{ light: "#ffffff", dark: "#000000" }}
      />,
    );

    // Every glass surface has to respect this, not just the tab bar — that was the bug this
    // component exists to fix.
    expect(getByTestId("surface")).toHaveStyle({ backgroundColor: "#ffffff" });
  });

  it("falls back to the translucent tone when no opaque tone is given", () => {
    mockReduceTransparency = true;

    const { getByTestId } = render(
      <GlassSurface testID="surface" tone={{ light: "#eeeeee", dark: "#111111" }} />,
    );

    expect(getByTestId("surface")).toHaveStyle({ backgroundColor: "#eeeeee" });
  });
});
