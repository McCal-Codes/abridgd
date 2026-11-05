import { RSS_FEEDS } from "../data/feedConfig";
import { ArticleCategory } from "../types/Article";
import { clearExpiredFullStories, pruneFullStoryCache } from "./fullStoryCache";
import { pruneOrphanedFeedCache } from "./feed/cacheStore";

/**
 * Bounded-cache housekeeping, run once per launch after the first screen is up. Lazy expiry on
 * read keeps the caches correct but never frees anything that is not read again, so without
 * this the shared AsyncStorage database only grows.
 */
export const runStorageHousekeeping = async (): Promise<void> => {
  const configured = (Object.keys(RSS_FEEDS) as ArticleCategory[]).flatMap((category) =>
    RSS_FEEDS[category].map((source) => ({ category, sourceName: source.name })),
  );

  await clearExpiredFullStories();
  await pruneFullStoryCache();
  await pruneOrphanedFeedCache(configured);
};
