import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_VERSION } from "../../config/appInfo";
import { SettingsProvider, useSettings } from "../SettingsContext";

jest.mock("@react-native-async-storage/async-storage");
jest.mock("../../services/UserBehaviorLogger", () => ({
  adaptSettingsBasedOnBehavior: jest.fn(),
}));

const mockStorage = (entries: Record<string, string | null>) => {
  (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
    if (Object.prototype.hasOwnProperty.call(entries, key)) {
      return Promise.resolve(entries[key]);
    }

    return Promise.resolve(null);
  });
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);
  (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
};

const TestConsumer = () => {
  const {
    completeOnboarding,
    hasCompletedOnboarding,
    isLoadingSettings,
    shouldShowWhatsNew,
    lastSeenVersion,
    perplexityApiKey,
    setPerplexityApiKey,
  } = useSettings();

  return (
    <>
      <View testID="settings-loading">
        <Text>{isLoadingSettings ? "loading" : "loaded"}</Text>
      </View>
      <View testID="settings-onboarding">
        <Text>{hasCompletedOnboarding ? "complete" : "incomplete"}</Text>
      </View>
      <View testID="settings-whats-new">
        <Text>{shouldShowWhatsNew ? "show" : "hide"}</Text>
      </View>
      <View testID="settings-last-seen">
        <Text>{lastSeenVersion ?? "none"}</Text>
      </View>
      <View testID="settings-api-key">
        <Text>{perplexityApiKey || "none"}</Text>
      </View>
      <Pressable testID="settings-complete" onPress={() => void completeOnboarding()}>
        <Text>Complete</Text>
      </Pressable>
      <Pressable testID="settings-save-api-key" onPress={() => void setPerplexityApiKey(" pplx-test-key ")}>
        <Text>Save API Key</Text>
      </Pressable>
    </>
  );
};

describe("SettingsProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage({});
  });

  it("marks the current version as seen when onboarding completes", async () => {
    mockStorage({
      hasCompletedOnboarding: "true",
      lastSeenVersion: "1.3.9",
    });

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("settings-loading")).toHaveTextContent("loaded");
      expect(screen.getByTestId("settings-onboarding")).toHaveTextContent("complete");
      expect(screen.getByTestId("settings-whats-new")).toHaveTextContent("show");
      expect(screen.getByTestId("settings-last-seen")).toHaveTextContent("1.3.9");
    });

    fireEvent.press(screen.getByTestId("settings-complete"));

    await waitFor(() => {
      expect(screen.getByTestId("settings-whats-new")).toHaveTextContent("hide");
      expect(screen.getByTestId("settings-last-seen")).toHaveTextContent(APP_VERSION);
      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        ["hasCompletedOnboarding", "true"],
        ["lastSeenVersion", APP_VERSION],
      ]);
    });
  });

  it("loads and trims the saved Perplexity API key", async () => {
    mockStorage({
      perplexityApiKey: "pplx-existing",
    });

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("settings-api-key")).toHaveTextContent("pplx-existing");
    });

    fireEvent.press(screen.getByTestId("settings-save-api-key"));

    await waitFor(() => {
      expect(screen.getByTestId("settings-api-key")).toHaveTextContent("pplx-test-key");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("perplexityApiKey", "pplx-test-key");
    });
  });
});
