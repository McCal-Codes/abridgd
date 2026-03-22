import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Pressable, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileProvider, useProfiles } from "../ProfileContext";
import { Profile } from "../../types/Profile";

jest.mock("@react-native-async-storage/async-storage");

const ACTIVE_PROFILE_STORAGE_KEY = "activeProfileId_v1";
const PROFILES_STORAGE_KEY = "profiles_v1";
const LEGACY_ACTIVE_CODENAME_KEY = "activeCodename";

const storedProfiles: Profile[] = [
  {
    id: "profile-1",
    name: "Reader One",
    codename: "Calm Otter",
    savedArticles: [],
    stats: { articlesRead: 0, savedActions: 0, lastReadAt: null },
  },
  {
    id: "profile-2",
    name: "Reader Two",
    codename: "Bright Fox",
    savedArticles: [],
    stats: { articlesRead: 1, savedActions: 2, lastReadAt: 123 },
  },
];

const mockStorage = (entries: Record<string, string | null>) => {
  (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
    if (Object.prototype.hasOwnProperty.call(entries, key)) {
      return Promise.resolve(entries[key]);
    }

    return Promise.resolve(null);
  });
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
};

const TestConsumer = () => {
  const { activeProfile, profiles, switchProfile } = useProfiles();

  return (
    <>
      <View testID="active-profile">
        <Text>{activeProfile?.id ?? "none"}</Text>
      </View>
      <View testID="profile-count">
        <Text>{profiles.length}</Text>
      </View>
      <Pressable testID="switch-profile-2" onPress={() => switchProfile("profile-2")}>
        <Text>Switch</Text>
      </Pressable>
    </>
  );
};

describe("ProfileContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage({});
  });

  it("restores the saved active profile id on launch", async () => {
    mockStorage({
      [PROFILES_STORAGE_KEY]: JSON.stringify(storedProfiles),
      [ACTIVE_PROFILE_STORAGE_KEY]: "profile-2",
    });

    render(
      <ProfileProvider>
        <TestConsumer />
      </ProfileProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("profile-count")).toHaveTextContent("2");
      expect(screen.getByTestId("active-profile")).toHaveTextContent("profile-2");
    });
  });

  it("falls back to the legacy codename and migrates the active profile id", async () => {
    mockStorage({
      [PROFILES_STORAGE_KEY]: JSON.stringify(storedProfiles),
      [ACTIVE_PROFILE_STORAGE_KEY]: null,
      [LEGACY_ACTIVE_CODENAME_KEY]: "Bright Fox",
    });

    render(
      <ProfileProvider>
        <TestConsumer />
      </ProfileProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("active-profile")).toHaveTextContent("profile-2");
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(ACTIVE_PROFILE_STORAGE_KEY, "profile-2");
  });

  it("persists the active profile id when switching profiles", async () => {
    mockStorage({
      [PROFILES_STORAGE_KEY]: JSON.stringify(storedProfiles),
      [ACTIVE_PROFILE_STORAGE_KEY]: "profile-1",
    });

    render(
      <ProfileProvider>
        <TestConsumer />
      </ProfileProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("active-profile")).toHaveTextContent("profile-1");
    });

    fireEvent.press(screen.getByTestId("switch-profile-2"));

    await waitFor(() => {
      expect(screen.getByTestId("active-profile")).toHaveTextContent("profile-2");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(ACTIVE_PROFILE_STORAGE_KEY, "profile-2");
    });
  });
});
