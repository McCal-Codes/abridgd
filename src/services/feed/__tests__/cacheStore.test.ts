import AsyncStorage from "@react-native-async-storage/async-storage";
import { __resetForTests, pruneOrphanedFeedCache, writeSourceSnapshot } from "../cacheStore";

const snapshot = (category: "Top" | "Local", sourceName: string) => ({
  sourceName,
  category,
  articles: [],
  fetchedAt: 1,
  attemptedAt: 1,
  schemaVersion: 1 as const,
});

describe("pruneOrphanedFeedCache", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    __resetForTests();
  });

  it("removes snapshots for sources that are no longer configured and keeps the rest", async () => {
    await writeSourceSnapshot(snapshot("Top", "WTAE"));
    await writeSourceSnapshot(snapshot("Top", "Dropped Source"));
    await AsyncStorage.setItem("unrelated-key", "keep");

    const removed = await pruneOrphanedFeedCache([{ category: "Top", sourceName: "WTAE" }]);

    expect(removed).toBe(1);
    const keys = await AsyncStorage.getAllKeys();
    expect(keys).toContain("abridged:feedCache:v1:Top:WTAE");
    expect(keys).not.toContain("abridged:feedCache:v1:Top:Dropped Source");
    expect(keys).toContain("unrelated-key");
  });

  it("is a no-op when everything is still configured", async () => {
    await writeSourceSnapshot(snapshot("Local", "Kidsburgh"));
    expect(
      await pruneOrphanedFeedCache([{ category: "Local", sourceName: "Kidsburgh" }]),
    ).toBe(0);
  });
});
