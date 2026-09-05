import { Platform } from "react-native";
import { Article, ArticleCategory } from "../../types/Article";
import { FeedSource } from "../../data/feedConfig";
import { ErrorCode, ErrorHandler } from "../../utils/errorCodes";
import { loadSourcePreferences, isSourceEnabled, getSourcePreferencesSync } from "../../utils/sourcePreferences";
import { getSourcesForCategory, getSourceDomain } from "./sourceRegistry";
import { fetchFeedXml, fetchViaRss2Json } from "./transport";
import { parseFeedXml, normalizeFeedItem } from "./parser";
import { FeedFetchFailure, FeedLoadResult } from "./types";
import {
  ensureHydrated,
  getSourceSnapshot,
  getCategorySnapshots,
  writeSourceSnapshot,
  touchSourceAttempt,
  FeedCacheSnapshot,
} from "./cacheStore";

const SOFT_TTL_MS = 5 * 60 * 1000; // 5 minutes: within this window, serve cache with no network call
const HARD_STALE_MS = 24 * 60 * 60 * 1000; // 24 hours: beyond this, still serve cache but flag it stale

const inFlight = new Map<string, Promise<{ snapshot: FeedCacheSnapshot | null; failure: FeedFetchFailure | null }>>();

const sortArticles = (articles: Article[]): Article[] =>
  [...articles].sort((a, b) => {
    const publishedDiff = b.publishedAt - a.publishedAt;
    if (publishedDiff !== 0) return publishedDiff;
    const bodyLengthDiff = b.body.length - a.body.length;
    if (bodyLengthDiff !== 0) return bodyLengthDiff;
    return a.headline.localeCompare(b.headline);
  });

const getFeedErrorCode = (error: unknown, fallbackCode: ErrorCode): ErrorCode => {
  if (error && typeof error === "object" && "name" in error && error.name === "AbortError") {
    return ErrorCode.NETWORK_TIMEOUT;
  }
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("abort") || message.includes("timeout")) {
    return ErrorCode.NETWORK_TIMEOUT;
  }
  if (message.includes("network") || message.includes("fetch")) {
    return ErrorCode.NETWORK_REQUEST_FAILED;
  }
  return fallbackCode;
};

const createFeedLoadError = (category: ArticleCategory, failures: FeedFetchFailure[]) => {
  const code = failures.some((failure) => failure.code === ErrorCode.NETWORK_TIMEOUT)
    ? ErrorCode.NETWORK_TIMEOUT
    : failures.some((failure) => failure.code === ErrorCode.NETWORK_REQUEST_FAILED)
      ? ErrorCode.NETWORK_REQUEST_FAILED
      : ErrorCode.RSS_PARSE_FAILED;
  const details = failures.map((failure) => `${failure.sourceName}: ${failure.message}`).join("; ");
  const appError = ErrorHandler.createError(code, `Failed to load ${category} feeds`, details, true);
  const error = new Error(appError.userMessage) as Error & {
    code?: ErrorCode;
    details?: string;
    failures?: FeedFetchFailure[];
    userMessage?: string;
  };
  error.name = "FeedLoadError";
  error.code = appError.code;
  error.details = details;
  error.failures = failures;
  error.userMessage = appError.userMessage;
  return error;
};

const fetchSingleSource = async (
  category: ArticleCategory,
  source: FeedSource,
): Promise<{ snapshot: FeedCacheSnapshot | null; failure: FeedFetchFailure | null }> => {
  const now = Date.now();
  const sourceDomain = getSourceDomain(source);
  // Both call sites below are on the successful-fetch path, building the snapshot that's
  // about to be written with fetchedAt: now - so provenance should report that same "now",
  // not the pre-fetch cached snapshot (which is always one fetch behind what just succeeded).
  const provenance = () => ({
    sourceDomain,
    sourceLastRefreshedAt: now,
  });

  try {
    const isWeb = Platform.OS === "web";
    const { response, error: fetchError } = await fetchFeedXml(source.url, isWeb);

    if (!response || !response.ok) {
      const rss2JsonItems = await fetchViaRss2Json(source.url);
      if (rss2JsonItems?.length) {
        const articles = rss2JsonItems.map((raw) =>
          normalizeFeedItem(raw, category, source.name, provenance()),
        );
        const snapshot: FeedCacheSnapshot = {
          sourceName: source.name,
          category,
          articles,
          fetchedAt: now,
          attemptedAt: now,
          schemaVersion: 1,
        };
        await writeSourceSnapshot(snapshot);
        return { snapshot, failure: null };
      }

      await touchSourceAttempt(category, source.name, now);
      return {
        snapshot: null,
        failure: {
          sourceName: source.name,
          code: getFeedErrorCode(fetchError, ErrorCode.NETWORK_REQUEST_FAILED),
          message: fetchError instanceof Error ? fetchError.message : "All fetch attempts failed.",
        },
      };
    }

    const text = await response.text();
    const parsed = parseFeedXml(text);
    if (!parsed) {
      await touchSourceAttempt(category, source.name, now);
      return {
        snapshot: null,
        failure: {
          sourceName: source.name,
          code: ErrorCode.RSS_PARSE_FAILED,
          message: "Feed response did not contain a readable channel.",
        },
      };
    }

    const articles = parsed.items.map((raw) => normalizeFeedItem(raw, category, source.name, provenance()));

    if (articles.length === 0) {
      // A feed that parses but carries no items is a failure, not a quiet success. Several
      // publishers (TribLive's section feeds) serve a well-formed but empty document, and
      // reporting null/null here made that indistinguishable from "nothing new" — the
      // category just silently shrank instead of surfacing cached-state and retry messaging.
      await touchSourceAttempt(category, source.name, now);
      return {
        snapshot: null,
        failure: {
          sourceName: source.name,
          code: ErrorCode.RSS_PARSE_FAILED,
          message: "Feed returned no stories.",
        },
      };
    }

    const snapshot: FeedCacheSnapshot = {
      sourceName: source.name,
      category,
      articles,
      fetchedAt: now,
      attemptedAt: now,
      schemaVersion: 1,
    };
    await writeSourceSnapshot(snapshot);
    return { snapshot, failure: null };
  } catch (error) {
    await touchSourceAttempt(category, source.name, now);
    return {
      snapshot: null,
      failure: {
        sourceName: source.name,
        code: getFeedErrorCode(error, ErrorCode.RSS_PARSE_FAILED),
        message: error instanceof Error ? error.message : "Failed to fetch or parse feed.",
      },
    };
  }
};

const fetchSourceDeduped = (
  category: ArticleCategory,
  source: FeedSource,
): Promise<{ snapshot: FeedCacheSnapshot | null; failure: FeedFetchFailure | null }> => {
  const key = `${category}::${source.name}`;
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = fetchSingleSource(category, source).finally(() => {
    inFlight.delete(key);
  });

  inFlight.set(key, promise);
  return promise;
};

const resolveSourcesToFetch = async (category: ArticleCategory): Promise<FeedSource[]> => {
  const allSources = getSourcesForCategory(category);
  const prefs = await loadSourcePreferences();
  let sourcesToFetch = allSources.filter((src) =>
    isSourceEnabled(prefs.overrides, category, src.name, src.defaultEnabled ?? true),
  );

  if (sourcesToFetch.length === 0) {
    sourcesToFetch = allSources.filter((src) => src.defaultEnabled ?? true);
  }

  return sourcesToFetch;
};

const mergeCategoryFromCache = (category: ArticleCategory, sourceNames: string[]): FeedLoadResult => {
  const snapshots = getCategorySnapshots(category, sourceNames);
  const articles = sortArticles(snapshots.flatMap((snapshot) => snapshot.articles));
  // lastUpdated (display) uses the most recent source; stale (does this need a refetch?)
  // uses the oldest included source - taking the max for both would mark the merged
  // result fresh whenever any single source just refreshed, even while other sources
  // in the same merge are still serving old, stale-while-revalidate-eligible snapshots.
  const fetchedTimes = snapshots.map((snapshot) => snapshot.fetchedAt);
  const lastUpdated = fetchedTimes.length ? Math.max(...fetchedTimes) : null;
  const oldestUpdated = fetchedTimes.length ? Math.min(...fetchedTimes) : null;
  const stale = oldestUpdated !== null && Date.now() - oldestUpdated > SOFT_TTL_MS;
  return { articles, stale, lastUpdated };
};

/** Fetches (or serves cached) articles for a category. Cache-first: within the soft TTL,
 * returns cache with no network call; beyond it, still returns cache immediately if present
 * (stale-while-revalidate is the caller's job via useCategoryFeed) but this function itself
 * always performs the live fetch when called outside the soft TTL or with forceRefresh.
 * A broken source never blanks the category — each source's snapshot is written
 * independently, so one failure just means that source's merge contribution stays whatever
 * it was last time (or absent, if it has never succeeded). Only throws when NO source has
 * ever had a successful snapshot AND the live attempt also failed for all of them. */
export const fetchCategory = async (
  category: ArticleCategory,
  options: { forceRefresh?: boolean } = {},
): Promise<FeedLoadResult> => {
  await ensureHydrated();
  const sourcesToFetch = await resolveSourcesToFetch(category);

  if (sourcesToFetch.length === 0) {
    return { articles: [], stale: false, lastUpdated: null };
  }

  const sourceNames = sourcesToFetch.map((source) => source.name);
  const cachedResult = mergeCategoryFromCache(category, sourceNames);
  const withinSoftTtl =
    !options.forceRefresh &&
    cachedResult.lastUpdated !== null &&
    Date.now() - cachedResult.lastUpdated < SOFT_TTL_MS &&
    cachedResult.articles.length > 0;

  if (withinSoftTtl) {
    return cachedResult;
  }

  const results = await Promise.all(sourcesToFetch.map((source) => fetchSourceDeduped(category, source)));
  const failures = results.map((result) => result.failure).filter((failure): failure is FeedFetchFailure => Boolean(failure));
  const freshResult = mergeCategoryFromCache(category, sourceNames);

  if (freshResult.articles.length === 0 && failures.length > 0) {
    // No source has ever succeeded (cache is empty) and every live attempt just failed too.
    throw createFeedLoadError(category, failures);
  }

  if (failures.length > 0) {
    console.warn(
      `Partial feed failure for ${category}: ${failures.map((failure) => `${failure.sourceName} (${failure.code})`).join(", ")}`,
    );
  }

  return freshResult;
};

export const getCachedCategory = (category: ArticleCategory): FeedLoadResult | null => {
  const allSources = getSourcesForCategory(category);
  const { overrides } = getSourcePreferencesSync();
  let sources = allSources.filter((src) =>
    isSourceEnabled(overrides, category, src.name, src.defaultEnabled ?? true),
  );
  if (sources.length === 0) {
    sources = allSources.filter((src) => src.defaultEnabled ?? true);
  }
  const result = mergeCategoryFromCache(category, sources.map((source) => source.name));
  return result.articles.length > 0 ? result : null;
};

export const getCategoryFetchedAt = (category: ArticleCategory): number | null => {
  const sources = getSourcesForCategory(category);
  return mergeCategoryFromCache(category, sources.map((source) => source.name)).lastUpdated;
};

export { HARD_STALE_MS, SOFT_TTL_MS };
