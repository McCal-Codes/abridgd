import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { OnboardingScreenV2 } from "../OnboardingScreen.v2";
import { STEP_IDS } from "../../features/onboarding/steps";
import { updateSourceEnabled } from "../../utils/sourcePreferences";

let mockRoute: { params?: { startSlideId?: string; mode?: "firstRun" | "whatsNew" } } = {};
const mockNavigation = { reset: jest.fn() };

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

jest.mock("../../components/AbridgedReader", () => ({
  AbridgedReader: ({ content }: { content: string }) => {
    const { Text } = require("react-native");
    return require("react").createElement(Text, { testID: "mock-reader" }, content);
  },
}));

jest.mock("../../utils/sourcePreferences", () => ({
  ...jest.requireActual("../../utils/sourcePreferences"),
  loadSourcePreferences: jest.fn().mockResolvedValue({ overrides: {}, customFeeds: [] }),
  updateSourceEnabled: jest.fn().mockResolvedValue({ overrides: {}, customFeeds: [] }),
}));

const buildSettings = () => ({
  completeOnboarding: jest.fn().mockResolvedValue(undefined),
  markVersionSeen: jest.fn().mockResolvedValue(undefined),
  isGroundingEnabled: true,
  setIsGroundingEnabled: jest.fn().mockResolvedValue(undefined),
  sensitivePromptLevel: "full",
  setSensitivePromptLevel: jest.fn().mockResolvedValue(undefined),
  sensitiveActionPreference: "decide",
  setSensitiveActionPreference: jest.fn().mockResolvedValue(undefined),
  groundingAnimationStyle: "waves",
  setGroundingAnimationStyle: jest.fn().mockResolvedValue(undefined),
  rsvpHighlightColor: "#00778A",
  reduceMotion: false,
});

let mockSettings: any = buildSettings();
jest.mock("../../context/SettingsContext", () => ({
  useSettings: () => mockSettings,
}));

const goTo = (getByTestId: (id: string) => any, steps: number) => {
  for (let i = 0; i < steps; i++) fireEvent.press(getByTestId("onboarding-next"));
};

describe("OnboardingScreenV2 first-run flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoute = {};
    mockSettings = buildSettings();
  });

  it("starts on the welcome step and walks all six steps in order", () => {
    const { getByTestId, queryByTestId } = render(<OnboardingScreenV2 />);
    expect(getByTestId("onboarding-step-welcome")).toBeTruthy();
    expect(getByTestId("onboarding-progress-text")).toHaveTextContent(`Step 1 of ${STEP_IDS.length}`);
    expect(queryByTestId("onboarding-back")).toBeNull();

    const order = ["newsrooms", "reader", "heavy-stories", "around", "ready"];
    for (const id of order) {
      fireEvent.press(getByTestId("onboarding-next"));
      expect(getByTestId(`onboarding-step-${id}`)).toBeTruthy();
    }
    expect(getByTestId("onboarding-finish")).toBeTruthy();
    expect(queryByTestId("onboarding-next")).toBeNull();
  });

  it("goes back without losing the way forward", () => {
    const { getByTestId } = render(<OnboardingScreenV2 />);
    goTo(getByTestId, 2);
    fireEvent.press(getByTestId("onboarding-back"));
    expect(getByTestId("onboarding-step-newsrooms")).toBeTruthy();
    fireEvent.press(getByTestId("onboarding-next"));
    expect(getByTestId("onboarding-step-reader")).toBeTruthy();
  });

  it("skips from any step straight into the app", async () => {
    const { getByTestId } = render(<OnboardingScreenV2 />);
    goTo(getByTestId, 2);
    fireEvent.press(getByTestId("onboarding-skip"));

    await waitFor(() => {
      expect(mockSettings.completeOnboarding).toHaveBeenCalled();
      expect(mockNavigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Main" }] });
    });
  });

  it("finishes into the app, or into Settings, from the last step", async () => {
    mockRoute = { params: { startSlideId: "ready" } };
    const { getByTestId, queryByTestId } = render(<OnboardingScreenV2 />);
    expect(queryByTestId("onboarding-skip")).toBeNull();

    fireEvent.press(getByTestId("onboarding-finish-settings"));
    await waitFor(() =>
      expect(mockNavigation.reset).toHaveBeenCalledWith({
        index: 1,
        routes: [{ name: "Main" }, { name: "Settings" }],
      }),
    );
  });

  it("opens on a legacy slide id's replacement and ignores unknown ids", () => {
    mockRoute = { params: { startSlideId: "practice" } };
    expect(render(<OnboardingScreenV2 />).getByTestId("onboarding-step-reader")).toBeTruthy();

    mockRoute = { params: { startSlideId: "nope" } };
    expect(render(<OnboardingScreenV2 />).getAllByTestId("onboarding-step-welcome").length).toBeGreaterThan(0);
  });

  it("shows the speed reader without starting it", () => {
    mockRoute = { params: { startSlideId: "reader" } };
    const { getByTestId } = render(<OnboardingScreenV2 />);
    expect(getByTestId("mock-reader")).toBeTruthy();
  });
});

describe("OnboardingScreenV2 choices write through immediately", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRoute = {};
    mockSettings = buildSettings();
  });

  it("toggling a newsroom saves that source preference", async () => {
    mockRoute = { params: { startSlideId: "newsrooms" } };
    const { getByLabelText } = render(<OnboardingScreenV2 />);

    await waitFor(() => expect(getByLabelText("WTAE")).toBeTruthy());
    fireEvent(getByLabelText("WTAE"), "valueChange", false);

    expect(updateSourceEnabled).toHaveBeenCalledWith("Top", "WTAE", false, true);
  });

  it("'Add a breathing pause' makes grounding the first action; 'off' turns the gate off", async () => {
    mockRoute = { params: { startSlideId: "heavy-stories" } };
    const { getByTestId } = render(<OnboardingScreenV2 />);

    fireEvent.press(getByTestId("onboarding-heavy-pause"));
    await waitFor(() => expect(mockSettings.setSensitiveActionPreference).toHaveBeenCalledWith("ground-first"));

    fireEvent.press(getByTestId("onboarding-heavy-off"));
    await waitFor(() => expect(mockSettings.setSensitivePromptLevel).toHaveBeenCalledWith("off"));
  });

  it("turning notes back on after 'off' re-enables everything the gate needs", async () => {
    mockSettings = { ...buildSettings(), isGroundingEnabled: false, sensitivePromptLevel: "off" };
    mockRoute = { params: { startSlideId: "heavy-stories" } };
    const { getByTestId } = render(<OnboardingScreenV2 />);

    fireEvent.press(getByTestId("onboarding-heavy-notes"));
    await waitFor(() => {
      expect(mockSettings.setIsGroundingEnabled).toHaveBeenCalledWith(true);
      expect(mockSettings.setSensitivePromptLevel).toHaveBeenCalledWith("full");
      expect(mockSettings.setSensitiveActionPreference).toHaveBeenCalledWith("decide");
    });
  });

  it("shows the breathing styles only for the pause option, and saves the choice", async () => {
    mockRoute = { params: { startSlideId: "heavy-stories" } };
    const first = render(<OnboardingScreenV2 />);
    expect(first.queryByTestId("onboarding-grounding-styles")).toBeNull();
    first.unmount();

    mockSettings = { ...buildSettings(), sensitiveActionPreference: "ground-first" };
    const { getByTestId } = render(<OnboardingScreenV2 />);
    fireEvent.press(getByTestId("onboarding-grounding-pulse"));
    await waitFor(() => expect(mockSettings.setGroundingAnimationStyle).toHaveBeenCalledWith("pulse"));
  });
});

describe("OnboardingScreenV2 What's New flow", () => {
  it("still shows release notes, never the welcome steps, to a returning reader", () => {
    mockSettings = buildSettings();
    mockRoute = { params: { mode: "whatsNew" } };
    const { getByTestId, queryByTestId } = render(<OnboardingScreenV2 />);
    expect(getByTestId("whats-new")).toBeTruthy();
    expect(queryByTestId("onboarding-next")).toBeNull();
  });
});
