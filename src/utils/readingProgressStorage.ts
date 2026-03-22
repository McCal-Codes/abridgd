import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReadingProgress, ReadingProgressState } from "../types/ReadingProgress";

const READING_PROGRESS_KEY = "@abridged_reading_progress";
const STORAGE_SCHEMA_VERSION = 1;

interface StorageSchema {
  version: number;
  progressData: ReadingProgressState;
  timestamp: number;
}

export const getReadingProgressStorageKey = (profileId?: string | null): string =>
  profileId ? `${READING_PROGRESS_KEY}_${profileId}` : READING_PROGRESS_KEY;

/**
 * Serialize reading progress to JSON
 */
export const serializeReadingProgress = (progressData: ReadingProgressState): string => {
  return JSON.stringify({
    version: STORAGE_SCHEMA_VERSION,
    progressData,
    timestamp: Date.now(),
  } as StorageSchema);
};

/**
 * Deserialize reading progress from JSON with validation
 */
export const deserializeReadingProgress = (data: string): ReadingProgressState => {
  try {
    const schema = JSON.parse(data) as StorageSchema;

    if (schema.version !== STORAGE_SCHEMA_VERSION) {
      console.warn(
        `Schema version mismatch: expected ${STORAGE_SCHEMA_VERSION}, got ${schema.version}`,
      );
      return {};
    }

    return schema.progressData || {};
  } catch (error) {
    console.error("Failed to deserialize reading progress:", error);
    return {};
  }
};

/**
 * Load reading progress from AsyncStorage
 */
export const loadReadingProgress = async (
  retries = 3,
  delay = 100,
  storageKey = READING_PROGRESS_KEY,
): Promise<ReadingProgressState> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const data = await AsyncStorage.getItem(storageKey);
      if (!data) {
        return {};
      }
      return deserializeReadingProgress(data);
    } catch (error) {
      console.warn(`Load attempt ${attempt + 1}/${retries} failed:`, error);

      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
      } else {
        console.error(`Failed to load reading progress after ${retries} attempts: ${error}`);
        return {};
      }
    }
  }
  return {};
};

/**
 * Save reading progress to AsyncStorage
 */
export const saveReadingProgress = async (
  progressData: ReadingProgressState,
  retries = 3,
  delay = 100,
  storageKey = READING_PROGRESS_KEY,
): Promise<void> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const serialized = serializeReadingProgress(progressData);
      await AsyncStorage.setItem(storageKey, serialized);
      return;
    } catch (error) {
      console.warn(`Save attempt ${attempt + 1}/${retries} failed:`, error);

      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
      } else {
        throw new Error(`Failed to save reading progress after ${retries} attempts: ${error}`);
      }
    }
  }
};

const buildUpdatedProgress = (
  articleId: string,
  updates: Partial<ReadingProgress>,
  currentProgress?: ReadingProgress,
): ReadingProgress => ({
  articleId,
  scrollPosition: updates.scrollPosition ?? currentProgress?.scrollPosition ?? 0,
  scrollPixels: updates.scrollPixels ?? currentProgress?.scrollPixels,
  currentWordIndex: updates.currentWordIndex ?? currentProgress?.currentWordIndex,
  completionPercentage:
    updates.completionPercentage ?? currentProgress?.completionPercentage ?? 0,
  startedAt: currentProgress?.startedAt ?? updates.startedAt ?? Date.now(),
  lastReadAt: updates.lastReadAt ?? Date.now(),
  totalReadTimeSeconds: updates.totalReadTimeSeconds ?? currentProgress?.totalReadTimeSeconds ?? 0,
  status: updates.status ?? currentProgress?.status ?? "unread",
});

/**
 * Merge a single article's progress into the in-memory progress map.
 */
export const mergeReadingProgress = (
  progressData: ReadingProgressState,
  articleId: string,
  updates: Partial<ReadingProgress>,
): ReadingProgressState => {
  const currentProgress = progressData[articleId];

  return {
    ...progressData,
    [articleId]: buildUpdatedProgress(articleId, updates, currentProgress),
  };
};

/**
 * Remove a single article's progress from the in-memory progress map.
 */
export const removeReadingProgress = (
  progressData: ReadingProgressState,
  articleId: string,
): ReadingProgressState => {
  const updated = { ...progressData };
  delete updated[articleId];
  return updated;
};

/**
 * Get a single article's reading progress
 */
export const getArticleProgress = async (
  articleId: string,
  retries = 3,
  delay = 100,
  storageKey = READING_PROGRESS_KEY,
): Promise<ReadingProgress | null> => {
  const progressData = await loadReadingProgress(retries, delay, storageKey);
  return progressData[articleId] || null;
};

/**
 * Update a single article's reading progress directly in storage.
 * Prefer `mergeReadingProgress` when context already owns the in-memory state.
 */
export const updateArticleProgress = async (
  articleId: string,
  updates: Partial<ReadingProgress>,
  retries = 3,
  delay = 100,
  storageKey = READING_PROGRESS_KEY,
): Promise<ReadingProgress> => {
  const progressData = await loadReadingProgress(retries, delay, storageKey);
  const updatedProgressData = mergeReadingProgress(progressData, articleId, updates);
  await saveReadingProgress(updatedProgressData, retries, delay, storageKey);
  return updatedProgressData[articleId];
};

/**
 * Clear reading progress for a specific article
 */
export const clearArticleProgress = async (
  articleId: string,
  retries = 3,
  delay = 100,
  storageKey = READING_PROGRESS_KEY,
): Promise<void> => {
  const progressData = await loadReadingProgress(retries, delay, storageKey);
  const updatedProgressData = removeReadingProgress(progressData, articleId);
  await saveReadingProgress(updatedProgressData, retries, delay, storageKey);
};

/**
 * Clear all reading progress
 */
export const clearAllReadingProgress = async (
  storageKey = READING_PROGRESS_KEY,
): Promise<void> => {
  try {
    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Failed to clear reading progress:", error);
    throw error;
  }
};

/**
 * Get articles with in-progress reading status from an in-memory state map.
 */
export const getInProgressArticlesFromState = (
  progressData: ReadingProgressState,
): ReadingProgress[] => {
  return Object.values(progressData)
    .filter((progress) => progress.status === "in-progress")
    .sort((a, b) => b.lastReadAt - a.lastReadAt);
};

/**
 * Get reading stats from an in-memory state map.
 */
export const getReadingStatsFromState = (
  progressData: ReadingProgressState,
): {
  totalArticlesRead: number;
  totalReadTimeSeconds: number;
  averageCompletionPercentage: number;
  articlesInProgress: number;
} => {
  const articles = Object.values(progressData);

  if (articles.length === 0) {
    return {
      totalArticlesRead: 0,
      totalReadTimeSeconds: 0,
      averageCompletionPercentage: 0,
      articlesInProgress: 0,
    };
  }

  const totalReadTimeSeconds = articles.reduce((sum, article) => {
    return sum + article.totalReadTimeSeconds;
  }, 0);
  const averageCompletionPercentage =
    articles.reduce((sum, article) => sum + article.completionPercentage, 0) / articles.length;
  const articlesInProgress = articles.filter((article) => article.status === "in-progress").length;
  const completedArticles = articles.filter((article) => article.status === "completed").length;

  return {
    totalArticlesRead: completedArticles,
    totalReadTimeSeconds,
    averageCompletionPercentage,
    articlesInProgress,
  };
};

/**
 * Backward-compatible helpers that read from storage when a full state map is not already available.
 */
export const getInProgressArticles = async (
  storageKey = READING_PROGRESS_KEY,
): Promise<ReadingProgress[]> => {
  const progressData = await loadReadingProgress(3, 100, storageKey);
  return getInProgressArticlesFromState(progressData);
};

export const getReadingStats = async (
  storageKey = READING_PROGRESS_KEY,
): Promise<{
  totalArticlesRead: number;
  totalReadTimeSeconds: number;
  averageCompletionPercentage: number;
  articlesInProgress: number;
}> => {
  const progressData = await loadReadingProgress(3, 100, storageKey);
  return getReadingStatsFromState(progressData);
};
