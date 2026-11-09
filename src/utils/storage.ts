import AsyncStorage from "@react-native-async-storage/async-storage";
import { Article } from "../types/Article";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";
import { StorageReadError, backupRawValue, removeWithBackup } from "./storageRecovery";

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

export const getSavedArticlesStorageKey = (profileId?: string | null): string =>
  `${SAVED_ARTICLES_KEY}_${profileId ?? "default"}`;

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

/** Raised by the strict parser when the stored text is damaged (not merely a newer schema). */
class CorruptArticlesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CorruptArticlesError";
  }
}

/**
 * Strict parser. Throws `CorruptArticlesError` for damaged data and `StorageReadError` for a
 * schema version this build does not know, so callers can tell "nothing saved" apart from
 * "something saved that I could not read".
 */
const parseArticlesStrict = (data: string): Article[] => {
  let schema: { version?: number };
  try {
    schema = JSON.parse(data) as { version?: number };
  } catch (error) {
    throw new CorruptArticlesError(`Saved articles are not valid JSON: ${String(error)}`);
  }

  const version = schema?.version;

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
      throw new CorruptArticlesError("Failed to decompress payload or payload empty");
    }

    try {
      const payload = JSON.parse(payloadString) as StoragePayloadV2;
      return payload.articles || [];
    } catch (error) {
      throw new CorruptArticlesError(`Saved articles payload is damaged: ${String(error)}`);
    }
  }

  throw new StorageReadError(
    "unsupported-version",
    `Schema version mismatch: expected 1 or ${STORAGE_SCHEMA_VERSION}, got ${String(version)}`,
  );
};

/**
 * Deserialize articles from JSON with validation.
 *
 * Lenient on purpose: any failure yields `[]`. Use `loadArticlesFromStorage` when the result
 * will be written back, because it keeps "unreadable" distinct from "empty".
 */
export const deserializeArticles = (data: string): Article[] => {
  try {
    return parseArticlesStrict(data);
  } catch (error) {
    console.warn("Failed to deserialize articles:", error);
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
 * Load articles from AsyncStorage with retry.
 *
 * - Nothing stored: resolves `[]`.
 * - Stored but damaged: the raw value is copied to `<key>.bak`, then `[]` is returned so the
 *   app can start fresh without losing the original bytes.
 * - Written by a newer schema: the raw value is backed up and a `StorageReadError` is thrown.
 * - Read kept failing: a `StorageReadError` is thrown. The stored data is probably fine, so
 *   callers must not autosave an empty list over it.
 */
export const loadArticlesFromStorage = async (
  retries = 3,
  delay = 100,
  storageKey: string = SAVED_ARTICLES_KEY,
): Promise<Article[]> => {
  let raw: string | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      raw = await AsyncStorage.getItem(storageKey);
      break;
    } catch (error) {
      console.warn(`Load attempt ${attempt + 1}/${retries} failed:`, error);

      if (attempt < retries - 1) {
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
      } else {
        console.error(`Failed to load articles after ${retries} attempts: ${error}`);
        throw new StorageReadError(
          "transient",
          `Failed to load saved articles after ${retries} attempts`,
        );
      }
    }
  }

  if (!raw) {
    return [];
  }

  try {
    return parseArticlesStrict(raw);
  } catch (error) {
    await backupRawValue(storageKey, raw);
    if (error instanceof StorageReadError) {
      throw error;
    }
    console.error("Saved articles were unreadable; backed up and starting empty:", error);
    return [];
  }
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
    await removeWithBackup(storageKey);
  } catch (error) {
    console.error("Failed to clear saved articles:", error);
    throw error;
  }
};
