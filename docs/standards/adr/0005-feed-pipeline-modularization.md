# ADR-0005: Feed Pipeline Modularization and Per-Source Caching

Last Updated: 2026-07-01

**Date:** 2026-07-01
**Status:** Accepted
**Deciders:** Engineering
**Context:** RSS reliability, faster loading, and trust panel pass (2026-07-01)

---

## Context and Problem Statement

A June 25, 2026 source health probe found 11 of the app's enabled RSS feeds returning HTML, 403/404, empty feeds, or other non-feed payloads. Because `RssService.ts` cached results per-category in a single in-memory `Map` and only wrote that cache when the *entire* aggregate fetch for a category succeeded, a single broken source could blank an entire category's cache on refresh. Separately, `HomeScreen` and `SectionScreen` both forced a blocking `forceRefresh: true` fetch on every mount even when a fresh cache already existed, so every app open paid a full network round-trip before settling.

Both problems share a root cause: category-level, all-or-nothing caching with no per-source visibility.

## Decision Drivers

- Stability-first: fix reliability and loading speed without a broad redesign.
- No new runtime dependencies.
- Cache-first launch preferred over fresh-first blocking.
- Preserve `fetchArticlesByCategory(category, options)` so `AiService`, `HomeScreen`, `SectionScreen`, and existing tests don't require a flag-day rewrite.

## Decision Outcome

Split `src/services/RssService.ts` into `src/services/feed/`:

- `types.ts` — `RawFeedItem` (typed fast-xml-parser item shape, replacing `any`), `FeedFetchFailure`, `FeedLoadResult`, `FeedSourceHealth`.
- `sourceRegistry.ts` — typed accessor over `src/data/feedConfig.ts`; logs a one-time warning when a category's default-enabled source count drops to 1.
- `transport.ts` — direct/proxy/rss2json fetch-attempt logic, unchanged resilience chain (direct → corsproxy.io → api.allorigins.win → rss2json.com).
- `parser.ts` — pure, typed RSS 2.0 / Atom / media-namespace extraction (`parseFeedXml`, `normalizeFeedItem`). Also fixes a latent bug: an unparseable `pubDate` used to silently produce `NaN` for `publishedAt`; it now falls back to `Date.now()` like a missing date does.
- `htmlUtils.ts` — sanitizer/paragraph/media-extraction helpers, moved verbatim.
- `cacheStore.ts` — per-source AsyncStorage-backed cache (`FeedCacheSnapshot`) with an in-memory mirror for synchronous reads.
- `repository.ts` — orchestration: `fetchCategory`, `getCachedCategory`, `getCategoryFetchedAt`.

`src/services/RssService.ts` becomes a **permanent** thin facade delegating to `feed/repository.ts`, so `AiService.fetchDigestArticles()` (which calls `fetchArticlesByCategory(category)` with no options) needs no changes.

### Per-source cache policy

AsyncStorage key `abridged:feedCache:v1:{category}:{sourceName}` holds one `FeedCacheSnapshot` (`articles`, `fetchedAt`, `attemptedAt`) per source. Category results are the sorted merge of all per-source snapshots — not a single aggregate write. A source's snapshot is only overwritten on a *successful, non-empty* fetch; a failed or empty attempt just records `attemptedAt` and leaves the existing snapshot (however stale) untouched. This is the actual fix for "a broken source blanks the category": one source's failure no longer disturbs another source's last-known-good content, and a source that has *never* succeeded simply contributes nothing rather than an error that wipes the category.

- Soft TTL: 5 minutes. Within this window, `fetchCategory` returns cache with no network call.
- Beyond the soft TTL, cache is still returned (`stale: true`) while a background refresh runs — this is what `useCategoryFeed` uses for cache-first, non-blocking loading.
- A category only throws `FeedLoadError` when **no source has ever had a successful snapshot** and the live attempt also fails for all sources — not merely "this call's results were empty."
- In-flight requests are deduped per `${category}::${sourceName}` so concurrent callers (e.g. a screen mount racing `AiService`'s digest fetch) don't double-fetch the same source.

### Known trade-off: Culture category source starvation

Per the June 25, 2026 probe, City Paper and WESA Arts (Culture) are both disabled as `pending-replacement`, leaving Pittsburgh Mag as Culture's sole enabled source. This was a deliberate call, confirmed with the product owner: disabling verified-broken sources is the correct behavior even though it leaves Culture at a single point of failure, rather than quietly keeping a broken source enabled to pad the source count. `sourceRegistry.ts` logs a warning when any category drops to 1 enabled source, and this is tracked as a follow-up — source a second healthy Culture feed in a later pass.

### Full-story cache

`src/services/fullStoryCache.ts` adds a cache/dedupe wrapper (`getCachedFullStory`, `fetchAndCacheFullStory`, `clearExpiredFullStories`) around the existing, unmodified `FullStoryService.fetchFullArticleBody` — not a new extraction pipeline. 24-hour TTL, lazy expiry on read, AsyncStorage key `abridged:fullStoryCache:v1:{urlHash}`.

## Consequences

**Positive:**
- A broken source degrades gracefully instead of blanking a category.
- Home/Section screens show cached stories immediately with no blocking spinner on warm launch.
- Full-story enrichment no longer re-fetches on every article view.

**Negative:**
- More moving pieces (7 files instead of 1) — mitigated by the facade keeping the external API surface unchanged.
- Culture is single-source until a replacement is added (see trade-off above).

## Links

- Related ADRs: [ADR-0002](0002-rss-parsing-approach.md) (full-article extraction; corrected alongside this ADR)
- Related docs: [RSS Content Use Audit](../../compliance/rss_content_audit.md)
