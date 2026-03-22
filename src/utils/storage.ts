import AsyncStorage from "@react-native-async-storage/async-storage";
import { Article } from "../types/Article";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";

// Schema versioning for future migrations
const STORAGE_SCHEMA_VERSION = 2;
const SAVED_ARTICLES_KEY = "@abridged_saved_articles";
const MIGRATION_FLAG_KEY = "@abridged_migration_complete";
const COMPRESSION_THRESHOLD = 4000; // characters; compress larger payloads to save space

interface StorageSchemaV1 {
  version: 1;
  articles: Article[];
  timestamp: number;
}

interface StoragePayloadV2 {
  articles: Article[];
}

interface StorageSchemaV2 {
  version: 2;
  compressed: boolean;
  compression?: "lz-string-utf16";
  payload: string; // plain JSON string or compressed string depending on `compressed`
  timestamp: number;
}

/**
 * Serialize articles to JSON and optionally compress
 */
export const serializeArticles = (articles: Article[]): string => {
  const payload: StoragePayloadV2 = { articles };
  const payloadString = JSON.stringify(payload);
  const shouldCompress = payloadString.length >= COMPRESSION_THRESHOLD;
  const compressedPayload = shouldCompress ? compressToUTF16(payloadString) : payloadString;

  const schema: StorageSchemaV2 = {
    version: STORAGE_SCHEMA_VERSION,
    compressed: shouldCompress,
    compression: shouldCompress ? "lz-string-utf16" : undefined,
    payload: compressedPayload,
    timestamp: Date.now(),
  };

  return JSON.stringify(schema);
};

/**
 * Deserialize articles from JSON with validation
 */
export const deserializeArticles = (data: string): Article[] => {
  try {
    const schema = JSON.parse(data) as
      | (StorageSchemaV1 & { version: 1 })
      | (StorageSchemaV2 & { version: 2 })
      | { version?: number };
    const version = schema.version;

    // Backwards compatibility: handle legacy version 1
    if (version === 1) {
      return (schema as StorageSchemaV1).articles || [];
    }

    if (version === 2) {
      const v2Schema = schema as StorageSchemaV2;
      const payloadString = v2Schema.compressed
        ? (decompressFromUTF16(v2Schema.payload) ?? "")
        : v2Schema.payload;

      if (!payloadString) {
        console.warn("Failed to decompress payload or payload empty");
        return [];
      }

      const payload = JSON.parse(payloadString) as StoragePayloadV2;
      return payload.articles || [];
    }

    console.warn(
      `Schema version mismatch: expected 1 or ${STORAGE_SCHEMA_VERSION}, got ${String(version)}`,
    );
    return [];
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
  storageKey: string = SAVED_ARTICLES_KEY,
): Promise<void> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const serialized = serializeArticles(articles);
      await AsyncStorage.setItem(storageKey, serialized);
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
export const loadArticlesFromStorage = async (
  retries = 3,
  delay = 100,
  storageKey: string = SAVED_ARTICLES_KEY,
): Promise<Article[]> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const data = await AsyncStorage.getItem(storageKey);
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
export const clearSavedArticles = async (
  storageKey: string = SAVED_ARTICLES_KEY,
): Promise<void> => {
  try {
    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Failed to clear saved articles:", error);
    throw error;
  }
};
