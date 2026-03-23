import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { OnboardingScreen } from "../OnboardingScreen";

let mockRoute: { params?: { startSlideId?: string } } = {};
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

let mockSettings: any = {
  completeOnboarding: jest.fn().mockResolvedValue(undefined),
  groundingAnimationStyle: "waves",
  setGroundingAnimationStyle: jest.fn().mockResolvedValue(undefined),
  tabLayout: "minimal",
  setTabLayout: jest.fn().mockResolvedValue(undefined),
  reduceMotion: false,
};

jest.mock("../../context/SettingsContext", () => ({
  useSettings: () => mockSettings,
}));

describe("OnboardingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoute = {};
    mockSettings = {
      completeOnboarding: jest.fn().mockResolvedValue(undefined),
      groundingAnimationStyle: "waves",
      setGroundingAnimationStyle: jest.fn().mockResolvedValue(undefined),
      tabLayout: "minimal",
      setTabLayout: jest.fn().mockResolvedValue(undefined),
      reduceMotion: false,
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("advances onboarding progress when Next is pressed", () => {
    const { getByTestId } = render(<OnboardingScreen />);

    expect(getByTestId("onboarding-progress-text")).toHaveTextContent(
      "Onboarding progress: slide 1 of 6",
    );

    fireEvent.press(getByTestId("onboarding-next"));

    expect(getByTestId("onboarding-progress-text")).toHaveTextContent(
      "Onboarding progress: slide 2 of 6",
    );
  });

  it("persists the selected layout before finishing onboarding", async () => {
    mockRoute = { params: { startSlideId: "ready" } };

    const { getByTestId } = render(<OnboardingScreen />);

    fireEvent.press(getByTestId("onboarding-layout-comprehensive"));
    fireEvent.press(getByTestId("onboarding-finish"));

    await waitFor(() => {
      expect(mockSettings.setTabLayout).toHaveBeenCalledWith("comprehensive");
      expect(mockSettings.completeOnboarding).toHaveBeenCalled();
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "Main" }],
      });
    });
  });
});
