# ADR 0002: RSS Parsing and Content Extraction

Last Updated: 2026-01-16

**Date**: 2026-01-15
**Status**: Accepted
**Author**: Engineering Lead

## Context

The Abridged app sources articles from RSS feeds (via TriB Live, local news, regional feeds). For each article, we need:
1. **Metadata**: Title, author, publication date, source URL
2. **Body**: The full article text (not just the summary)
3. **Images**: Featured image (if available)

Most RSS feeds provide only a summary or truncated body. Fetching the full article requires:
- Parsing the RSS feed itself (XML/JSON)
- Extracting metadata
- Fetching the full article from the source URL
- Parsing the HTML to extract the main article text

## Decision

**Use Cheerio (Node.js) on the backend (or RN-compatible parsing) to extract full article content.**

Specifically:
- Fetch the full HTML from the article URL
- Use Cheerio to parse and extract:
  - Article title, author, publish date
  - Main article body (heuristic: largest text block, exclude sidebar/ads)
  - Featured image (first large image in article)
- Cache parsed content (optional, future optimization)
- Handle errors gracefully (fallback to RSS summary if extraction fails)

**Rationale:**
- Cheerio is lightweight and works in React Native (via a compatibility layer or backend service).
- Heuristic extraction (largest text block) is reliable for news sites.
- Decoupling RSS parsing from content extraction allows us to add custom parsers for specific sources (if needed later).
- Gives users the full article without paywalls or truncation (where possible).

## Consequences

**Positive:**
- Users see full articles, not truncated summaries.
- We control content quality and layout (consistent reading experience).
- Can add source-specific parsing rules (e.g., custom CSS selectors for certain sites).

**Negative:**
- Network overhead: fetching full HTML is slower than RSS alone.
  - *Mitigated by: Background fetch + caching; prefetch popular articles.*
- Content extraction heuristics may fail on poorly-structured HTML.
  - *Mitigated by: Fallback to RSS summary; manual source overrides.*
- Dependency on external source site availability (if extraction fails, feature degrades gracefully).

## Alternatives considered

1. **Use RSS summary only**
   - Rejected: Truncated articles degrade reading experience; defeats purpose of app.

2. **Vendor solution (e.g., Mercury, Readability API)**
   - Rejected: Adds cost and dependency; Cheerio is free and maintainable.

3. **In-app HTML parsing (WebView + JavaScript injection)**
   - Rejected: Slower, less control over parsing logic.

## Implementation notes

- Content extraction happens in `src/services/RssService.ts`.
- Heuristic: find the largest `<p>` tag cluster or `<article>` container.
- Cache full articles in `AsyncStorage` with a TTL (e.g., 24 hours).
- See `src/utils/contentParser.ts` for the parsing logic.
- For specific sources (e.g., paywalled sites), add custom selectors in a config file.
