# Active To-Do List

Last Updated: August 8, 2026

**Quick Reference:**
- See [completed.md](./completed.md) for all finished tasks
- Reference standards: [docs/standards/](../docs/standards/)
- Agent instructions: [.agentinstructions.md](../.agentinstructions.md)

---

## Audit Priority Queue (March 22, 2026)

- [x] **TODO-031** | **v1.3.1** | Restore engineering gates: TypeScript + Jest
  - **Status**: ✅ Completed
  - **Description**: Fix current `npx tsc --noEmit` failures, repair Jest config for `@sentry/react-native` ESM, and reconcile broken Home/Saved test expectations with the actual UI.
  - **Effort**: 4 hours
  - **Definition of Done**: `npm test -- --runInBand` passes locally, `npx tsc --noEmit` passes locally, and test output is free of avoidable act/config failures.
  - **Completed**: March 22, 2026
  - **Dependencies**: None

- [x] **TODO-032** | **v1.3.1** | Fix RSS ordering + honest network error handling
  - **Status**: ✅ Completed
  - **Description**: Sort feeds by `publishedAt` instead of display timestamps, propagate hard feed failures to screen-level error states, and distinguish empty feeds from offline/fetch failures.
  - **Effort**: 3 hours
  - **Definition of Done**: New stories appear in correct order, failed feed loads show retry/cached-state UI, and empty-state copy is only shown for true empty results.
  - **Completed**: March 22, 2026
  - **Dependencies**: RssService, HomeScreen, SectionScreen

- [x] **TODO-033** | **v1.3.1** | Refactor reading progress persistence for performance + profile safety
  - **Status**: ✅ Completed
  - **Description**: Stop reading/writing AsyncStorage on every scroll tick, batch writes from context state, guard zero-height scroll math, and namespace progress data by active profile.
  - **Effort**: 5 hours
  - **Definition of Done**: Article scrolling no longer triggers storage churn per frame, progress is preserved correctly, and switching profiles does not leak reading state across users.
  - **Dependencies**: ReadingProgressContext, readingProgressStorage, ArticleScreen, ProfileContext
  - **Completed**: March 22, 2026

- [x] **TODO-034** | **v1.3.1** | Persist active profile selection across relaunch
  - **Status**: ✅ Completed
  - **Description**: Save the active profile id, restore it on launch, and ensure profile switching updates all profile-scoped storage consistently.
  - **Effort**: 2 hours
  - **Definition of Done**: Relaunch returns to the last active profile instead of defaulting to the first stored profile, with saved articles and progress aligned to that profile.
  - **Dependencies**: ProfileContext, SavedArticlesContext, ReadingProgressContext
  - **Completed**: March 22, 2026

- [x] **TODO-035** | **v1.3.1** | Fix What's New/version-seen loop
  - **Status**: ✅ Completed
  - **Description**: Mark the current app version as seen when the post-update onboarding flow completes so returning users do not keep re-entering the onboarding stack.
  - **Effort**: 1 hour
  - **Definition of Done**: After completing the What's New/onboarding flow once for a version, app relaunch opens Main instead of reopening onboarding.
  - **Dependencies**: SettingsContext, OnboardingScreen, RootNavigator
  - **Completed**: March 22, 2026

- [x] **TODO-036** | **v1.3.1** | Complete dark-mode/theme migration
  - **Status**: Completed
  - **Description**: Replace static `theme/colors` imports on primary screens/components with reactive theme access, then close the known dark-mode drift in navigation, article, and saved surfaces.
  - **Effort**: 5 hours
  - **Definition of Done**: Theme changes propagate without reload, StatusBar tracks the active theme, and dark-mode spot checks pass on Home, Article, Saved, and Settings.
  - **Dependencies**: ThemeContext, App.tsx, RootNavigator, core screens/components
  - **Completed**: March 22, 2026

- [x] **TODO-037** | **v1.3.1** | Patch production dependency vulnerabilities in feed/network stack
  - **Status**: Completed
  - **Description**: Upgrade or mitigate current production `npm audit --omit=dev` findings, prioritizing `fast-xml-parser` and other high/critical runtime packages used by feed loading.
  - **Effort**: 2.5 hours
  - **Definition of Done**: High/critical prod vulnerabilities are removed or explicitly mitigated and documented, with feed parsing regression-tested.
  - **Dependencies**: package.json, package-lock.json, RssService tests
  - **Completed**: March 22, 2026

- [x] **TODO-038** | **v1.4.0** | Rebuild digest AI/settings flow on current baseline
  - **Status**: Completed
  - **Description**: Remove the embedded Perplexity env dependency, move the optional API key into Settings, replace `MOCK_ARTICLES` in Daily Digest with live feed data, and restore launch controls in Digest & Launch.
  - **Effort**: 3 hours
  - **Definition of Done**: Digest uses live feeds, AI keys are stored locally in settings, article/digest summaries fall back extractively when no key is set, and digest failures do not silently advance the user's last-visit timestamp.
  - **Dependencies**: SettingsContext, DigestSettingsScreen, DigestScreen, AiService
  - **Completed**: March 22, 2026

- [x] **TODO-039** | **v1.4.0** | Salvage per-profile feed recency tracking from release branch
  - **Status**: Completed
  - **Description**: Port only the useful parts of `recordLastFetchedArticles` and related profile stats from `release/1.4.0`, wire them into Home/Section fetches, and use that metadata to keep Daily Digest from resurfacing already-fetched stories for the active profile.
  - **Effort**: 2.5 hours
  - **Definition of Done**: Profile stats remember the latest fetched article ids/timestamp, feed refreshes update them safely per active profile, and digest generation respects that recency metadata on the current baseline.
  - **Dependencies**: ProfileContext, HomeScreen, SectionScreen, DigestScreen, AiService
  - **Completed**: March 22, 2026

- [x] **TODO-040** | **v1.4.0** | Salvage onboarding/profile polish in tested slices
  - **Status**: Completed
  - **Description**: Rebuild the remaining high-value `release/1.4.0` onboarding/profile improvements in small patches instead of merging the branch wholesale.
  - **Progress**: Slice 1 landed. Onboarding now has a real Next action, scroll-safe slides, accessible progress, and current `minimal`/`comprehensive` layout selection on the clean baseline. Slice 2 landed. Profile now shows tracked reading metrics, relative last-read/save activity, and karma tier status from current device data instead of placeholder streak copy. Slice 3 landed. Profile is now simplified around overview, reading, account, and support, removing duplicate settings paths and preview-only clutter. Slice 4 review landed. Remaining release-only onboarding/profile ideas were intentionally dropped because they were stale, regressive, or no longer aligned with the cleaned baseline.
  - **Effort**: 4 hours
  - **Definition of Done**: Any ported onboarding/profile improvements land with tests and without reintroducing the release branch's dependency, RSS, or profile regressions.
  - **Dependencies**: OnboardingScreen, ProfileScreen, associated tests
  - **Completed**: March 22, 2026

- [x] **TODO-041** | **v1.4.1** | Reader-first quality sweep baseline + Morning Brief
  - **Status**: Completed
  - **Description**: Sync to current master, restore TypeScript/Jest/docs lint gates, and reshape Home into a finite Morning Brief with cached-state messaging, accessible retry copy, and Today’s Brief framing.
  - **Effort**: 4 hours
  - **Definition of Done**: `npx tsc --noEmit`, `npm test -- --runInBand`, `npm run repo:health`, and `npm run lint:docs` pass; Home tests cover Morning Brief, cached-state, refresh, error, and continue-reading behavior.
  - **Dependencies**: HomeScreen, ThemeContext, Jest setup, docs lint metadata
  - **Completed**: June 10, 2026

- [x] **TODO-042** | **v1.4.1** | Reader-first onboarding overflow pass
  - **Status**: Completed
  - **Description**: Simplify onboarding into a five-slide welcome flow with app-like previews, one optional grounding choice, and wrap-safe footer actions instead of front-loading tab-layout configuration.
  - **Effort**: 1.5 hours
  - **Definition of Done**: Onboarding tests pass, TypeScript stays clean, and first-run onboarding no longer includes icon-only placeholder slides or a second setup decision.
  - **Dependencies**: OnboardingScreen, OnboardingScreen tests
  - **Completed**: June 14, 2026

- [x] **TODO-043** | **v1.4.2** | Modularize RSS feed pipeline (source registry, transport, parser, repository, per-source cache)
  - **Status**: Completed
  - **Description**: Split `RssService.ts` into `src/services/feed/{types,sourceRegistry,transport,parser,htmlUtils,cacheStore,repository}.ts`, replacing the single in-memory category cache with a per-source AsyncStorage cache so one broken source no longer blanks a whole category. Disabled the 11 sources confirmed broken by the June 25, 2026 health probe. `RssService.ts` becomes a permanent thin facade so `AiService`/existing callers are unaffected.
  - **Effort**: 5 hours
  - **Definition of Done**: `npx tsc --noEmit` passes; new `feed/parser.test.ts` and `feed/repository.test.ts` cover Atom/rss2json/media/malformed-HTML/date-fallback fixtures and partial-failure/dedupe/TTL behavior; `RssService.test.ts` narrowed to a facade smoke test.
  - **Dependencies**: None
  - **Completed**: July 1, 2026

- [x] **TODO-044** | **v1.4.2** | Adopt `useCategoryFeed` in Home/Section screens for cache-first launch
  - **Status**: Completed
  - **Description**: Added `src/hooks/useCategoryFeed.ts` and migrated `HomeScreen`/`SectionScreen` to it, replacing the old always-force-refresh-on-mount pattern with cache-first display and background revalidation only past the 5-minute soft TTL. Pull-to-refresh and cached-on-failure behavior preserved.
  - **Effort**: 3 hours
  - **Definition of Done**: `HomeScreen.test.tsx`/`SectionScreen.test.tsx` updated to mock the hook and pass; new `useCategoryFeed.test.ts` covers cache-first-no-spinner, background revalidation, cold-start loading, and refresh-preserves-articles-on-failure.
  - **Dependencies**: TODO-043

- [x] **TODO-045** | **v1.4.2** | Add full-story cache/dedupe and "Why this story?" trust panel
  - **Status**: Completed
  - **Description**: Added `src/services/fullStoryCache.ts` (cache/dedupe wrapper around the existing `FullStoryService.fetchFullArticleBody`) and `src/hooks/useFullStoryEnrichment.ts`, refactoring ArticleScreen's inline enrichment effect. Added `ArticleProvenance` to `Article`, populated at feed-normalize time, and a new "Why this story?" action opening a `BlurSheet`-based `ArticleProvenancePanel` with factual, non-personalized source/category/publish-time/inclusion-reason/last-refresh copy.
  - **Effort**: 4 hours
  - **Definition of Done**: New `fullStoryCache.test.ts` and `useFullStoryEnrichment.test.ts` pass; `ArticleScreen.test.tsx` covers the trust panel trigger with and without provenance set.
  - **Dependencies**: TODO-043

---

## Full App Audit Fixes (August 8, 2026)

A six-domain external-best-practices audit (OWASP Mobile Top 10, WCAG 2.2 AA, Apple HIG, App
Store Review Guidelines, React Native/Expo official docs) produced 50 findings; the following
items are the eight highest-priority fixes from that report. Numbered as a new block (TODO-101+)
rather than continuing sequentially from TODO-045, to keep this batch of work visually distinct
in history — commit messages reference these same IDs.

- [x] **TODO-101** | **v1.4.3** | Add real account deletion for local profiles
  - **Status**: Completed
  - **Description**: Added `ProfileContext.deleteActiveProfile()` (App Store Guideline 5.1.1(v) — "Delete local data" previously just showed a "Coming soon" alert). Removes the profile plus its own saved-articles/reading-progress storage keys, falls back to another local profile or a fresh anonymous one. Global settings and the sensitive-content log are intentionally untouched.
  - **Effort**: 2 hours
  - **Definition of Done**: New `ProfileContext.test.tsx`/`ProfileScreen.test.tsx` cases pass; `npx tsc --noEmit` clean.
  - **Dependencies**: None
  - **Completed**: August 8, 2026

- [x] **TODO-102** | **v1.4.3** | Reconcile RSS compliance doc with FullStoryService behavior
  - **Status**: Completed
  - **Description**: `docs/compliance/rss_content_audit.md` claimed the app never scrapes HTML or displays full articles, contradicting `FullStoryService.ts`'s actual full-article extraction (Abridged Reader). Rewrote the affected sections to describe real behavior with an updated risk assessment, rather than scaling the feature back.
  - **Effort**: 1 hour
  - **Definition of Done**: `npm run lint:docs` passes.
  - **Dependencies**: None
  - **Completed**: August 8, 2026

- [x] **TODO-103** | **v1.4.3** | Move Perplexity API key to expo-secure-store
  - **Status**: Completed
  - **Description**: The user-supplied Perplexity API key was stored in plaintext AsyncStorage (billing exposure if leaked). Added `src/shared/settings/secureApiKeyStorage.ts` with a one-time migration from any legacy plaintext value.
  - **Effort**: 2 hours
  - **Definition of Done**: New `secureApiKeyStorage.test.ts` passes; `SettingsProvider.test.tsx`/`AiService.test.ts` updated for the new storage path.
  - **Dependencies**: None
  - **Completed**: August 8, 2026

- [x] **TODO-104** | **v1.4.3** | Add VoiceOver support to the tab bar
  - **Status**: Completed
  - **Description**: The custom `LiquidTabBar` had no accessibility role/label/state — with labels hidden, VoiceOver had nothing to announce for primary navigation. Added `accessibilityRole="tab"`, `accessibilityLabel`, `accessibilityState` unconditionally.
  - **Effort**: 0.5 hours
  - **Definition of Done**: `npx tsc --noEmit` clean.
  - **Dependencies**: None
  - **Completed**: August 8, 2026

- [x] **TODO-105** | **v1.4.3** | Add Reduce Motion support, BlurSheet focus trap, and sensitive-content announcements
  - **Status**: Completed
  - **Description**: Added `src/hooks/useReduceMotion.ts`; branched decorative springs/repeats in `BlurSheet`, `ScaleButton`, and `GroundingOverlay`'s breathing pulse to instant transitions when Reduce Motion is on. Added `accessibilityViewIsModal` to `BlurSheet`. Added `AccessibilityInfo.announceForAccessibility` calls for the sensitive-content warning and grounding breathing cues, since both replace content in place.
  - **Effort**: 3 hours
  - **Definition of Done**: `npx tsc --noEmit` clean; existing `ArticleScreen.test.tsx` still passes.
  - **Dependencies**: None
  - **Completed**: August 8, 2026

- [x] **TODO-106** | **v1.4.3** | Memoize ArticleCard and stabilize list rendering
  - **Status**: Completed
  - **Description**: Wrapped `ArticleCard` in `React.memo` and extracted stable `useCallback` `renderItem`s in Home/Section screens. `SavedScreen` doesn't use `ArticleCard` — extracted its own bespoke row into a new `React.memo`-wrapped `SavedResultRow`.
  - **Effort**: 2 hours
  - **Definition of Done**: `ArticleCard.test.tsx`/`HomeScreen.test.tsx`/`SectionScreen.test.tsx`/`SavedScreen.test.tsx` pass.
  - **Dependencies**: None
  - **Completed**: August 8, 2026

- [x] **TODO-107** | **v1.4.3** | Adopt consistent error logging in SettingsContext
  - **Status**: Completed
  - **Description**: Swept ~56 near-identical `console.error("Failed to X", e)` catch blocks to a shared `logSettingError(action, error)` helper — message-consistency only, no behavior change.
  - **Effort**: 1 hour
  - **Definition of Done**: `npx tsc --noEmit` clean; no test asserted on the old message shape.
  - **Dependencies**: None
  - **Completed**: August 8, 2026

---

## Reader-First Quality Sweep (August 25, 2026)

A follow-up pass fixing UI elements that looked functional but weren't (a fake Apple Sign-In
button, a "Quiet Hours" toggle with no notification system to suppress), plus real bugs in
article parsing and the bottom tab bar. Numbered starting at TODO-115 — TODO-108 through
TODO-112 were already used by the Fraunces/serif-typeface work (see `e85fd96`/`61bb41e`).

- [x] **TODO-115** | **v1.5.0** | Wire up real Apple Sign-In
  - **Status**: Completed
  - **Description**: `SignInWithApple.tsx` previously showed a "Coming soon" alert despite `expo-apple-authentication` being installed and the `com.apple.developer.applesignin` entitlement already present in `app.json`. Rewrote it to use Apple's own `AppleAuthenticationButton`, gated by `isAvailableAsync()`, silent on user-cancel. `ProfileScreen`'s Apple Account section is now state-aware (shows Connected/Local-only correctly).
  - **Effort**: 2 hours
  - **Definition of Done**: New `SignInWithApple.test.tsx` passes; `npx tsc --noEmit` clean.
  - **Dependencies**: None
  - **Completed**: August 25, 2026

- [x] **TODO-116** | **v1.5.0** | Redesign the Profile screen
  - **Status**: Completed
  - **Description**: Destructive "Delete local data" now uses `GlassButton`'s existing `destructive` prop instead of looking like a neutral action. Added a `Skeleton` loading state instead of "—" placeholders. Added inline "Saved" feedback after the profile-label field blurs. Split the overloaded "Account & backup" card into Sign in / Backup & transfer / Danger zone. Avatar now shows initials on a profile-derived color (`src/utils/avatar.ts`) instead of a generic icon.
  - **Effort**: 3 hours
  - **Definition of Done**: `ProfileScreen.test.tsx` passes; `npx tsc --noEmit` clean.
  - **Dependencies**: TODO-115
  - **Completed**: August 25, 2026

- [x] **TODO-117** | **v1.5.0** | Extract and display author bylines
  - **Status**: Completed
  - **Description**: No author field existed anywhere in the app. Added `author?: string` to the `Article` type; `parser.ts` now extracts `dc:creator`, RSS `<author>` (including the "email (Name)" convention), and Atom `<author><name>`. `FullStoryService.ts` scrapes a byline from the full article page as a fallback when the feed has none, threaded through `fullStoryCache` → `useFullStoryEnrichment` → `ArticleScreen`. Rendered in both `ArticleCard` and `ArticleScreen` when present.
  - **Effort**: 2.5 hours
  - **Definition of Done**: New author-extraction tests in `parser.test.ts`, `useFullStoryEnrichment.test.ts`; `npx tsc --noEmit` clean.
  - **Dependencies**: None
  - **Completed**: August 25, 2026

- [x] **TODO-118** | **v1.5.0** | Fix photo parsing and rendering bugs
  - **Status**: Completed
  - **Description**: New `ArticleBodyImage.tsx` sizes in-article images by their true aspect ratio instead of a hard-cropped 300px band, with a visible "Image unavailable" fallback instead of a blank box on load failure (same fallback added to `ArticleCard`'s thumbnail). `parser.ts` now picks the image with the largest declared width when feeds report one, instead of "whichever source resolves first" — a low-res `enclosure` icon no longer beats a full-size `media:content` photo. Caption/credit detection widened to catch "AP Photo", "Getty Images", "Photo courtesy", etc.
  - **Effort**: 3 hours
  - **Definition of Done**: New `ArticleBodyImage.test.tsx`, `ArticleCard.test.tsx` cases; `npx tsc --noEmit` clean.
  - **Dependencies**: None
  - **Completed**: August 25, 2026

- [x] **TODO-119** | **v1.5.0** | Fix HTML entity decoding and summary truncation
  - **Status**: Completed
  - **Description**: `sanitizeText` (feed parsing) and `decodeEntities` (full-content rendering) each hand-maintained their own drifting entity list, leaking literal `&eacute;`/`&#8217;`-style text on some sources. Unified into a shared `src/utils/htmlEntities.ts` with real numeric-entity decoding. Article summaries now truncate at a word boundary instead of mid-word/mid-sentence. Removed `extractParagraphsFromHtml`, dead code never wired into rendering.
  - **Effort**: 1.5 hours
  - **Definition of Done**: New `htmlEntities.test.ts`; `parser.test.ts` truncation cases; `npx tsc --noEmit` clean.
  - **Dependencies**: None
  - **Completed**: August 25, 2026

- [x] **TODO-120** | **v1.5.0** | Fix tab bar badge anchoring and add Reduce Transparency support
  - **Status**: Completed
  - **Description**: The "Saved" tab badge was positioned with fixed pixel offsets from the tab button's edge rather than the icon itself, drifting off-center whenever tab width, icon size, or label visibility changed. Now anchored to a wrapper that hugs the icon's actual size. Added `reduceTransparency` to `SettingsContext`, backed by `AccessibilityInfo.isReduceTransparencyEnabled()` — `LiquidTabBar` now forces its blur off and background fully opaque when that system setting is on, regardless of the in-app blur preference (previously ignored entirely).
  - **Effort**: 1.5 hours
  - **Definition of Done**: `npx tsc --noEmit` clean; full suite (172 tests) passes.
  - **Dependencies**: None
  - **Completed**: August 25, 2026

- [x] **TODO-121** | **v1.5.0** | Remove unused `rss-parser` dependency
  - **Status**: Completed
  - **Description**: Listed in `package.json` with zero usages anywhere in `src/` — the actual feed pipeline uses `fast-xml-parser`. Removed via `npm uninstall`.
  - **Effort**: 0.1 hours
  - **Definition of Done**: `npx tsc --noEmit` clean.
  - **Dependencies**: None
  - **Completed**: August 25, 2026

---

### Reachability, feeds, and onboarding (September 2026)

Numbered from TODO-122; TODO-121 was taken by the v1.5.0 `rss-parser` removal above. This batch
came out of an audit that started as a backlog groom and turned up shipped content readers could
not reach, settings that did nothing, and an upgrade flow that treated returning readers as new.

- [x] **TODO-122** | **v1.5.5** | Make every category reachable
  - **Status**: Completed
  - **Description**: `HomeScreen` is hardcoded to `useCategoryFeed("Top")` and both tab layouts pointed `SectionScreen` at `category: "Local"`, so Business, Sports and Culture were fetched only by `AiService` for the digest and had no browsable entry point. Added a category picker over `getAllCategories()`, rendered in the skeleton, error and empty branches too so a failing category isn't a trap. `useCategoryFeed` now clears the previous category's articles on switch, seeding from cache, so stories never render under the wrong heading. Discover's search icon became a compass; five phantom `TabParamList` entries no `ArticleCategory` ever had were deleted.
  - **Definition of Done**: `npx tsc --noEmit` clean; suite green.
  - **Completed**: September 5, 2026

- [x] **TODO-123** | **v1.5.5** | Restore the feed source list against a live probe
  - **Status**: Completed
  - **Description**: Probed all 28 configured feeds; 12 returned items. WESA was never broken — its feeds are at `<section>.rss`, not `<section>/rss`. Added seven verified news-outlet sources, removed eight dead domains, rewrote every health note with a date and the real failure mode (bot-block vs. empty feed vs. dead domain, which the old blanket "Non-feed response" conflated). Enabled sources 12 → 19; Culture 1 → 5, closing ADR-0005's open follow-up. Added `npm run audit:feeds` and a config-guard test that fails if any category drops below two enabled sources.
  - **Definition of Done**: `npm run audit:feeds` reports all enabled sources healthy; suite green.
  - **Completed**: September 5, 2026

- [x] **TODO-124** | **v1.5.5** | Report empty feeds honestly
  - **Status**: Completed
  - **Description**: `repository.ts` returned `{ snapshot: null, failure: null }` for a feed that parsed but carried no items — invisible to every caller, so the category silently shrank instead of surfacing cached-state and retry messaging. TribLive's section feeds are exactly this shape. Closes the long-open "feed failures surface honest error states instead of silent empty success" acceptance criterion.
  - **Completed**: September 5, 2026

- [x] **TODO-125** | **v1.5.5** | Parse image captions and photo credits
  - **Status**: Completed
  - **Description**: The hero image carried no caption or credit despite media RSS providing `media:description`/`media:title`/`media:credit`; body images only picked up `<figure><figcaption>`, missing the WordPress `wp-caption` markup most of these publishers emit; credits arriving as their own paragraph rendered as stranded body copy; and figcaption text skipped the entity decoding every other text path applied. New `src/utils/photoCredit.ts` owns the heuristics (replacing a copy inside `ArticleScreen`) and splits "Caption. (Photo: Jane Doe/AP)" into its two halves.
  - **Completed**: September 5, 2026

- [x] **TODO-126** | **v1.5.5** | Make settings controls do what they say, or remove them
  - **Status**: Completed
  - **Description**: The reading-speed slider had no effect — `AbridgedReader` held a local `useState(300)` and never read `readingSpeed`. `APP_BUILD` was pinned at "1" while app.json shipped 36, so bug reports named the wrong build. Quiet Hours suppressed notifications in an app with no notification system; the Welcome Back Digest toggle was read by nothing. The iOS 26 demo screen was registered in production builds. Sources settings explained how to add custom feeds directly under a card saying custom feeds were coming soon.
  - **Completed**: September 5, 2026

- [x] **TODO-127** | **v1.5.5** | Rebuild onboarding and fix the What's New flow
  - **Status**: Completed
  - **Description**: `RootNavigator` passed `startSlideId: "whats-new"`, no slide had that id, and unknown ids were silently ignored — every returning reader got the full first-run flow. Now branches on the `mode` param that existed for this and was never read, calling `markVersionSeen` rather than re-running onboarding completion. First run rebuilt around four slides that each do something, including a new one introducing the sections TODO-122 made reachable. Settings → About's two onboarding links pointed at slide ids that have never existed.
  - **Completed**: September 5, 2026

- [x] **TODO-128** | **v1.5.5** | Reader-facing release notes
  - **Status**: Completed
  - **Description**: `src/config/releaseNotes.ts`, shown in What's New and reachable from Settings → About. Deliberately separate from CHANGELOG.md, which is engineer-facing. A version with no entry falls back to a generic card rather than blocking a release; the release process doc now asks for an entry per release.
  - **Completed**: September 5, 2026

- [x] **TODO-129** | **v1.5.5** | One glass surface, and shared list helpers
  - **Status**: Completed
  - **Description**: `reduceTransparency` shipped in 1.5.0 honored by the tab bar alone; the other five glass surfaces each inlined their own `BlurView` with their own intensity and hardcoded fallback and checked nothing. All now route through `GlassSurface`. `GlassStackHeader` was wired in for the first time, replacing the stock header on all 14 stack screens. Also deduped three identical copies of `formatUpdatedAgo` and two of `FeedStatusBanner`.
  - **Completed**: September 5, 2026

- [x] **TODO-130** | **v1.5.5** | Accessibility pass: VoiceOver, Dynamic Type, touch targets
  - **Status**: Completed
  - **Description**: `ArticleCard` had zero accessibility props, so the most-tapped element in the app announced as six loose text fragments and no control. Settings screens hand-built toggle rows as unassociated text beside a bare `Switch` — `TabBarSettingsScreen` alone had 40 controls and no accessibility props. Shared `SettingsToggleRow`/`SettingsDisclosureRow` now make the whole row the control; 25 option pills report selected state; pull-to-refresh announces its result; screen titles carry a header role; `theme/typography.ts` carries a written Dynamic Type policy rather than per-file magic numbers.
  - **Completed**: September 5, 2026

- [x] **TODO-131** | **v1.5.5** | Tap an article photo to open it full screen
  - **Status**: Completed
  - **Description**: `ZoomModal` existed and was used only by the dev-only demo screen. In-article images are now image buttons that open it, and the viewer mounts only while open rather than keeping a Modal alive per image.
  - **Completed**: September 5, 2026

- [x] **TODO-132** | **v1.5.5** | Swipe an article card to save it
  - **Status**: Completed
  - **Description**: Saved's empty state has told readers to "swipe left on any article card to save it for later" for releases, while `ArticleCard` carried no gesture handler at all. Added with an action panel that builds as you drag, a haptic on commit, and a pan that only claims the gesture once it is clearly horizontal so list scrolling still wins. Found auditing against Apollo, whose swipe actions were its defining interaction.
  - **Completed**: September 5, 2026

- [x] **TODO-133** | **v1.5.5** | Reopen articles where reading stopped
  - **Status**: Completed
  - **Description**: `ArticleScreen` wrote `scrollPixels` on every scroll and nothing ever read it back — the tracking half of "resume where you left off" shipped, the resuming half did not, so Continue Reading opened articles at the top. `resolveRestoreOffset` waits for a layout tall enough to hold the offset (body text, images and full-story enrichment arrive in stages) and leaves a finished article at its beginning.
  - **Completed**: September 5, 2026

- [x] **TODO-134** | **v1.5.5** | A media viewer that can actually zoom
  - **Status**: Completed
  - **Description**: `ZoomModal` only animated scale 0.1 to 1 as it opened, so TODO-131's tap-to-zoom opened a photo full screen and offered no way to look closer — maps, charts and small print were unreadable. `ZoomableImage` adds pinch, pan while zoomed, double-tap to toggle, and a drag-down flick to dismiss. Apollo's media viewer was the most praised thing about it; this is the part worth having in a reader.
  - **Completed**: September 5, 2026



---

## 📋 Version Roadmap

### 🚀 v1.1.0 (Current) — Build & Branding Complete

- [x] **TODO-001** | **v1.1.0** | Fix app icon loading regression
  - **Status**: ✅ Completed
  - **Description**: Regenerated native iOS/Android folders via prebuild to resolve icon display issue
  - **Effort**: 1 hour

- [x] **TODO-002** | **v1.1.0** | Rebrand app to "Abridgd"
  - **Status**: ✅ Completed
  - **Description**: Updated app.json display name, created branding standards doc, updated all screens/components
  - **Effort**: 2 hours

- [x] **TODO-003** | **v1.1.0** | Update bundle ID to com.mccalmedia.abridged
  - **Status**: ✅ Completed
  - **Description**: Changed iOS bundle ID, fixed EAS sandbox permissions, created .easignore
  - **Effort**: 1.5 hours

- [x] **TODO-004** | **v1.1.0** | Create What's New onboarding screen
  - **Status**: ✅ Completed
  - **Description**: WhatsNewScreen.tsx with 4 dismissible feature cards, linked in Settings
  - **Effort**: 2 hours
  - **Dependencies**: None

---

### 🔄 v1.2.0 (Next Release) — Enhanced Features & UX

- [ ] **TODO-005** | **v1.2.0** | Implement version tracking for auto-show What's New
  - **Status**: 🔜 Not Started
  - **Description**: Track last viewed version in AsyncStorage, auto-show What's New on version bump
  - **Effort**: 1.5 hours
  - **Definition of Done**: What's New screen appears automatically after app update, can be dismissed
  - **Dependencies**: TODO-004

- [ ] **TODO-006** | **v1.2.0** | Add article sharing functionality
  - **Status**: 🔜 Not Started
  - **Description**: Share article via native Share API to social media, messaging apps
  - **Effort**: 2 hours
  - **Definition of Done**: Share button on ArticleScreen, works on iOS/Android
  - **Dependencies**: None

- [ ] **TODO-007** | **v1.2.0** | Improve article search/filtering
  - **Status**: 🔜 Not Started
  - **Description**: Add search bar to HomeScreen, filter by source/topic/date
  - **Effort**: 2.5 hours
  - **Definition of Done**: Search works across all loaded articles, filters persist across sessions
  - **Dependencies**: SavedArticlesContext

- [ ] **TODO-008** | **v1.2.0** | Add offline reading support
  - **Status**: 🔜 Not Started
  - **Description**: Cache recent articles, allow reading saved articles without network
  - **Effort**: 3 hours
  - **Definition of Done**: Offline badge shows when no connectivity, cached articles display normally
  - **Dependencies**: SavedArticlesContext

---

### ✨ v1.3.0 & Beyond — Advanced Features & Community

- [ ] **TODO-009** | **v1.3.0** | Implement user preferences/reading history
  - **Status**: 🔜 Not Started
  - **Description**: Track reading history, personalize recommendations based on interests
  - **Effort**: 3 hours
  - **Definition of Done**: History persists across sessions, can be cleared from Settings
  - **Dependencies**: ProfileContext

- [ ] **TODO-010** | **v1.3.0** | Add dark mode support
  - **Status**: 🔜 Not Started
  - **Description**: System theme detection, manual override in Settings, persist preference
  - **Effort**: 2.5 hours
  - **Definition of Done**: Dark theme applies app-wide, respects system preference, can override manually
  - **Dependencies**: SettingsContext

- [ ] **TODO-011** | **v1.3.0** | Create digest customization screen
  - **Status**: 🔜 Not Started
  - **Description**: Allow users to customize digest frequency, topics, delivery time
  - **Effort**: 2.5 hours
  - **Definition of Done**: Digest settings persist, can enable/disable per topic
  - **Dependencies**: SettingsContext, DigestScreen

- [ ] **TODO-012** | **Superseded** | Add push notifications for breaking news
  - **Status**: 🔁 Superseded — see the "Reader-First Quality Sweep" Phase 2 replan below (not yet ticketed under a TODO-1xx id)
  - **Description**: Originally scoped as opt-in breaking-news alerts at a 3-hour estimate. That estimate assumed client-only work; the app has no backend at all (RSS fetching is 100% on-device), so real push needs a new server-side poller plus EAS push credentials. The "breaking news" framing also cuts against this app's own stated "Calm — no distracting notifications" positioning (docs/product/vision.md, docs/product/FEATURES.md). Replanned as a gentler, opt-in "today's digest is ready" notification backed by a new dedicated Supabase project, scoped as its own effort rather than a quick add-on.
  - **Effort**: ~~3 hours~~ — see replan (backend + app work, multi-session effort)
  - **Definition of Done**: N/A — tracked going forward under the Phase 2 plan
  - **Dependencies**: None

- [ ] **TODO-013** | **v1.3.0** | Implement article source management
  - **Status**: 🔜 Not Started
  - **Description**: Add/remove news sources, manage feed sources from Settings
  - **Effort**: 2 hours
  - **Definition of Done**: Users can toggle sources on/off, UI updates dynamically
  - **Dependencies**: feedConfig.ts

---

- [x] **TODO-028** | **v1.3.0** | Add production-ready API client PoC + AuthService
  - **Status**: ✅ Completed
  - **Description**: Expand `src/shared/api` with retries/backoff, auth header injection + refresh flow, error mapping, unit tests, and an example screen `ApiDemoScreen`. Add docs (`docs/development/api-client.md`) and update developer docs for usage.
  - **Effort**: 2 hours
  - **Definition of Done**: Unit tests passing, docs added, example screen present, PR template updated to require dependency checklist for any new deps


### 📱 UI & Design Improvements (Backlog)

- [ ] **TODO-014** | **Backlog** | Refactor screen styling consistency
  - **Status**: 🔜 Not Started
  - **Description**: Standardize spacing, colors, typography across all screens
  - **Effort**: 3 hours
  - **Dependencies**: None

- [ ] **TODO-015** | **Backlog** | Add smooth screen transitions
  - **Status**: 🔜 Not Started
  - **Description**: Implement consistent navigation animations between screens
  - **Effort**: 2 hours
  - **Dependencies**: React Navigation config

- [ ] **TODO-016** | **Backlog** | Improve loading states and skeletons
  - **Status**: 🔜 Not Started
  - **Description**: Add skeleton loading screens for articles, smoother perceived performance
  - **Effort**: 2.5 hours
  - **Dependencies**: ArticleScreen, HomeScreen

- [ ] **TODO-017** | **Backlog** | Polish error states and fallback UI
  - **Status**: 🔜 Not Started
  - **Description**: Improve error messages, add retry buttons, empty state illustrations
  - **Effort**: 2 hours
  - **Dependencies**: ErrorBoundary

---

### 🔧 Testing & Quality (Backlog)

- [ ] **TODO-018** | **Backlog** | Expand Jest test coverage
  - **Status**: 🔜 Not Started
  - **Description**: Add tests for all screens, services, and context providers
  - **Effort**: 5 hours
  - **Definition of Done**: Coverage >80%, all critical paths tested
  - **Dependencies**: Jest config

- [ ] **TODO-019** | **Backlog** | Set up E2E testing with Detox
  - **Status**: 🔜 Not Started
  - **Description**: Add automated mobile app testing for critical user flows
  - **Effort**: 4 hours
  - **Definition of Done**: E2E tests run in CI, cover main navigation and article reading
  - **Dependencies**: None

- [ ] **TODO-020** | **Backlog** | Add performance monitoring
  - **Status**: 🔜 Not Started
  - **Description**: Integrate performance telemetry, track render times and memory usage
  - **Effort**: 2.5 hours
  - **Dependencies**: None

---

### 🌐 Platform Expansion (Backlog)

- [ ] **TODO-021** | **Backlog** | Deploy to Google Play Store
  - **Status**: 🔜 Not Started
  - **Description**: Set up Play Store listing, certificates, and automated deployment
  - **Effort**: 3 hours
  - **Definition of Done**: App available on Play Store, auto-deploys from CI
  - **Dependencies**: None

- [ ] **TODO-022** | **Backlog** | Set up analytics and crash reporting
  - **Status**: 🔜 Not Started
  - **Description**: Integrate Sentry for crash reports, track user engagement metrics
  - **Effort**: 2.5 hours
  - **Dependencies**: None

- [ ] **TODO-023** | **Backlog** | Create web companion dashboard
  - **Status**: 🔜 Not Started
  - **Description**: Web version allowing account sync, article browsing, digest customization
  - **Effort**: 8+ hours
  - **Dependencies**: Backend API

---

### 💬 Advanced Features & Community (Backlog)

- [ ] **TODO-026** | **v1.4.0+** | Add note-taking on articles
  - **Status**: 🔜 Not Started
  - **Description**: Allow users to highlight text and add notes within articles
  - **Effort**: 3.5 hours
  - **Definition of Done**: Notes persist per article, can export notes
  - **Dependencies**: SavedArticlesContext

- [ ] **TODO-027** | **v1.4.0+** | Enable article comments & discussion
  - **Status**: 🔜 Not Started
  - **Description**: Community comments section below each article, threaded discussions
  - **Effort**: 5 hours
  - **Definition of Done**: Comments load, users can post, moderation tools available
  - **Dependencies**: Backend API

- [ ] **TODO-028** | **v1.4.0+** | Add calendar invite generation
  - **Status**: 🔜 Not Started
  - **Description**: Create calendar events from news items (conferences, launches, deadlines)
  - **Effort**: 2.5 hours
  - **Definition of Done**: Calendar integration with iOS/Android native calendar apps
  - **Dependencies**: None

- [ ] **TODO-029** | **v1.4.0+** | Create community events tab
  - **Status**: 🔜 Not Started
  - **Description**: Community-submitted events, RSVPs, local news aggregation
  - **Effort**: 4 hours
  - **Definition of Done**: Events tab shows community events with RSVP capability
  - **Dependencies**: Backend API

- [ ] **TODO-030** | **v1.4.0+** | Build attendee management for events
  - **Status**: 🔜 Not Started
  - **Description**: Track event attendance, attendance checks, post-event feedback
  - **Effort**: 3.5 hours
  - **Definition of Done**: Event organizers can manage attendee lists, send updates
  - **Dependencies**: Backend API, TODO-029

---

## 📊 Progress Overview

| Version | Total Tasks | Completed | In Progress | Remaining |
|---------|------------|-----------|------------|-----------|
| v1.1.0  | 4          | 4         | 0          | 0         |
| v1.2.0  | 4          | 0         | 0          | 4         |
| v1.3.0  | 5          | 0         | 0          | 5         |
| v1.4.0+ | 5          | 0         | 0          | 5         |
| Backlog | 12         | 0         | 0          | 12        |
| **Total** | **30**    | **4**     | **0**      | **26**    |

---

## 🎯 Current Focus (v1.3.1)

### Active Tasks

1. Merge the completed audit-fix branches in order
2. Run iOS and Android smoke validation for the audit fixes

### Definition of Done (Audit Fixes)

This sprint is considered complete only when:
- [ ] All audit branches land with passing tests and type-checks
- [x] Feed failures surface honest error states instead of silent empty success (TODO-124)
- [ ] Features validated on iOS and Android
- [ ] CHANGELOG updated with all v1.2.0 entries
- [ ] ACHIEVED.md documents completion

---

## 📝 How to Add Tasks

When adding a new task:

1. **Add to appropriate version section**
2. **Format**: `- [ ] **TODO-XXX** | **vX.Y.Z** | Task Title`
3. **Include metadata**:
   - Status (🔜 Not Started / 🔄 In Progress / ✅ Completed)
   - Description
   - Effort estimate (hours)
   - Dependencies (if any)
   - Definition of Done (for major features)
4. **Update ACHIEVED.md when completed**
5. **Update CHANGELOG.md with version entry**

---

## 💾 Commit Format

When working on tasks, use:

```
[TODO-XXX] Task Title

- Added/Fixed/Implemented description
- References vX.Y.Z release target
```

Example:
```
[TODO-005] Version tracking for auto-show What's New

- Added version storage in AsyncStorage
- Tracks lastViewedVersion and compares to app.json version
- Auto-shows WhatsNewScreen on version mismatch
- Closes TODO-005 for v1.2.0
```
