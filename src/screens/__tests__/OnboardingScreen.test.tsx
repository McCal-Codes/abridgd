import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { OnboardingScreen } from "../OnboardingScreen";

let mockRoute: { params?: { startSlideId?: string; mode?: "firstRun" | "whatsNew" } } = {};
const mockNavigation = {
  reset: jest.fn(),
};

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => mockNavigation,
    useRoute: () => mockRoute,
  };
});

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("../../components/AbridgedReader", () => ({
  AbridgedReader: ({ content }: { content: string }) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, {}, content);
  },
}));

const buildSettings = () => ({
  completeOnboarding: jest.fn().mockResolvedValue(undefined),
  markVersionSeen: jest.fn().mockResolvedValue(undefined),
  groundingAnimationStyle: "waves",
  setGroundingAnimationStyle: jest.fn().mockResolvedValue(undefined),
  tabLayout: "minimal",
  setTabLayout: jest.fn().mockResolvedValue(undefined),
  reduceMotion: false,
});

let mockSettings: any = buildSettings();

jest.mock("../../context/SettingsContext", () => ({
  useSettings: () => mockSettings,
}));

describe("OnboardingScreen first-run flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoute = {};
    mockSettings = buildSettings();
  });

  it("advances onboarding progress when Next is pressed", () => {
    const { getByTestId } = render(<OnboardingScreen />);

    expect(getByTestId("onboarding-progress-text")).toHaveTextContent(
      "Onboarding progress: slide 1 of 4",
    );

    fireEvent.press(getByTestId("onboarding-next"));

    expect(getByTestId("onboarding-progress-text")).toHaveTextContent(
      "Onboarding progress: slide 2 of 4",
    );
  });

  it("persists the selected grounding style before finishing onboarding", async () => {
    mockRoute = { params: { startSlideId: "grounding" } };

    const { getByTestId } = render(<OnboardingScreen />);

    fireEvent.press(getByTestId("onboarding-grounding-simple"));
    fireEvent.press(getByTestId("onboarding-finish"));

    await waitFor(() => {
      expect(mockSettings.setGroundingAnimationStyle).toHaveBeenCalledWith("simple");
      expect(mockSettings.setTabLayout).not.toHaveBeenCalled();
      expect(mockSettings.completeOnboarding).toHaveBeenCalled();
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "Main" }],
      });
    });
  });

  it("ignores an unknown startSlideId and stays on the first slide", () => {
    mockRoute = { params: { startSlideId: "not-a-slide" } };

    const { getByTestId } = render(<OnboardingScreen />);

    expect(getByTestId("onboarding-progress-text")).toHaveTextContent(
      "Onboarding progress: slide 1 of 4",
    );
  });
});

describe("OnboardingScreen What's New flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSettings = buildSettings();
    mockRoute = { params: { mode: "whatsNew" } };
  });

  it("shows release notes instead of the welcome slides", () => {
    const { getByTestId, queryByTestId } = render(<OnboardingScreen />);

    expect(getByTestId("whats-new")).toBeTruthy();
    // A returning reader must never be walked through the first-run flow again.
    expect(queryByTestId("onboarding-list")).toBeNull();
    expect(queryByTestId("onboarding-next")).toBeNull();
  });

  it("marks the version seen and returns to the app on dismiss", async () => {
    const { getByTestId } = render(<OnboardingScreen />);

    fireEvent.press(getByTestId("whats-new-dismiss"));

    await waitFor(() => {
      expect(mockSettings.markVersionSeen).toHaveBeenCalled();
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "Main" }],
      });
    });
    // Re-running onboarding completion would be wrong: they finished it releases ago.
    expect(mockSettings.completeOnboarding).not.toHaveBeenCalled();
  });
});
