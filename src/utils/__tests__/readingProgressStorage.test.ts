import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getInProgressArticlesFromState,
  getReadingProgressStorageKey,
  getReadingStatsFromState,
  loadReadingProgress,
  mergeReadingProgress,
  saveReadingProgress,
} from "../readingProgressStorage";
import { ReadingProgressState } from "../../types/ReadingProgress";

jest.mock("@react-native-async-storage/async-storage");

describe("readingProgressStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("namespaces storage keys per profile", () => {
    expect(getReadingProgressStorageKey("reader-1")).toBe("@abridged_reading_progress_reader-1");
    expect(getReadingProgressStorageKey()).toBe("@abridged_reading_progress");
  });

  it("saves and loads using the provided storage key", async () => {
    const progressData: ReadingProgressState = {
      "article-1": {
        articleId: "article-1",
        scrollPosition: 0.5,
        completionPercentage: 50,
        startedAt: 1,
        lastReadAt: 2,
        totalReadTimeSeconds: 30,
        status: "in-progress",
      },
    };
    const storageKey = "@abridged_reading_progress_reader-1";
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
      version: 1,
      progressData,
      timestamp: Date.now(),
    }));

    await saveReadingProgress(progressData, 3, 0, storageKey);
    const loaded = await loadReadingProgress(3, 0, storageKey);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(storageKey, expect.any(String));
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(storageKey);
    expect(loaded).toEqual(progressData);
  });

  it("merges updates without losing existing metadata", () => {
    const existing: ReadingProgressState = {
      "article-1": {
        articleId: "article-1",
        scrollPosition: 0.2,
        scrollPixels: 120,
        completionPercentage: 20,
        startedAt: 111,
        lastReadAt: 222,
        totalReadTimeSeconds: 30,
        status: "in-progress",
      },
    };

    const next = mergeReadingProgress(existing, "article-1", {
      completionPercentage: 40,
      lastReadAt: 333,
    });

    expect(next["article-1"]).toMatchObject({
      articleId: "article-1",
      scrollPosition: 0.2,
      scrollPixels: 120,
      completionPercentage: 40,
      startedAt: 111,
      lastReadAt: 333,
      totalReadTimeSeconds: 30,
      status: "in-progress",
    });
  });

  it("derives in-progress articles in last-read order", () => {
    const state: ReadingProgressState = {
      first: {
        articleId: "first",
        scrollPosition: 0.3,
        completionPercentage: 30,
        startedAt: 1,
        lastReadAt: 10,
        totalReadTimeSeconds: 20,
        status: "in-progress",
      },
      second: {
        articleId: "second",
        scrollPosition: 0.8,
        completionPercentage: 80,
        startedAt: 1,
        lastReadAt: 50,
        totalReadTimeSeconds: 100,
        status: "in-progress",
      },
      done: {
        articleId: "done",
        scrollPosition: 1,
        completionPercentage: 100,
        startedAt: 1,
        lastReadAt: 100,
        totalReadTimeSeconds: 200,
        status: "completed",
      },
    };

    expect(getInProgressArticlesFromState(state).map((progress) => progress.articleId)).toEqual([
      "second",
      "first",
    ]);
  });

  it("derives aggregate reading stats from the current state", () => {
    const state: ReadingProgressState = {
      first: {
        articleId: "first",
        scrollPosition: 0.5,
        completionPercentage: 50,
        startedAt: 1,
        lastReadAt: 10,
        totalReadTimeSeconds: 20,
        status: "in-progress",
      },
      second: {
        articleId: "second",
        scrollPosition: 1,
        completionPercentage: 100,
        startedAt: 1,
        lastReadAt: 20,
        totalReadTimeSeconds: 40,
        status: "completed",
      },
    };

    expect(getReadingStatsFromState(state)).toEqual({
      totalArticlesRead: 1,
      totalReadTimeSeconds: 60,
      averageCompletionPercentage: 75,
      articlesInProgress: 1,
    });
  });
});
