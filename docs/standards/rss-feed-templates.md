# RSS Feed Templates & Pittsburgh Source Catalog
Version 1.0
Last Updated: January 26, 2026

## Purpose
Document how we select, template, and validate RSS feeds, with a Pittsburgh-first catalog. This is **documentation only**—no code changes implied.

## In-app templates (1.4+)
- **Pittsburgh**: local-first mix of breaking, business, sports, and culture (see `src/data/feedTemplates.ts`).
- **National (US)**: AP/Reuter/NPR mix for broad headlines plus business/sports.
- **International**: BBC/Reuters/Al Jazeera/Guardian world coverage plus culture.

Templates are used to prefill the custom feed form in Settings; users can edit the name/category before saving.

## Template schema (conceptual)
Define bundles by area/category so updates stay predictable:
- **category**: `ArticleCategory` (Top | Local | Business | Sports | Culture)
- **primary**: must-include, high-signal feeds
- **secondary**: optional/backup feeds that can be toggled off by default if noisy
- **notes**: CORS quirks, rate limits, paywall/summary-only behavior

## Pittsburgh template examples

### Current app feed template (as of January 26, 2026)
These are the feeds currently shipped in-app and their default toggle states (default **off** means opt-in via Settings).

#### Top
- WTAE
- CBS Pittsburgh
- WPXI
- WESA (**default off**, 404 as of Jan 26, 2026)
- Pittsburgh Independent (**default off**, 404 as of Jan 26, 2026)
- Pittsburgh City Cast (**default off**, podcast/audio)

#### Local
- PublicSource
- TribLive
- Post-Gazette (Local)
- New Pittsburgh Courier
- Kidsburgh
- Pittsburgh Mom Collective (**default off**, noisy/parenting-heavy)
- The Incline (**default off**, domain parked/expired)

#### Business
- Pittsburgh Business Times (**default off**, 403/blocked)
- TribLive Business
- Post-Gazette Business
- NEXTpittsburgh
- TechVibe Radio (**default off**, audio-first)
- InnovatePGH (**default off**, pending verification)

#### Sports
- Steelers.com
- DK Pittsburgh Sports
- TribLive Sports
- Penguins (NHL.com) (**default off**, NHL feed returning error/403)
- Pirates (MLB.com team feed) (**default off**)
- Pitt Panthers (athletics) (**default off**, intermittent 500)

#### Culture
- Pittsburgh City Paper
- Pittsburgh Magazine A&E
- WESA Arts (**default off**, 404)

### Top (Breaking/General)
- Primary: WTAE, CBS Pittsburgh, WPXI
- Secondary: WESA (news), PublicSource highlights, The Incline

### Local
- Primary: PublicSource, TribLive Local, Post-Gazette Local, New Pittsburgh Courier
- Secondary: Kidsburgh, Pittsburgh Mom Collective

### Business
- Primary: Pittsburgh Business Times, TribLive Business, Post-Gazette Business, NEXTpittsburgh
- Secondary: TechVibe Radio (Pittsburgh Tech Council), InnovatePGH (if RSS available)

### Sports
- Primary: Steelers.com, TribLive Sports, DK Pittsburgh Sports
- Secondary: Penguins (NHL.com), Pirates (MLB.com), Pitt Panthers (athletics RSS)

### Culture
- Primary: Pittsburgh City Paper, Pittsburgh Magazine A&E
- Secondary: WESA Arts, Kidsburgh, The Incline

## Pittsburgh source catalog (validate before adding)

| Category | Source | URL | Validation status | Default toggle | Notes |
| --- | --- | --- | --- | --- | --- |
| Top/Local | WESA | https://www.wesa.fm/rss | Failing (404 Jan 2026) | Off | 404; keep disabled until restored |
| Top/Local | Pittsburgh Independent | https://pghindependent.com/feed/ | Failing (404 Jan 2026) | Off | Site/feed returning 404 |
| Top/Local | Pittsburgh City Cast | https://omny.fm/shows/city-cast-pittsburgh/playlists/podcast.rss | Pending | Off (audio-heavy) | Podcast feed; treat as long-form |
| Local | Kidsburgh | https://www.kidsburgh.org/feed/ | Pending | On | Family/education; light media |
| Local | Pittsburgh Mom Collective | https://pittsburgh.momcollective.com/feed/ | Pending | Off (noisy) | Parenting/local |
| Local | The Incline | https://theincline.com/feed/ | Failing (domain parked) | Off | Domain expired/parking page |
| Business | TechVibe Radio | https://techviberadio.libsyn.com/rss | Pending | Off (audio-first) | Audio-first; summary bodies |
| Business | InnovatePGH | https://pghtech.org/feed/ (verify) | Unknown | Off (await verify) | Confirm RSS availability |
| Sports | Penguins | https://www.nhl.com/penguins/rss/news | Failing (403/error page) | Off | NHL host returning error; left opt-in only |
| Sports | Pirates | https://www.mlb.com/feeds/news/rss.xml?teamId=134 | Pending | Off | MLB team feed; enable if acceptable |
| Sports | Pitt Panthers | https://pittsburghpanthers.com/rss.aspx?path=general | Intermittent (500) | Off | Sometimes summary-only/blocked |
| Culture | WESA Arts | https://www.wesa.fm/arts-culture/rss | Failing (404) | Off | Same host as news; currently 404 |
| Culture | The Incline | https://theincline.com/feed/ | Failing (domain parked) | Off | Shared with Local |

## Validation checklist (before editing code)
1. **Reachability**: Direct fetch succeeds on device; if blocked, confirm proxy works (`corsproxy.io`) and note it.
2. **CORS/UA quirks**: If a source blocks default UA, rely on the existing custom UA in `RssService` and proxy fallback.
3. **Payload shape**: Confirm items expose `title`, `link`, `pubDate`, and either `description` or `content:encoded`.
4. **Media**: Prefer feeds with `enclosure` or `media:content`; otherwise expect inline `<img>` fallback.
5. **Content depth**: If summary-only (< ~600 chars), note whether full-body fetch is needed (like WTAE special-case).
6. **Timestamps**: Verify `pubDate` is present; otherwise expect “Recently” fallback.
7. **Category mapping**: Assign to one `ArticleCategory`; avoid cross-posting unless intentional.
8. **User controls**: Ensure new sources are toggleable via `sourcePreferences` (already supported by `RssService`).
9. **Sorting behavior**: Current sorter favors recency; if within 12h, longer bodies rank higher.
10. **Cache fit**: `CACHE_TTL_MS` is 5 minutes; avoid extremely noisy feeds that would churn cache.
11. **Health checks**: The Settings custom feed form calls `validateFeedSource` (see `RssService`) to flag unreachable/retired/empty feeds before saving.

## RssService constraints to keep in mind
- **Timeouts**: `FETCH_TIMEOUT_MS = 7000ms`; avoid feeds with very slow responses.
- **Proxy fallback**: Uses `https://corsproxy.io/?` after a direct attempt; document sources that require proxy.
- **User-Agent**: Custom iOS-like UA is already set for stricter publishers (e.g., WTAE).
- **Full-body fetch**: Special-case exists for WTAE when body is short; add similar enrichment only if a feed is chronically summary-only.
- **Media extraction**: Pulls from `enclosure`, `media:content`, `itunes:image`, and inline HTML; HTTPS is enforced.

## Settings integration (user control)
- All sources must be toggleable via the app’s source preferences surfaced in Settings (category-scoped toggles). Use the existing `sourcePreferences` helpers to default new sources **on** unless they are noisy/experimental (then default **off** and note it).
- When adding a source to `feedConfig`, also add a Settings label entry so users can enable/disable it; keep naming consistent with the `FeedSource.name` value.
- Avoid hard-coding per-source logic in UI; rely on the existing preference map and category grouping so updates remain data-driven.
- If a source is known to be summary-only or proxy-only, note this in the Settings description or a short tooltip-style note so users understand trade-offs (optional, UI permitting).

## How to add feeds (when greenlit)
1. Update `src/data/feedConfig.ts` with the chosen sources (respect primary/secondary grouping).
2. If a source needs enrichment, add a guarded path in `RssService` akin to the WTAE full-body fetch.
3. Run Jest (`npx jest --runInBand`) to ensure parsers/mocks still pass.
4. Add a short note in `CHANGELOG.md` under `[Unreleased]` if user-facing feed coverage meaningfully changes.

## Deferred / needs verification
- InnovatePGH feed availability
- Any paywalled or heavily rate-limited sources (should remain out until verified)

## Ownership
- Steward: Engineering lead (per `README.md`)
- For proposed changes, open a PR referencing this doc and the target release (e.g., TODO-00x in `updates/todo.md`).

## Priority Fixes & Stability — Do These First

- [ ] Save/load resilience for SavedArticles (error handling + migration from in-memory on first launch)
- [ ] Network/Feed error states (offline-friendly, retries, last-updated labeling)
- [ ] Loading/skeleton experience (avoid blank screens; progressive image loading)
- [ ] Offline indicator + queued actions (save/unsave) until reconnected
- [ ] Accessibility audit (VoiceOver, Dynamic Type, contrast)
- [ ] Global animation + haptics controls (respect Reduce Motion, provide overrides)
