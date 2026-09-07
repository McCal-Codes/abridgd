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

describe("GlassSurface across platforms", () => {
  it("renders the blur surface rather than a flat one when transparency is allowed", () => {
    // expo-blur supports Android too — experimentalBlurMethod defaults to 'none', so it is a
    // tinted translucent surface there rather than a real blur. LiquidTabBar has shipped that
    // on Android since the Android pipeline landed; gating this component to iOS left every
    // other glass surface flat on the platform the app had just started targeting.
    mockReduceTransparency = false;

    const { getByTestId } = render(
      <GlassSurface
        testID="surface"
        tone={{ light: "rgba(255,255,255,0.85)", dark: "rgba(28,28,30,0.85)" }}
        opaqueTone={{ light: "#ffffff", dark: "#000000" }}
      />,
    );

    // The blur mock renders with the translucent tone; the opaque path would use #ffffff.
    expect(getByTestId("surface")).toHaveStyle({ backgroundColor: "rgba(255,255,255,0.85)" });
  });
});
