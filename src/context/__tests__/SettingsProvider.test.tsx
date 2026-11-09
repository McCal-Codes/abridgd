import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { APP_VERSION } from "../../config/appInfo";
import { SettingsProvider, useSettings } from "../SettingsContext";

jest.mock("@react-native-async-storage/async-storage");
jest.mock("expo-secure-store");
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
  (AsyncStorage.multiGet as jest.Mock).mockImplementation((keys: string[]) =>
    Promise.resolve(
      keys.map((key) => [
        key,
        Object.prototype.hasOwnProperty.call(entries, key) ? entries[key] : null,
      ]),
    ),
  );
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);
  (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
};

const mockSecureStore = (entries: Record<string, string | null> = {}) => {
  const store: Record<string, string | null> = { ...entries };
  (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) =>
    Promise.resolve(store[key] ?? null),
  );
  (SecureStore.setItemAsync as jest.Mock).mockImplementation((key: string, value: string) => {
    store[key] = value;
    return Promise.resolve();
  });
  (SecureStore.deleteItemAsync as jest.Mock).mockImplementation((key: string) => {
    delete store[key];
    return Promise.resolve();
  });
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

const TabsConsumer = () => {
  const { isLoadingSettings, tabLayout, activeTabs, defaultTab } = useSettings();

  return (
    <>
      <View testID="tabs-loading">
        <Text>{isLoadingSettings ? "loading" : "loaded"}</Text>
      </View>
      <View testID="tabs-layout">
        <Text>{tabLayout}</Text>
      </View>
      <View testID="tabs-active">
        <Text>{activeTabs.join(",")}</Text>
      </View>
      <View testID="tabs-default">
        <Text>{defaultTab}</Text>
      </View>
    </>
  );
};

describe("SettingsProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage({});
    mockSecureStore();
  });

  it("keeps a persisted comprehensive tab layout instead of validating it against the minimal one", async () => {
    mockStorage({
      tabLayout: "comprehensive",
      activeTabs: JSON.stringify(["top", "local", "digest", "saved", "profile"]),
      defaultTab: "top",
    });

    render(
      <SettingsProvider>
        <TabsConsumer />
      </SettingsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("tabs-loading")).toHaveTextContent("loaded");
    });

    expect(screen.getByTestId("tabs-layout")).toHaveTextContent("comprehensive");
    expect(screen.getByTestId("tabs-active")).toHaveTextContent("top,local,digest,saved,profile");
    expect(screen.getByTestId("tabs-default")).toHaveTextContent("top");
    // The stored tab list must not be rewritten to a stripped-down minimal version.
    expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(
      "activeTabs",
      expect.not.stringContaining("top"),
    );
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

  it("migrates a legacy plaintext Perplexity API key from AsyncStorage into SecureStore", async () => {
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
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("perplexityApiKey", "pplx-existing");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("perplexityApiKey");
    });

    fireEvent.press(screen.getByTestId("settings-save-api-key"));

    await waitFor(() => {
      expect(screen.getByTestId("settings-api-key")).toHaveTextContent("pplx-test-key");
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith("perplexityApiKey", "pplx-test-key");
    });
  });

  it("reads an already-migrated Perplexity API key straight from SecureStore", async () => {
    mockSecureStore({ perplexityApiKey: "pplx-secure" });

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("settings-api-key")).toHaveTextContent("pplx-secure");
    });

    expect(AsyncStorage.getItem).not.toHaveBeenCalledWith("perplexityApiKey");
  });

  it("reads every stored setting in one batched call instead of one round trip per key", async () => {
    mockStorage({ hasCompletedOnboarding: "true", lastSeenVersion: "1.3.9" });
    (AsyncStorage.getItem as jest.Mock).mockClear();
    (AsyncStorage.multiGet as jest.Mock).mockClear();

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("settings-loading")).toHaveTextContent("loaded");
    });

    expect(AsyncStorage.multiGet).toHaveBeenCalledTimes(1);
    const keys = (AsyncStorage.multiGet as jest.Mock).mock.calls[0][0] as string[];
    // Settings the app persists must all be in that one read; a missed key would silently reset.
    expect(keys).toEqual(
      expect.arrayContaining(["hasCompletedOnboarding", "tabLayout", "activeTabs", "hapticIntensity"]),
    );
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).not.toContain("perplexityApiKey");
    expect(AsyncStorage.getItem).not.toHaveBeenCalledWith("fontSize");
  });

  it("still finishes loading, on defaults, when the stored settings cannot be read", async () => {
    mockStorage({});
    (AsyncStorage.multiGet as jest.Mock).mockRejectedValue(new Error("disk unavailable"));
    jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <SettingsProvider>
        <TestConsumer />
      </SettingsProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("settings-loading")).toHaveTextContent("loaded");
    });
    expect(screen.getByTestId("settings-onboarding")).toHaveTextContent("incomplete");
  });
});
