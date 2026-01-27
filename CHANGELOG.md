# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [Unreleased]

### Added
- Onboarding now includes Simple, Standard, and Power layout choices with live tab previews that apply the matching navigation preset immediately.
- Simple preset now uses just News and Settings tabs to keep the starter experience minimal and Apple-friendly.

### Changed
- Profile screen now keeps profile headers to a single line, adds icons for codename and email lines, and introduces a once-per-version primer plus a fun loading bar while stats warm up.
- Section feeds now hydrate from cached articles before hitting the network, show the FunLoadingIndicator while refreshing, and fall back to a friendlier retry card when a fetch fails.
- Daily digest now pulls live feed data (no mock articles) and falls back gracefully if the last visit was more than 2 hours ago, while recording the last fetched article IDs per profile for better recency tracking.
- Profile screen polish: clearer stat pills, personalization status chip, last-read and karma tier details, and corrected quick action icons.
- Profile screen fine-tuning: added Dynamic Type-friendly stat values and a karma unlock progress bar for personalization gating.
- Onboarding grounding slide now reflows on compact screens, keeps the selector scrollable, and saves grounding style changes immediately.
- Profile onboarding welcome now has a dismissible backdrop and a wheel-style codename spinner that respects Reduce Motion.
- Profile personalization card cleaned up into a single panel with clearer badges/progress and no duplicate Apple tile.
- Grounding onboarding selector now shows quick pills plus peeking cards so all three styles are discoverable.
- Profile sync/profile-settings cards are now behind a Debug toggle to keep production profile clean.
- Profile avatars now always show an animal icon via a deterministic fallback when codenames lack a matching asset.
- Section screen crash fixed by restoring the Hero header helper in SectionScreen.
- Section screen no longer re-fetches in a loop; last-fetched recording uses a stable dependency.
- Stabilized SectionScreen fetches by storing profile callbacks in a ref, preventing repeated network spam on feed failures.
- Onboarding grounding slide restyled to match RSVP standards with compact copy and contained breath preview.
- Profile codename animation now cycles through all preview names in succession and eases to the final codename (no wheel spin).
- Home loading indicator now centers over content during initial fetches for better perception of progress.
- Top Stories pulls additional national sources (AP, Reuters, NPR) to reduce empty sections when local feeds are quiet.
- Profile stats are driven by tracked reading progress with roomier pill grid and compact personalization preview.
- Settings now surfaces “News Sources” as the first item and moves the Sources card to the top of Reading Settings for faster access.
- Settings screen reorganized into grouped sections (Content & Delivery, Reading & Focus, Navigation, Support, Advanced) with clearer accessibility hints and consistent hierarchy.
- Added BBC World, PA Capital-Star, Morning Brew, and ESPN Pittsburgh as optional feeds; disabled Reuters Top News by default due to 403/DataDome blocks and kept broken locals default-off.
- Home “Show all” in Continue Reading is now a pill button with a 44pt tap target, and list content respects automatic inset adjustment to keep clear of the floating tab bar.
- Article screen now clamps body line-height for large Dynamic Type, disables edge-swipe navigation when Reduce Motion is on, and applies automatic inset adjustment to avoid safe-area overlap.

### Fixed
- Onboarding and Settings no longer throw Reduce Motion/theme token ReferenceErrors in Expo Go; the grounding selector honors motion preferences and spacing uses existing tokens.
- Onboarding “Give Your Eyes a Break” slide no longer clips the RSVP reader demo on compact screens, preserving the card’s rounded corners.
- Screens: Home now shows article-card skeletons during the initial load and WTAE feed retries via rss2json if proxies trim items, so the feed consistently appears.
- Feed lists tuned for performance: added batching/windowing hints to FlatLists (Home, Sections, Saved) to quiet VirtualizedList warnings and keep scrolling smooth on long feeds.
- Profiles now reroll their codename when no matching profile icon exists, avoiding missing avatar images.
- Disabled or opted-out broken feeds (The Incline, WESA Arts, Penguins, Pirates, Pitt Panthers, Pittsburgh Business Times) and swapped the Pittsburgh template to Post-Gazette Biz; Pirates now use the MLB team feed URL.

## [1.4.0] - 2026-01-26

### Added
- GlassStackHeader and HeroHeader components to expand the iOS 26-inspired UI kit, plus an AchievementsScreen scaffold for future engagement features.
- Expanded Pittsburgh RSS coverage (WESA, Kidsburgh, Penguins, Pirates, Pitt Panthers, and more) with opt-in defaults for audio/experimental feeds and Settings badges for default-off sources.

### Changed
- Navigation, profile, digest, saved, and settings flows refreshed alongside storage/context updates; RSS service and saved-article handling tuned for more resilient data fetch and caching.

### Fixed
- Sign in with Apple flow and FullStory instrumentation hardened; Jest setup and shared components updated for more reliable tests and UI interactions.
- Pinned Reanimated/Worklets versions to the Expo SDK 54 native bundle to stop JS/native mismatch crashes in Expo Go.

### Documentation
- New and updated guides: EAS hosting, backend learning notes, navigation iOS26 patterns, onboarding/What’s New templates, RSS feed templates, and refreshed standards/deployment docs.
- Reorganized TestFlight deployment/testing docs into a dedicated subfolder and grouped development session notes under a single index.

## [1.3.5] - TBD

_No recorded changes yet. Add fixes here if a patch is cut after 1.3.0._

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
