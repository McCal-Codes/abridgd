import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchFullArticleBody, FullStoryContent } from "./FullStoryService";

const KEY_PREFIX = "abridged:fullStoryCache:v1:";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours — full article bodies rarely change post-publish
// Full article HTML is large (one source's whole RSS feed measured ~160 KB), and AsyncStorage
// on Android is a single database with a default ~6 MB cap shared with settings, profile and
// saved articles. Bound how many bodies are kept; the oldest are evicted first.
export const MAX_FULL_STORY_ENTRIES = 30;

type FullStoryCacheEntry = {
  url: string;
  html: string;
  author?: string;
  fetchedAt: number;
  schemaVersion: 1;
};

const hashUrl = (url: string): string => {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash * 31 + url.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
};

const keyFor = (url: string) => `${KEY_PREFIX}${hashUrl(url)}`;

const inFlight = new Map<string, Promise<FullStoryContent | null>>();

export const getCachedFullStory = async (url: string): Promise<FullStoryContent | null> => {
  try {
    const raw = await AsyncStorage.getItem(keyFor(url));
    if (!raw) return null;
    const entry = JSON.parse(raw) as FullStoryCacheEntry;
    // The key is a 32-bit hash of the URL, so two URLs can collide. Never serve one article's
    // body for another.
    if (entry.url !== url) return null;
    if (Date.now() - entry.fetchedAt > TTL_MS) {
      // Lazy expiry: drop the stale entry on read, no separate sweep required for correctness.
      await AsyncStorage.removeItem(keyFor(url));
      return null;
    }
    return { body: entry.html, author: entry.author };
  } catch (error) {
    console.warn("Failed to read full-story cache", error);
    return null;
  }
};

const writeCachedFullStory = async (url: string, content: FullStoryContent): Promise<void> => {
  const entry: FullStoryCacheEntry = {
    url,
    html: content.body,
    author: content.author,
    fetchedAt: Date.now(),
    schemaVersion: 1,
  };
  try {
    await AsyncStorage.setItem(keyFor(url), JSON.stringify(entry));
  } catch (error) {
    console.warn("Failed to write full-story cache", error);
    return;
  }
  await pruneFullStoryCache();
};

/** Cache-first, dedupe-wrapped full-story fetch. Wraps the existing (unmodified)
 * FullStoryService.fetchFullArticleBody — this module only adds caching and in-flight
 * dedupe on top of it, not a new extraction pipeline. */
export const fetchAndCacheFullStory = async (url: string): Promise<FullStoryContent | null> => {
  const cached = await getCachedFullStory(url);
  if (cached) return cached;

  const existing = inFlight.get(url);
  if (existing) return existing;

  const promise = (async () => {
    const content = await fetchFullArticleBody(url);
    if (content) {
      await writeCachedFullStory(url, content);
    }
    return content;
  })().finally(() => {
    inFlight.delete(url);
  });

  inFlight.set(url, promise);
  return promise;
};

/** Optional periodic housekeeping — lazy expiry on read already guarantees correctness, so
 * this is safe to call opportunistically (e.g. once per app session) rather than on a timer. */
export const clearExpiredFullStories = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const fullStoryKeys = keys.filter((key) => key.startsWith(KEY_PREFIX));
    if (fullStoryKeys.length === 0) return;

    const entries = await AsyncStorage.multiGet(fullStoryKeys);
    const expiredKeys = entries
      .filter(([, value]) => {
        if (!value) return false;
        try {
          const entry = JSON.parse(value) as FullStoryCacheEntry;
          return Date.now() - entry.fetchedAt > TTL_MS;
        } catch {
          return true; // corrupt entry, safe to drop
        }
      })
      .map(([key]) => key);

    if (expiredKeys.length) await AsyncStorage.multiRemove(expiredKeys);
  } catch (error) {
    console.warn("Failed to clear expired full-story cache", error);
  }
};

/** Evicts the oldest cached bodies once more than `maxEntries` are stored. Called after every
 * write (cheap: one key listing) and at startup. */
export const pruneFullStoryCache = async (
  maxEntries: number = MAX_FULL_STORY_ENTRIES,
): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const fullStoryKeys = keys.filter((key) => key.startsWith(KEY_PREFIX));
    if (fullStoryKeys.length <= maxEntries) return;

    const entries = await AsyncStorage.multiGet(fullStoryKeys);
    const byAge = entries
      .map(([key, value]) => {
        let fetchedAt = 0; // unreadable entries sort first and are evicted first
        try {
          if (value) fetchedAt = (JSON.parse(value) as FullStoryCacheEntry).fetchedAt ?? 0;
        } catch {
          // corrupt entry
        }
        return { key, fetchedAt };
      })
      .sort((a, b) => a.fetchedAt - b.fetchedAt);

    const evict = byAge.slice(0, byAge.length - maxEntries).map(({ key }) => key);
    if (evict.length) await AsyncStorage.multiRemove(evict);
  } catch (error) {
    console.warn("Failed to prune full-story cache", error);
  }
};
