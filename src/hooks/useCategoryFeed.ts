import { useCallback, useEffect, useRef, useState } from "react";
import { Article, ArticleCategory } from "../types/Article";
import { fetchCategory, getCachedCategory } from "../services/feed/repository";
import { ensureHydrated } from "../services/feed/cacheStore";
import { FeedLoadResult } from "../services/feed/types";

export interface CategoryFeedState {
  articles: Article[];
  /** True only on a genuine cold start: no cache available, first-ever load in flight. */
  loading: boolean;
  /** True during any background or pull-triggered revalidation. */
  refreshing: boolean;
  /** Set only when a fetch fails; cached articles (if any) are preserved alongside it. */
  error: string | null;
  /** True when the currently-shown data is older than the soft cache TTL. */
  stale: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

const toDate = (timestamp: number | null): Date | null => (timestamp ? new Date(timestamp) : null);

/**
 * Cache-first feed loading for a single category. Shows cached stories immediately with no
 * blocking spinner, then revalidates in the background only when the cache is past its soft
 * TTL. Never re-toggles `loading` back to true once cache has been shown — pull-to-refresh
 * (`refresh()`) is the only path that forces a live fetch regardless of freshness.
 */
export const useCategoryFeed = (category: ArticleCategory): CategoryFeedState => {
  // Lazy: getCachedCategory filters sources, reads preferences, then merges and sorts every
  // cached article for the category. It ran on every render of Home and Section while only
  // ever being used by the state initializers below, which run once.
  const [initialCache] = useState(() => getCachedCategory(category));

  const [articles, setArticles] = useState<Article[]>(initialCache?.articles ?? []);
  const [loading, setLoading] = useState<boolean>(!initialCache);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState<boolean>(initialCache?.stale ?? false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(toDate(initialCache?.lastUpdated ?? null));
  const categoryRef = useRef(category);

  const applyResult = useCallback((result: FeedLoadResult) => {
    setArticles(result.articles);
    setStale(result.stale);
    setLastUpdated(toDate(result.lastUpdated));
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const result = await fetchCategory(categoryRef.current, { forceRefresh: true });
      applyResult(result);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to refresh."));
    } finally {
      setRefreshing(false);
    }
  }, [applyResult]);

  useEffect(() => {
    const categoryChanged = categoryRef.current !== category;
    categoryRef.current = category;
    let cancelled = false;

    if (categoryChanged) {
      // Switching categories in place (the Section screen's category picker): drop the
      // previous category's articles immediately so they never render under the new
      // heading, seeding from cache when we have it.
      const cachedForNext = getCachedCategory(category);
      setArticles(cachedForNext?.articles ?? []);
      setStale(cachedForNext?.stale ?? false);
      setLastUpdated(toDate(cachedForNext?.lastUpdated ?? null));
      setLoading(!cachedForNext);
      setError(null);
    }

    const bootstrap = async () => {
      await ensureHydrated();
      if (cancelled) return;

      const cached = getCachedCategory(category);
      if (cached) {
        if (!cancelled) {
          setArticles(cached.articles);
          setStale(cached.stale);
          setLastUpdated(toDate(cached.lastUpdated));
          setLoading(false);
        }

        if (!cached.stale) {
          // Within the soft TTL — no network call needed at all.
          return;
        }

        // Past the soft TTL: revalidate in the background without blocking the UI.
        setRefreshing(true);
        setError(null);
        try {
          const result = await fetchCategory(category);
          if (!cancelled) applyResult(result);
        } catch (e) {
          if (!cancelled) setError(getErrorMessage(e, "Failed to load stories."));
        } finally {
          if (!cancelled) setRefreshing(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await fetchCategory(category);
        if (!cancelled) {
          applyResult(result);
        }
      } catch (e) {
        if (!cancelled) {
          setError(getErrorMessage(e, "Failed to load stories."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [category, applyResult]);

  return { articles, loading, refreshing, error, stale, lastUpdated, refresh };
};
