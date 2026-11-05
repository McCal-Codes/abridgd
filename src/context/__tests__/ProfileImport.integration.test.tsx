import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProfileProvider, useProfiles } from "../ProfileContext";
import { SavedArticlesProvider, useSavedArticles } from "../SavedArticlesContext";
import { getSavedArticlesStorageKey } from "../../utils/storage";
import { serializeProfileForTransfer } from "../../utils/profileTransfer";
import { Article } from "../../types/Article";

const article = (id: string, headline = `Story ${id}`): Article => ({
  id,
  headline,
  summary: "",
  body: "<p>Body</p>",
  source: "WESA",
  timestamp: "",
  publishedAt: 1,
  category: "Top",
  readTimeMinutes: 1,
});

const home = {
  id: "home",
  name: "Home profile",
  codename: "Calm Otter",
  savedArticles: [] as Article[],
  stats: { articlesRead: 0, savedActions: 0, lastReadAt: null },
};

/** A key as the previous app version produced it: base64 of the whole profile JSON. */
const legacyKey = (profile: object) => Buffer.from(JSON.stringify(profile), "utf8").toString("base64");

let api: ReturnType<typeof useProfiles> & ReturnType<typeof useSavedArticles>;
const Probe = () => {
  const profiles = useProfiles();
  const saved = useSavedArticles();
  api = { ...profiles, ...saved };
  return (
    <>
      <Text testID="active">{profiles.activeProfile?.id ?? "none"}</Text>
      <Text testID="saved-count">{saved.savedArticles.length}</Text>
      <Text testID="loading">{saved.isLoading ? "loading" : "loaded"}</Text>
      <Pressable testID="noop" onPress={() => undefined}>
        <Text>noop</Text>
      </Pressable>
    </>
  );
};

const renderApp = async () => {
  render(
    <ProfileProvider>
      <SavedArticlesProvider>
        <Probe />
      </SavedArticlesProvider>
    </ProfileProvider>,
  );
  await waitFor(() => expect(screen.getByTestId("active")).toHaveTextContent("home"));
  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));
};

describe("importing a profile that carries saved articles", () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    await AsyncStorage.clear();
    await AsyncStorage.setItem("profiles_v1", JSON.stringify([home]));
    await AsyncStorage.setItem("activeProfileId_v1", "home");
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("keeps the imported saved articles after the import settles", async () => {
    await renderApp();
    const other = { id: "other", name: "Phone profile", savedArticles: [article("a"), article("b"), article("c")], transferKey: "t-1" };

    let ok = false;
    act(() => {
      ok = api.importProfileKey(legacyKey(other));
    });
    expect(ok).toBe(true);

    await waitFor(() => expect(screen.getByTestId("active")).toHaveTextContent("other"));
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));
    expect(screen.getByTestId("saved-count")).toHaveTextContent("3");

    // And they are persisted for that profile, so they survive a restart.
    await act(async () => {
      jest.advanceTimersByTime(700);
    });
    const stored = await AsyncStorage.getItem(getSavedArticlesStorageKey("other"));
    expect(stored).toContain("Story a");
    expect(stored).toContain("Story c");
  });

  it("imports a v2 key, and the profile can be exported again", async () => {
    await renderApp();
    const key = serializeProfileForTransfer({
      id: "other",
      name: "Phone profile",
      savedArticles: [article("a"), article("b")],
    } as any);

    let ok = false;
    act(() => {
      ok = api.importProfileKey(key);
    });
    expect(ok).toBe(true);
    await waitFor(() => expect(screen.getByTestId("saved-count")).toHaveTextContent("2"));
    expect(api.exportProfileKey()).toMatch(/^abr2:/);
  });

  it("adds imported articles to a profile that already has some, and keeps its own sign-in details", async () => {
    await AsyncStorage.setItem(
      "profiles_v1",
      JSON.stringify([{ ...home, appleUserId: "000123.abc", email: "me@example.com", savedArticles: [article("mine")] }]),
    );
    await AsyncStorage.setItem(getSavedArticlesStorageKey("home"), JSON.stringify({
      version: 1,
      articles: [article("mine")],
      timestamp: 1,
    }));
    await renderApp();
    expect(screen.getByTestId("saved-count")).toHaveTextContent("1");

    act(() => {
      api.importProfileKey(legacyKey({ id: "home", name: "Home profile", savedArticles: [article("theirs")] }));
    });

    await waitFor(() => expect(screen.getByTestId("saved-count")).toHaveTextContent("2"));
    expect(api.activeProfile?.appleUserId).toBe("000123.abc");
    expect(api.activeProfile?.email).toBe("me@example.com");
    expect(api.savedArticles.map((a) => a.id).sort()).toEqual(["mine", "theirs"]);
  });

  it("does not let an imported key claim an Apple account", async () => {
    await renderApp();
    act(() => {
      api.importProfileKey(legacyKey({ id: "other", name: "Stranger", appleUserId: "999.evil", email: "x@y.z", savedArticles: [] }));
    });
    await waitFor(() => expect(screen.getByTestId("active")).toHaveTextContent("other"));
    expect(api.activeProfile?.appleUserId).toBeUndefined();
    expect(api.activeProfile?.email).toBeUndefined();
  });

  it("rejects a bad key and leaves the active profile alone", async () => {
    await renderApp();
    let ok = true;
    act(() => {
      ok = api.importProfileKey("definitely not a key");
    });
    expect(ok).toBe(false);
    expect(screen.getByTestId("active")).toHaveTextContent("home");
  });
});
