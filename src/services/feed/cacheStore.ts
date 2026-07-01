import AsyncStorage from "@react-native-async-storage/async-storage";
import { Article, ArticleCategory } from "../../types/Article";

export type FeedCacheSnapshot = {
  sourceName: string;
  category: ArticleCategory;
  articles: Article[];
  fetchedAt: number;
  attemptedAt: number;
  schemaVersion: 1;
};

const KEY_PREFIX = "abridged:feedCache:v1:";
const sourceKey = (category: ArticleCategory, sourceName: string) =>
  `${KEY_PREFIX}${category}:${sourceName}`;

/** In-memory mirror of AsyncStorage, kept in sync on every write. Exists purely so
 * getCachedArticles/getLastFetchedAt-style reads can stay synchronous (both screens read
 * them before first render) even though AsyncStorage itself is inherently async.
 * AsyncStorage remains the source of truth; this is a cache-of-the-cache. */
const mirror = new Map<string, FeedCacheSnapshot>();
let hydrated = false;
let hydrationPromise: Promise<void> | null = null;

const hydrate = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const feedKeys = keys.filter((key) => key.startsWith(KEY_PREFIX));
    if (feedKeys.length === 0) {
      return;
    }
    const entries = await AsyncStorage.multiGet(feedKeys);
    entries.forEach(([key, value]) => {
      if (!value) return;
      try {
        mirror.set(key, JSON.parse(value) as FeedCacheSnapshot);
      } catch {
        // ignore corrupt entry
      }
    });
  } catch (error) {
    console.warn("Failed to hydrate feed cache", error);
  } finally {
    hydrated = true;
  }
};

export const ensureHydrated = (): Promise<void> => {
  if (hydrated) return Promise.resolve();
  if (!hydrationPromise) hydrationPromise = hydrate();
  return hydrationPromise;
};

// Fire-and-forget eager hydration at module load, so cold-start reads have a chance to be
// populated by the time the first screen mounts.
void ensureHydrated();

export const isHydrated = (): boolean => hydrated;

export const getSourceSnapshot = (
  category: ArticleCategory,
  sourceName: string,
): FeedCacheSnapshot | null => mirror.get(sourceKey(category, sourceName)) ?? null;

export const getCategorySnapshots = (
  category: ArticleCategory,
  sourceNames: string[],
): FeedCacheSnapshot[] =>
  sourceNames
    .map((name) => mirror.get(sourceKey(category, name)))
    .filter((snapshot): snapshot is FeedCacheSnapshot => Boolean(snapshot));

export const writeSourceSnapshot = async (snapshot: FeedCacheSnapshot): Promise<void> => {
  const key = sourceKey(snapshot.category, snapshot.sourceName);
  mirror.set(key, snapshot);
  try {
    await AsyncStorage.setItem(key, JSON.stringify(snapshot));
  } catch (error) {
    console.warn(`Failed to persist feed cache for ${snapshot.sourceName}`, error);
  }
};

/** Records a failed/empty attempt against an existing snapshot without disturbing its
 * articles/fetchedAt — so a broken source keeps serving its last-known-good content. */
export const touchSourceAttempt = async (
  category: ArticleCategory,
  sourceName: string,
  attemptedAt: number,
): Promise<void> => {
  const existing = getSourceSnapshot(category, sourceName);
  if (!existing) return;
  await writeSourceSnapshot({ ...existing, attemptedAt });
};

export const clearAllFeedCache = async (): Promise<void> => {
  mirror.clear();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const feedKeys = keys.filter((key) => key.startsWith(KEY_PREFIX));
    if (feedKeys.length) await AsyncStorage.multiRemove(feedKeys);
  } catch (error) {
    console.warn("Failed to clear feed cache", error);
  }
};

/** Test-only: forces the hydration state back to "not yet hydrated" and clears the mirror,
 * so each test can start from a clean, deterministic cache state without module reloads. */
export const __resetForTests = (): void => {
  mirror.clear();
  hydrated = false;
  hydrationPromise = null;
};
