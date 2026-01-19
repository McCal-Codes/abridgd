import AsyncStorage from "@react-native-async-storage/async-storage";
import { Article } from "../types/Article";
import * as zlib from "zlib";

// Schema versioning for future migrations
const STORAGE_SCHEMA_VERSION = 1;
const SAVED_ARTICLES_KEY = "@abridged_saved_articles";
const MIGRATION_FLAG_KEY = "@abridged_migration_complete";

interface StorageSchema {
  version: number;
  articles: Article[];
  timestamp: number;
}

/**
 * Serialize articles to JSON and optionally compress
 */
export const serializeArticles = (articles: Article[]): string => {
  return JSON.stringify({
    version: STORAGE_SCHEMA_VERSION,
    articles,
    timestamp: Date.now(),
  } as StorageSchema);
};

/**
 * Deserialize articles from JSON with validation
 */
export const deserializeArticles = (data: string): Article[] => {
  try {
    const schema = JSON.parse(data) as StorageSchema;

    // Validate schema version
    if (schema.version !== STORAGE_SCHEMA_VERSION) {
      console.warn(
        `Schema version mismatch: expected ${STORAGE_SCHEMA_VERSION}, got ${schema.version}`,
      );
      return [];
    }

    return schema.articles || [];
  } catch (error) {
    console.error("Failed to deserialize articles:", error);
    return [];
  }
};

/**
 * Save articles to AsyncStorage with retry logic
 */
export const saveArticlesToStorage = async (
  articles: Article[],
  retries = 3,
  delay = 100,
): Promise<void> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const serialized = serializeArticles(articles);
      await AsyncStorage.setItem(SAVED_ARTICLES_KEY, serialized);
      return;
    } catch (error) {
      console.warn(`Save attempt ${attempt + 1}/${retries} failed:`, error);

      if (attempt < retries - 1) {
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
      } else {
        throw new Error(`Failed to save articles after ${retries} attempts: ${error}`);
      }
    }
  }
};

/**
 * Load articles from AsyncStorage with error handling
 */
export const loadArticlesFromStorage = async (retries = 3, delay = 100): Promise<Article[]> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const data = await AsyncStorage.getItem(SAVED_ARTICLES_KEY);
      if (!data) {
        return [];
      }
      return deserializeArticles(data);
    } catch (error) {
      console.warn(`Load attempt ${attempt + 1}/${retries} failed:`, error);

      if (attempt < retries - 1) {
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
      } else {
        console.error(`Failed to load articles after ${retries} attempts: ${error}`);
        return [];
      }
    }
  }
  return [];
};

/**
 * Check if migration from in-memory to AsyncStorage has been completed
 */
export const isMigrationComplete = async (): Promise<boolean> => {
  try {
    const flag = await AsyncStorage.getItem(MIGRATION_FLAG_KEY);
    return flag === "true";
  } catch (error) {
    console.error("Failed to check migration flag:", error);
    return false;
  }
};

/**
 * Mark migration as complete
 */
export const markMigrationComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(MIGRATION_FLAG_KEY, "true");
  } catch (error) {
    console.error("Failed to mark migration complete:", error);
  }
};

/**
 * Clear all saved articles from storage
 */
export const clearSavedArticles = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SAVED_ARTICLES_KEY);
  } catch (error) {
    console.error("Failed to clear saved articles:", error);
    throw error;
  }
};
