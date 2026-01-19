import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReadingProgress, ReadingProgressState } from "../types/ReadingProgress";

const READING_PROGRESS_KEY = "@abridged_reading_progress";
const STORAGE_SCHEMA_VERSION = 1;

interface StorageSchema {
  version: number;
  progressData: ReadingProgressState;
  timestamp: number;
}

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
): Promise<ReadingProgressState> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const data = await AsyncStorage.getItem(READING_PROGRESS_KEY);
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
): Promise<void> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const serialized = serializeReadingProgress(progressData);
      await AsyncStorage.setItem(READING_PROGRESS_KEY, serialized);
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

/**
 * Get a single article's reading progress
 */
export const getArticleProgress = async (articleId: string): Promise<ReadingProgress | null> => {
  const progressData = await loadReadingProgress();
  return progressData[articleId] || null;
};

/**
 * Update a single article's reading progress
 */
export const updateArticleProgress = async (
  articleId: string,
  updates: Partial<ReadingProgress>,
): Promise<ReadingProgress> => {
  const progressData = await loadReadingProgress();
  const currentProgress = progressData[articleId];

  const updatedProgress: ReadingProgress = {
    articleId,
    scrollPosition: updates.scrollPosition ?? currentProgress?.scrollPosition ?? 0,
    scrollPixels: updates.scrollPixels ?? currentProgress?.scrollPixels,
    currentWordIndex: updates.currentWordIndex ?? currentProgress?.currentWordIndex,
    completionPercentage:
      updates.completionPercentage ?? currentProgress?.completionPercentage ?? 0,
    startedAt: currentProgress?.startedAt ?? updates.startedAt ?? Date.now(),
    lastReadAt: updates.lastReadAt ?? Date.now(),
    totalReadTimeSeconds:
      updates.totalReadTimeSeconds ?? currentProgress?.totalReadTimeSeconds ?? 0,
    status: updates.status ?? currentProgress?.status ?? "unread",
  };

  progressData[articleId] = updatedProgress;
  await saveReadingProgress(progressData);

  return updatedProgress;
};

/**
 * Clear reading progress for a specific article
 */
export const clearArticleProgress = async (articleId: string): Promise<void> => {
  const progressData = await loadReadingProgress();
  delete progressData[articleId];
  await saveReadingProgress(progressData);
};

/**
 * Clear all reading progress
 */
export const clearAllReadingProgress = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(READING_PROGRESS_KEY);
  } catch (error) {
    console.error("Failed to clear reading progress:", error);
    throw error;
  }
};

/**
 * Get articles with in-progress reading status
 */
export const getInProgressArticles = async (): Promise<ReadingProgress[]> => {
  const progressData = await loadReadingProgress();
  return Object.values(progressData).filter((progress) => progress.status === "in-progress");
};

/**
 * Get reading stats
 */
export const getReadingStats = async (): Promise<{
  totalArticlesRead: number;
  totalReadTimeSeconds: number;
  averageCompletionPercentage: number;
  articlesInProgress: number;
}> => {
  const progressData = await loadReadingProgress();
  const articles = Object.values(progressData);

  if (articles.length === 0) {
    return {
      totalArticlesRead: 0,
      totalReadTimeSeconds: 0,
      averageCompletionPercentage: 0,
      articlesInProgress: 0,
    };
  }

  const totalReadTimeSeconds = articles.reduce((sum, a) => sum + a.totalReadTimeSeconds, 0);
  const averageCompletionPercentage =
    articles.reduce((sum, a) => sum + a.completionPercentage, 0) / articles.length;
  const articlesInProgress = articles.filter((a) => a.status === "in-progress").length;
  const completedArticles = articles.filter((a) => a.status === "completed").length;

  return {
    totalArticlesRead: completedArticles,
    totalReadTimeSeconds,
    averageCompletionPercentage,
    articlesInProgress,
  };
};
