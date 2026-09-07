# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [Unreleased]

## [1.5.7] - 2026-09-07

### Fixed
- In-article images with relative or inline sources never loaded. The URL normalizer prefixed anything not starting with "http" with "https:", turning `/images/a.jpg` into `https:/images/a.jpg` and mangling `data:` URIs — both rendered as the "Image unavailable" placeholder. Relative paths now resolve against the article's own origin, which is what the publisher meant. (TODO-139)
- Article links from feeds are opened only when they use `http` or `https`. `Linking.openURL` was handed the `<link>` value straight out of third-party RSS, so a hostile or compromised feed could supply `tel:`, `sms:`, or another app's custom scheme and iOS would act on it. (TODO-138)
- The photo viewer had no way out that wasn't a gesture. Its only dismissal was a backdrop tap, and the image added this release covers most of it — but the decisive part is that drag-to-dismiss is not an action VoiceOver can perform, so a screen-reader user had no way to close the viewer at all. There is a labelled Close button now. (TODO-138)
- Body paragraphs were being deleted from articles. The photo-credit heuristic had no length bound on its leading patterns, so a paragraph opening "Courtesy of the Heinz History Center, the exhibit will run through..." was folded into the preceding image as its credit and dropped from the article entirely. Explicit attribution phrases are now bounded at 120 characters and bare wire-service names — which legitimately open sentences — at 60. (TODO-137)
- Pull-to-refresh announced the wrong outcome to VoiceOver. It read `articles` and `error` from the handler's render closure after awaiting the refresh, so those still held pre-refresh values: a failed refresh announced "12 stories loaded". `refresh()` now returns what it actually did. (TODO-137)
- A category where every source is genuinely quiet showed a network error with a Retry button that could not help. Empty-but-valid feeds are still recorded as failures so they cannot pass as silent successes, but they no longer count toward the error state — that case is "You're caught up". (TODO-137)
- A latent crash in the new swipe and zoom gestures. Both called a plain component-scope helper from inside Reanimated gesture callbacks, which run on the UI thread — calling a non-worklet there throws at runtime, so it type-checked, passed tests, and would have failed the first time a finger touched the screen. Present in build 37. (TODO-135)
- The Abridged reader recreated its word timer five times a second. The effect re-runs per word (each word's length adjusts its own display time), so `setInterval` was torn down and rebuilt every tick and never actually repeated; it is a `setTimeout` now, which is what it always was. (TODO-135)
- Leaving an article within half a second of finishing it fired the reader's completion handler — which saves the article and writes progress — against an unmounted component. Closing the grounding overlay mid-breath did the same with its phase timers. Both are cleaned up now. (TODO-135)
- Dropped two `console.log` calls from the full-story fetch path, which logged the URL of every article opened. (TODO-135)

### Changed
- Removed `EXPO_PUBLIC_PERPLEXITY_API_KEY` from `.env`. The key lives in `expo-secure-store` and nothing reads the environment variable, so it was never bundled — but `EXPO_PUBLIC_*` values are inlined wherever they are referenced, so leaving it there meant one added reference would ship it inside the IPA. (TODO-139)
- The feed config's https guard now covers disabled sources too, and the one remaining `http://` URL was switched. A disabled source is a candidate for re-enabling, and ATS would block it the moment it was. (TODO-139)
- Jest no longer scans git worktrees under `.claude/`, which were adding another branch's copy of every test file to local runs. (TODO-139)
- Performance pass on the feed and article surfaces. `SavedArticlesContext` rebuilt its functions and value object every render, and every article card now subscribes to it for swipe-to-save, so a feed of cards all lost memoization together; `isArticleSaved` scanned the saved array linearly per card per render; `useCategoryFeed` re-merged and re-sorted the whole category cache on every render for a value only its state initializers use; `ArticleBodyImage` fetched each photo twice, once to measure and once to render; and the three article feeds ran on FlatList's default windowing, which is tuned for short lists rather than 25-30 image-bearing cards. `removeClippedSubviews` was considered and left out: it is the one windowing option React Native documents as able to drop content, and these cards carry shadows and an absolutely-positioned swipe panel. (TODO-136)

## [1.5.6] - 2026-09-06

First release with Android builds alongside iOS.

### Added
- Android support. The app now builds and runs on Android, distributed as an APK while the Play Store listing is in progress.
- **News Sources** is now its own entry in Settings, rather than being buried inside Reading Experience.
- Saved shows how many articles you have in the header — and how many the current filters match, so the number always agrees with the list.
- Over-the-air updates, so feed fixes can reach you in minutes instead of waiting on a store review.
- Crash reporting is now actually running. It never was before, which meant every crash since launch went unrecorded.

### Changed
- The onboarding "Make It Yours" screen now works. Grounding, haptics, reader focus and reading speed were drawn as controls but did nothing; they are real settings now, and what you choose there is what the app opens with.
- Tab Bar settings are considerably simpler. Heights, indicator styles, badge styles and icon size are gone, along with the preset picker. The preview at the top now shows your actual tabs in your actual order, which it did not before.
- Reordering tabs uses up and down arrows instead of a hidden long-press, and they are labelled for screen readers.
- Settings screens no longer print their title twice.

### Fixed
- **Articles would not scroll on Android.** A swipe gesture was intercepting vertical drags before the article could scroll.
- Roughly 118pt of empty space at the top of Home, Saved and Section, from safe-area padding being applied twice.
- Content hidden behind the tab bar, from a default height that disagreed with the bar's real height.
- Missing article thumbnails from several sources, whose images are published as relative links that were never resolved.
- Tracking pixels and share icons rendering as full-width images at the end of articles.
- Compressed images showing a crop of the middle of the photo instead of the photo.
- Saved articles and reading progress silently detaching from articles on refresh.
- Articles from sources with unusual date formats pinning themselves above everything else in the feed.
- A "showing cached stories" notice that never cleared once a source went down.
- The tab bar highlight being sized to the whole tab rather than the icon.
- The post-article feedback prompt ignoring the Android back button.
- Needing two taps for any button below a text field on Android.
- Monospaced text not being monospaced on Android, and haptics not firing there at all.
- The tab bar rendering a light blur over a dark interface on Android.

### Security
- Links from feeds are now checked before opening. Only web addresses are followed.

## [1.5.5] - 2026-09-05

_Built as iOS build 37 and never distributed: a crash in the new gesture code was found before it
went anywhere. The fixes, and everything below, ship as 1.5.7 instead — 1.5.6 was taken by the
Android release that landed from master in the meantime._

### Added
- Swipe left on any article card to save or unsave it, with the action panel building as you drag and a haptic when it commits. Saved's empty state has instructed readers to do this since long before any gesture existed on a card. (TODO-132)
- Articles reopen where you stopped reading. `scrollPixels` was written on every scroll and never read back, so Continue Reading took you to the story and dropped you at the top. A finished article still starts at the beginning. (TODO-133)
- Tap any in-article photo to open it full screen, then pinch, double-tap or drag to examine it, and flick down to close. `ZoomModal` was built for this and used only by the demo screen, so a reading app had no way to look closely at a photo — and the modal itself only animated its scale on open, so "zoomed" meant "full screen and no closer". The viewer mounts only while open, rather than keeping a Modal alive per image. (TODO-131, TODO-134)
- A documented Dynamic Type policy in `theme/typography.ts`. React Native already scales text with the system setting, so the risk was unbounded scaling breaking layout, not missing support: reading content stays uncapped, while chrome that sits beside a control or must hold one line (tab labels, badges, card meta rows, settings row labels) is capped generously rather than left to reach iOS's ~300%. (TODO-130)
- Every category is now reachable. Business, Sports, and Culture were fetched only for the daily digest — Home is hardcoded to "Top" and both tab layouts pointed the section screen at "Local" — so three of five categories had no browsable entry point. The section screen now has a category picker across all five, rendered in the empty and error states too so a failing category isn't a dead end. (TODO-122)
- Image captions and photo credits are parsed from feeds. The hero image carried neither despite media RSS providing `media:description`/`media:title`/`media:credit`, and body images only picked up captions from `<figure><figcaption>`, missing the WordPress `wp-caption` markup most of these publishers actually emit. Credits that arrive as their own paragraph are now attached to the image above them instead of rendering as stranded body copy. (TODO-125)
- `npm run audit:feeds` re-probes every configured feed with the app's own fetch headers and fails only when an enabled source is unhealthy. Manual by design — third-party feed flakiness in PR CI would redden builds for reasons unrelated to the diff. (TODO-123)
- `src/config/releaseNotes.ts`: reader-facing release notes, shown in What's New and linked from Settings → About. Separate from this changelog, which is written for engineers. (TODO-128)

### Changed
- Rebuilt the RSS source list against a live probe of all 28 configured feeds, which found 12 returning items. WESA was never broken — its feeds live at `<section>.rss`, not `<section>/rss`. Added seven verified news-outlet sources (Post-Gazette A&E and Sports, Pittsburgh Union Progress, The Allegheny Front, WQED, Table Magazine), removed eight dead domains, and rewrote every health note with a date and the real failure mode. Enabled sources 12 → 19; Culture 1 → 5. (TODO-123)
- Rebuilt onboarding around four slides that each do something: the brief, the five sections (new — nothing told readers sections existed), the reader demo, and the grounding choice. Dropped the settings-preview slide, which showed a picture of settings and changed nothing, and the trust slide, whose three points are now a line under the final action. (TODO-127)
- The "Discover" tab's magnifying-glass icon is now a compass. It browses; it never searched.
- All 14 stack screens now use `GlassStackHeader`, which was built for exactly this and wired into nothing, leaving every screen on the stock header. (TODO-129)
- Deduplicated three byte-identical copies of `formatUpdatedAgo` (Home, Section, Saved) and two of `FeedStatusBanner` (Home, Section) into shared modules. (TODO-129)
- Sources settings explained how to add custom feeds directly beneath a card saying custom feeds were coming soon. Replaced with copy about what the toggles actually do.

### Fixed
- Pull-to-refresh was silent for screen-reader users on Home, Section and Saved — the spinner and the changed list are both purely visual. It now announces how many stories loaded, or that the refresh failed and cached stories are still showing. (TODO-130)
- Screen titles now carry a header role, so VoiceOver's rotor can navigate between them. (TODO-130)
- Settings toggles were unreachable by screen reader: every settings screen hand-built its rows as a plain View holding unassociated text next to a bare `Switch`, so VoiceOver read the label and the control as separate items, the description not at all, and only the switch thumb was tappable. Sixteen rows across six screens now use a shared `SettingsToggleRow` where the whole row is the control, announcing label, description and checked state. Another 25 option pills (`TabBarSettingsScreen` alone had 40 controls and zero accessibility props) now report their selected state. (TODO-130)
- Sources settings showed the same "Temporarily disabled while the feed is down" line for every unavailable source. It now shows that source's own dated health note, so a bot-block and a dead domain read differently. (TODO-130)
- Article cards were invisible to VoiceOver: no role, no label, so the most-tapped element in the app announced as six unrelated text fragments and no control. Each card is now one button labelled with its headline, source, time and byline. The meta row is also capped against Dynamic Type so it wraps instead of pushing the thumbnail off the card at the largest accessibility sizes. (TODO-130)
- `ScaleButton` applied its accessibility-role default only in the production branch, not the Jest one, so role-based queries could pass in tests and fail on device. (TODO-130)
- Reduce Transparency only worked on the tab bar. Every other glass surface — the stack header, article toolbar, sheets, modals, glass buttons — inlined its own `BlurView` with its own intensity and hardcoded rgba fallback, so the accessibility setting shipped in 1.5.0 was honored by one surface out of six. They now all render through a single `GlassSurface` component that decides blur in one place. (TODO-129)
- What's New never worked. `RootNavigator` passed `startSlideId: "whats-new"`, no slide had that id, and unknown ids were silently ignored — so every returning reader was walked through the full first-run flow, "No account required" included, as if they had never opened the app. It now branches on the `mode` param that existed for this and was never read, and marks the version seen without re-running onboarding completion. (TODO-127)
- The reading-speed slider did nothing. `AbridgedReader` held a local `useState(300)` and never read the saved `readingSpeed`, so the setting had no effect and the reader reset to 300 WPM every time. (TODO-126)
- A feed that parses but returns zero items now reports a failure instead of `{ snapshot: null, failure: null }`, which no caller could see. TribLive's section feeds are exactly this shape, so a category quietly shrank rather than surfacing the cached-state and retry messaging that already existed. (TODO-124)
- Settings → About's two onboarding links passed slide ids (`"whats-new-profile"`, `"practice"`) that have never existed, dropping readers on slide one of onboarding.
- `APP_BUILD` was pinned at `"1"` while app.json shipped build 36, so every bug report named the wrong build. It now reads from `expo-constants`.
- Removed Quiet Hours, which suppressed notifications in an app with no notification system, and the Welcome Back Digest toggle, which nothing read.
- The iOS 26 demo screen and its Debug entry point are now dev-only; the route was registered in production builds.

## [1.5.0] - 2026-08-25

_Note: 1.4.2 and 1.4.3 shipped without their own dated entries — this section is everything
accumulated under "Unreleased" since [1.4.0], not exclusively 1.5.0 work. Going forward, see
[docs/process/release-process.md](docs/process/release-process.md): every release gets its own
dated section._

### Security
- Applied all non-breaking `npm audit` fixes (11 of 50 flagged findings, including 1 critical). The remaining 39 are all in build-time tooling (Metro, EAS CLI, Xcode project generation, Jest) that never ships in the app itself, not runtime app code. Fixing them requires bumping the Expo SDK from 54 to 57 - a major, multi-package upgrade that needs its own dedicated pass with full re-testing, tracked here rather than rushed.
- (2026-08-25) Ran `npm audit fix` again and picked up one more non-breaking patch bump (`ws`/`yaml`/`undici` transitive versions under Metro), bringing the flagged total from 39 to 38. Confirmed the remaining 38 are still exclusively build-time tooling (same Expo SDK 54->57 dependency as above), not app runtime code - no change to the risk assessment or the deferral above.

### Added
- Added a "Why this story?" trust panel on the article screen, showing source, category, publish time, inclusion reason, and last feed refresh time.
- Real Sign in with Apple, using Apple's own `AppleAuthenticationButton` (was a "Coming soon" placeholder). (TODO-115)
- Author bylines: extracted from RSS/Atom feeds (`dc:creator`, `<author>`, Atom `<author><name>`) with an HTML byline-scrape fallback, shown on article cards and the article screen. (TODO-117)
- `reduceTransparency` setting, backed by the OS "Reduce Transparency" accessibility setting — the tab bar's blur now respects it instead of ignoring it entirely. (TODO-120)

### Changed
- Home now presents the feed as a calm Morning Brief with finite catch-up framing, cached-state messaging, and a Today’s Brief section.
- Onboarding now follows a five-slide reader-first welcome flow with app-like previews, one optional grounding choice, and wrap-safe actions for small screens and larger text.
- Refactored the RSS feed pipeline into modular source registry, transport, parser, and repository layers with per-source AsyncStorage caching, replacing the single in-memory category cache.
- Home and Section feeds now show cached stories immediately on launch without a blocking forced refresh, refreshing in the background instead.
- Redesigned the Profile screen: destructive "Delete local data" now styled distinctly, added a loading skeleton and inline save confirmation, split the account card into Sign in / Backup & transfer / Danger zone, initials-based avatar. (TODO-116)
- In-article images now size by their true aspect ratio instead of a fixed 300px crop, and the feed parser picks the image with the largest declared width instead of "whichever source resolves first." (TODO-118)

### Fixed
- Restored the local TypeScript gate by normalizing nullable system color scheme values in ThemeContext.
- Restored the Expo SDK 54 Jest baseline by pinning test-safe winter runtime globals in `jest.setup.js`.
- Disabled 11 RSS sources confirmed broken in a June 2026 health probe (CBS Pittsburgh, New Pittsburgh Courier, The Incline, Pgh Business Times, TribLive Business, TribLive Sports, Penguins, Pirates, Pitt Panthers, City Paper, WESA Arts) so they no longer cause partial feed failures.
- Full-story enrichment on the article screen now caches fetched content and de-duplicates in-flight requests instead of re-fetching on every article view.
- A broken RSS source no longer blanks its whole category — per-source caching preserves other sources' last-known-good stories.
- Broken article images now show a visible "Image unavailable" fallback instead of a blank box; photo-credit detection now catches "AP Photo", "Getty Images", "Photo courtesy", etc. (TODO-118)
- Fixed two independently-drifting HTML entity decoders leaking literal `&eacute;`/`&#8217;`-style text on some sources; summaries now truncate at a word boundary instead of mid-word. (TODO-119)
- The tab bar's "Saved" badge now anchors to the icon's actual layout instead of a fixed pixel offset that drifted with tab width/icon size/label visibility. (TODO-120)
- `appVersionSource` was `"remote"` in `eas.json`, silently ignoring version bumps made in `app.json` — a build shipped labeled 1.4.0 despite the repo saying 1.5.0. Switched to `"local"` and added `npm run version:check` (now part of CI) to catch drift going forward.

### Documentation
- Added missing `Last Updated` metadata across docs so `npm run lint:docs` passes.
- Release iOS Build can now download the finished iOS archive and attach the IPA directly to a tagged GitHub release.
- Added [docs/process/release-process.md](docs/process/release-process.md), connecting branch/PR policy, SemVer decisions, the CHANGELOG/todo.md conventions, and the existing (previously underused) automated release-build GitHub Action into one end-to-end release workflow.

## [1.4.0] - 2026-03-22

### Added
- GlassStackHeader and HeroHeader components to expand the iOS 26-inspired UI kit, plus an AchievementsScreen scaffold for future engagement features.
- Expanded Pittsburgh RSS coverage (WESA, Kidsburgh, Penguins, Pirates, Pitt Panthers, and more) with opt-in defaults for audio/experimental feeds and Settings badges for default-off sources.
- Digest settings now let users store an optional Perplexity API key locally on-device for digest and article summaries.

### Changed
- Navigation, profile, digest, saved, and settings flows refreshed alongside storage/context updates; RSS service and saved-article handling tuned for more resilient data fetch and caching.
- Daily Digest now pulls from live feed data instead of mock articles, surfaces launch controls directly in Digest & Launch settings, and falls back to extractive summaries when no AI key is saved.
- Daily Digest now uses profile-scoped feed recency metadata from Home and Section fetches, so it avoids resurfacing stories the active profile already pulled into the feed moments earlier.
- Onboarding now uses scroll-safe slides, a real Next action, accessible progress feedback, and current `minimal`/`comprehensive` tab-layout selection instead of a dead CTA.
- Profile now surfaces tracked reading metrics, relative last-read/save activity, and karma tier status from current device data instead of placeholder streak copy.
- Profile is now pared back to overview, reading, account, and support sections, removing duplicate Settings paths and preview-only clutter.

### Fixed
- Sign in with Apple flow and FullStory instrumentation hardened; Jest setup and shared components updated for more reliable tests and UI interactions.
- Pinned Reanimated/Worklets versions to the Expo SDK 54 native bundle to stop JS/native mismatch crashes in Expo Go.
- Feed ordering now follows each story's real `publishedAt` timestamp, and Home/Section screens keep cached stories visible with honest retry messaging when refreshes fail.
- Reading progress now stays in memory between syncs, saves are batched per active profile, and ArticleScreen safely completes zero-scroll content without corrupting progress state.
- The last active profile now restores on relaunch, and profile switches immediately update the selection used by saved-article and reading-progress storage.
- Completing onboarding now also marks the current app version as seen, so post-update What's New flows do not reopen on the next launch.
- Theme changes now propagate across the app shell and primary surfaces without reload, replacing the old frozen `theme/colors` path with reactive tokens in navigation, onboarding, profile, reader, and settings flows.
- Production runtime dependencies in the feed/network stack were patched and pinned via direct upgrades and overrides, clearing current `npm audit --omit=dev` findings for `fast-xml-parser` and related transitive packages.
- Removed the build-time Perplexity env dependency from app code, and digest refreshes no longer advance the last-visit timestamp when a digest fetch fails.
- Profile stats now retain recent fetched article ids/timestamps, and feed refreshes record them without regressing active-profile persistence.

### Documentation
- Rewrote the public GitHub README to better explain the app, local setup, IPA/TestFlight installation, versioned releases, and changelog workflow.
- New and updated guides: EAS hosting, backend learning notes, navigation iOS26 patterns, onboarding/What’s New templates, RSS feed templates, and refreshed standards/deployment docs.
- Added a GitHub Actions iOS release workflow and updated the release docs around the EAS-first IPA/TestFlight path.

## [1.3.6] - TBD

### Fixed
- Stabilize auth/settings to prevent intermittent sign-in and settings-sync issues (backported from `patch/1.3.5-fixes`).

### Notes
- Includes hotfixes from `patch/1.3.5-fixes`. Work for 1.4 remains on `release/1.4.0` and will be released separately.

## [1.3.0] - 2026-01-21

### Added
- Continue Reading section on HomeScreen that surfaces in-progress articles with progress chips and a Show all toggle.
- Haptic feedback on HomeScreen pull-to-refresh trigger for a more tactile refresh cue.
- Per-section updated timestamp + haptic feedback on SectionScreen pull-to-refresh.
- 5-minute smart cache for RSS category fetches to avoid redundant network calls on quick revisits.
- SavedScreen pull-to-refresh with updated timestamp + haptic scaffold for future metadata refresh.
- SavedScreen debounced search with recent queries, filters (source/category/status/date), and sorting (newest/oldest/progress/length/source).
- SavedScreen “no results” state for search/filters with clear action.

### Changed
- Saved articles storage schema upgraded to v2 with LZ-string compression (backward compatible) to reduce AsyncStorage footprint for large article bodies.
- Onboarding grounding slide refined: full-width selector cards with visual previews, compact breath bar within the card, and centered, margin-aware buttons to avoid overflow on small screens.

### Fixed
- Profile stats now increment for saved articles and completed reads so the Profile screen shows live activity and achievements.
- Added rss2json fallback for RSS fetching to reduce empty feeds when proxies are blocked or sources reject CORS requests.
- Updated WPXI feed URL to the live outbound RSS endpoint so WPXI articles appear again.
- Skip caching empty category results and bypass empty caches within the TTL so feeds retry instead of getting stuck blank.
- HomeScreen now hydrates instantly from any existing Top cache while force-refreshing in the background for fresh headlines.

## [1.2.0] - 2026-01-18

### Added - Experimental Features
- **Experimental iOS 26 Navbar Option**: Feature flag for testing enhanced glass morphism effects on the bottom navigation bar
  - Opt-in toggle in Settings → Tab Bar Settings
  - Marked with BETA badge for visibility
  - Increases blur intensity from 60 → 80
  - Higher background opacity (0.95 vs 0.85) for enhanced glass effect
  - Persistent setting via AsyncStorage

### Documentation
- `EXPERIMENTAL_FEATURES.md`: Guide for testing experimental features, including how to enable and what to expect

## [1.1.0] - 2026-01-18

### Added - Content & Data
- **Real RSS Integration**: Live news feeds from Pittsburgh sources (WTAE, CBS Pittsburgh, WPXI, TribLive, Public Source, Post-Gazette, and more)
- **Full Article Fetching**: Automatic full-text retrieval for truncated RSS feeds
  - Source-specific parsers for WTAE, WPXI, CBS, City Paper, TribLive
  - CORS proxy support for web scraping when needed
  - Intelligent content extraction with fallback strategies
- **HTML Content Parser**: Advanced parsing for images, captions, and structured content
- **AI Summarization Service**: Perplexity API integration for article summaries (optional, graceful fallback)
- **Sensitive Content Detection**: Automatic grounding mode prompts for sensitive topics

### Added - iOS 26 UI System
- **iOS 26-inspired UI component system** with glass morphism effects:
  - **GlassButton**: Blur-effect buttons with prominence styles (standard, tinted, filled, destructive)
  - **NavigationHeader**: Custom header with subtitle support (SwiftUI `.navigationSubtitle()` equivalent)
  - **BottomToolbar**: Glass toolbar with semantic item placement, fixed/flexible spacers
  - **ZoomModal**: Modal with zoom transition from source element (`.matchGeometry` equivalent)
  - **BlurSheet**: Bottom sheet with dynamic blur/transparency based on detent position
- **ThemeContext**: Centralized theme management with automatic light/dark mode switching
- **iOS26DemoScreen**: Interactive showcase of all new components (accessible from Debug settings)

### Added - Reading Features
- **RSVP Reader (Abridged Mode)**: High-speed reading with Rapid Serial Visual Presentation
  - Configurable reading speeds (200-500 WPM)
  - Smart word timing based on word length
  - Automatic pause completion with optional auto-save
  - Customizable focus colors and anchor strategies
  - Photo credit and caption filtering
- **Auto-Save on Completion**: Automatically save articles when reading finishes in RSVP mode
- **Grounding Mode**: Guided breathing exercises for sensitive content
  - Multiple animation styles (simple, waves, pulse)
  - Customizable breath duration and cycle count
  - Configurable colors
- **AI Article Summarization**: Optional AI-powered summaries using Perplexity (toggle in settings)

### Added - User Features & Settings
- **Swipe Gestures** in ArticleScreen:
  - Swipe right from left edge to go back
  - Swipe left to save/unsave articles
  - Haptic feedback on successful actions
- **Dark Mode**: Automatic theme switching based on system appearance
- **Comprehensive Settings System**:
  - **Reading Settings**: RSVP reader, grounding mode, summarization, auto-save, reading speed, font size
  - **Digest Settings**: Digest summary modes, time of day preferences, notification settings
  - **Customization Settings**: Focus colors, font sizes, focus position, grounding customization, global animation toggles
  - **Sources Settings**: Manage RSS feeds, add custom sources
  - **Tab Bar Settings**: Layout switching (minimal/comprehensive), tab reordering, experimental iOS 26 navbar
  - **Debug Settings**: Data management, app info, developer toggles, modal demos, tab bar presets
- **Tab Bar Customization**: Users can add/remove/reorder tabs in navigation
- **Profile System**: Basic profile context for future multi-user support
- **Error Handling System**: Comprehensive error codes and user-friendly messages

### Enhanced
- **LiquidTabBar**: Enhanced with iOS 26 glass morphism aesthetics:
  - Increased blur intensity (50 → 60)
  - Improved gradient with 3-stop diagonal effect
  - Better background opacity for docked/floating states
  - Changed tint from 'default' to 'light'

### Technical
- Added dependencies: `expo-blur@~15.0.8`, `react-native-gesture-handler@~2.28.0`, `fast-xml-parser`, `cheerio`, `node-html-parser`
- All animations use react-native-reanimated spring physics (damping: 20, stiffness: 300)
- Haptic feedback integration via expo-haptics for button presses and gesture completions
- Platform-aware blur effects (iOS native blur, Android solid backgrounds)
- Safe area handling throughout all components
- Modern Gesture.Pan() API for gesture handling (replaced deprecated useAnimatedGestureHandler)
- Colorblind-friendly cyan accent colors (#0097A7 light, #00BCD4 dark)
- Context providers for Settings, Saved Articles, Profiles, and Scroll state
- AsyncStorage persistence for all user preferences and settings
- CORS proxy integration for web content fetching

### Documentation
- `docs/ios26-ui-components.md`: Technical implementation details and design principles
- `docs/ios26-quick-reference.md`: Quick reference guide with code examples and patterns
- `docs/ios26-implementation-summary.md`: Comprehensive implementation overview
- `docs/ios26-installation.md`: Installation and setup guide
- Updated `docs/APP_STORE_CONNECT_TESTFLIGHT_NOTES.md` with current features
- Comprehensive feature documentation across 6 settings screens

### Known Limitations
- Saved articles are stored in memory only (not persisted to AsyncStorage yet)
- No pull-to-refresh functionality
- No article sharing capability
- No search/filter for saved articles
- Profile system structure exists but not fully implemented

### Fixed
- Removed deprecated Sentry `enableInExpoDevelopment` option from App.tsx
- Fixed BlurSheet JSX tag mismatch (PanGestureHandler → GestureDetector)

### Testing
- All tests passing (10/10 Jest tests)
- SwiftUI → React Native mappings validated
- Gesture interactions tested on iOS

## [1.0.0] - 2026-01-15

### Added
- Initial engineering standards document published (`docs/development/engineering-standards.md`)
- Standards Governance Agent: `docs/standards-governance-agent.md` for standards maintenance process
