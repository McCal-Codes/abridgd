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
  const { activeProfile, profiles, switchProfile, recordLastFetchedArticles, deleteActiveProfile } =
    useProfiles();

  return (
    <>
      <View testID="active-profile">
        <Text>{activeProfile?.id ?? "none"}</Text>
      </View>
      <View testID="profile-count">
        <Text>{profiles.length}</Text>
      </View>
      <View testID="last-fetched-count">
        <Text>{activeProfile?.stats?.lastFetchedArticleIds?.length ?? 0}</Text>
      </View>
      <Pressable testID="switch-profile-2" onPress={() => switchProfile("profile-2")}>
        <Text>Switch</Text>
      </Pressable>
      <Pressable
        testID="record-fetched"
        onPress={() => recordLastFetchedArticles(["story-1", "story-2", "story-1"])}
      >
        <Text>Record</Text>
      </Pressable>
      <Pressable testID="delete-active-profile" onPress={() => deleteActiveProfile()}>
        <Text>Delete</Text>
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

  it("records recently fetched article ids on the active profile", async () => {
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

    fireEvent.press(screen.getByTestId("record-fetched"));

    await waitFor(() => {
      expect(screen.getByTestId("last-fetched-count")).toHaveTextContent("2");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        PROFILES_STORAGE_KEY,
        expect.stringContaining('"lastFetchedArticleIds":["story-1","story-2"]'),
      );
    });
  });

  describe("deleteActiveProfile", () => {
    it("switches to another local profile and removes its scoped storage keys", async () => {
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

      fireEvent.press(screen.getByTestId("delete-active-profile"));

      await waitFor(() => {
        expect(screen.getByTestId("active-profile")).toHaveTextContent("profile-2");
        expect(screen.getByTestId("profile-count")).toHaveTextContent("1");
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@abridged_saved_articles_profile-1");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@abridged_reading_progress_profile-1");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        PROFILES_STORAGE_KEY,
        expect.not.stringContaining('"id":"profile-1"'),
      );
    });

    it("creates a fresh anonymous profile when deleting the only profile", async () => {
      const soloProfile: Profile[] = [
        {
          id: "solo",
          name: "Solo Reader",
          codename: "Quiet Wren",
          savedArticles: [],
          stats: { articlesRead: 0, savedActions: 0, lastReadAt: null },
        },
      ];
      mockStorage({
        [PROFILES_STORAGE_KEY]: JSON.stringify(soloProfile),
        [ACTIVE_PROFILE_STORAGE_KEY]: "solo",
      });

      render(
        <ProfileProvider>
          <TestConsumer />
        </ProfileProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("active-profile")).toHaveTextContent("solo");
      });

      fireEvent.press(screen.getByTestId("delete-active-profile"));

      await waitFor(() => {
        expect(screen.getByTestId("profile-count")).toHaveTextContent("1");
        expect(screen.getByTestId("active-profile")).not.toHaveTextContent("solo");
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@abridged_saved_articles_solo");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("@abridged_reading_progress_solo");
    });

    it("gives the fallback profile a fresh id, not the deleted profile's own id", async () => {
      // Regression test: the fallback used to hardcode id "anonymous". Deleting a profile
      // that was itself "anonymous" left activeProfile.id unchanged across the delete, so
      // SavedArticlesContext/ReadingProgressContext (which only reload on id change) kept
      // serving stale in-memory data that could get re-persisted under the same key.
      const soloAnonymousProfile: Profile[] = [
        {
          id: "anonymous",
          name: "Reader",
          codename: "Quiet Wren",
          savedArticles: [],
          stats: { articlesRead: 0, savedActions: 0, lastReadAt: null },
        },
      ];
      mockStorage({
        [PROFILES_STORAGE_KEY]: JSON.stringify(soloAnonymousProfile),
        [ACTIVE_PROFILE_STORAGE_KEY]: "anonymous",
      });

      render(
        <ProfileProvider>
          <TestConsumer />
        </ProfileProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("active-profile")).toHaveTextContent("anonymous");
      });

      fireEvent.press(screen.getByTestId("delete-active-profile"));

      await waitFor(() => {
        expect(screen.getByTestId("active-profile")).not.toHaveTextContent("anonymous");
      });
    });

    it("does not report success if clearing on-device storage fails", async () => {
      mockStorage({
        [PROFILES_STORAGE_KEY]: JSON.stringify(storedProfiles),
        [ACTIVE_PROFILE_STORAGE_KEY]: "profile-1",
      });
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error("disk full"));

      let caughtError: unknown = null;
      const ThrowingConsumer = () => {
        const { activeProfile, deleteActiveProfile } = useProfiles();
        return (
          <>
            <View testID="active-profile">
              <Text>{activeProfile?.id ?? "none"}</Text>
            </View>
            <Pressable
              testID="delete-active-profile"
              onPress={async () => {
                try {
                  await deleteActiveProfile();
                } catch (e) {
                  caughtError = e;
                }
              }}
            >
              <Text>Delete</Text>
            </Pressable>
          </>
        );
      };

      render(
        <ProfileProvider>
          <ThrowingConsumer />
        </ProfileProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("active-profile")).toHaveTextContent("profile-1");
      });

      fireEvent.press(screen.getByTestId("delete-active-profile"));

      await waitFor(() => {
        expect(caughtError).not.toBeNull();
      });

      // Deletion aborted - still on the original profile, not silently switched away.
      expect(screen.getByTestId("active-profile")).toHaveTextContent("profile-1");
    });
  });
});
