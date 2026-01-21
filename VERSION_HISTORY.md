# Version History

This document tracks all updates, features, and fixes for the Abridged app.

---

## [1.4.0] - Planned
### Core Completions & Polish
- Persistent saved articles storage (AsyncStorage integration)
- Pull-to-refresh on all feed screens (Home, Sections, Saved)
- Share article functionality with headline, link, and optional summary
- Search and filter for saved articles (by headline, source, category)
- Professional empty state designs for all scenarios

### Pre-Launch Essentials
- Privacy Policy and Terms of Service pages
- In-app feedback mechanism for beta testers
- Sentry crash reporting fully configured
- App Store listing optimization

### UX Enhancements
- iOS 26 Demo screen with proper navigation header
- Enhanced onboarding with progressive RSVP speed training (150→300 WPM)
- Improved focus point explanation with visual aids
- Interactive practice exercises for RSVP reading
- Offline content indicator badges

### Profiles & Community Features
- Active Profile tab in navigation bar
- Community tab with Pittsburgh-area local resources:
  - Food banks and mutual aid organizations
  - Farmers markets and community events
  - Curated protest/event listings (opt-in)
  - Submit-a-resource form (moderated)
- Profile screen showing reading stats and account info
- Multi-profile support foundation

### Advanced Customization
- Global animation toggle (enable/disable all animations)
- Reduce Motion preference (system setting respect + override)
- Animation speed controls (0.5× to 2× speed)
- Per-component animation settings (ZoomModal, BlurSheet, LiquidTabBar)

### Additional Features
- Offline reading support with article caching
- Advanced article filtering (by category, date, source)
- App Store Connect submission preparation
- Comprehensive accessibility audit (VoiceOver, Dynamic Type, color contrast)
- Performance optimization pass (memory, load times, animation smoothness)

## [1.3.0] - 2026-01-21
### Home & Sections
- Continue Reading section on Home with in-progress chips and “Show all” toggle.
- Haptic feedback on Home pull-to-refresh; SectionScreen shows updated timestamp + haptic on refresh.
- 5-minute smart cache for RSS category fetches to avoid redundant calls on quick revisits.

### Saved & Search
- Pull-to-refresh on Saved with updated timestamp + haptic scaffold.
- Debounced Saved search with recent queries, filters (source/category/status/date), and sorting (newest/oldest/progress/length/source).
- “No results” state for Saved search/filters with clear action.

### Data & Storage
- Saved articles storage schema v2 with LZ-string compression (backward compatible) to reduce AsyncStorage footprint for large article bodies.

### UX
- Onboarding grounding slide refined with full-width selector cards, compact breath bar, and centered buttons for small screens.

### Fixed
- Profile stats now increment for saved articles and completed reads so Profile shows live activity and achievements.

## [1.2.0] - 2026-01-18
### Experimental Features & Settings Enhancement
- Added experimental iOS 26 navbar option with enhanced glass morphism effects
  - Feature flag allows users to opt-in to test new design improvements
  - Toggle in Settings → Tab Bar Settings with BETA badge
  - Increases blur intensity to 80 and background opacity to 0.95 for premium glass effect
  - Setting persists via AsyncStorage
- Created comprehensive experimental features documentation
- Demonstrates feature-gating pattern for gradual adoption of new design paradigms

## [Unreleased]
- Documentation organization improvements
- Repository health and maintenance updates

## [1.1.0] - 2026-01-18
### iOS 26 UI System Release
- Added iOS 26-inspired glass morphism UI components (GlassButton, NavigationHeader, BottomToolbar, ZoomModal, BlurSheet)
- Implemented ThemeContext with automatic light/dark mode switching
- Added swipe gestures to ArticleScreen (back navigation + save/unsave)
- Enhanced LiquidTabBar with iOS 26 glass effects
- Integrated haptic feedback throughout the app
- Added colorblind-friendly cyan accent colors
- Implemented RSVP Reader (Abridged Mode) with speed reading
- Created comprehensive iOS 26 documentation (4 docs)
- Organized documentation with centralized README
- Updated all project documentation to reflect current features

### Content & Data
- Real RSS integration from Pittsburgh news sources (WTAE, CBS, WPXI, TribLive, Public Source, Post-Gazette, and more)
- Full article fetching service for truncated RSS feeds with source-specific parsers
- HTML content parser for images, captions, and structured content
- AI summarization service using Perplexity API (optional, with graceful fallback)
- Sensitive content detection with automatic grounding mode prompts

### Reading Features & Settings
- RSVP Reader with configurable speeds (200-500 WPM), smart word timing, and auto-save on completion
- Grounding mode with guided breathing exercises (customizable animations, durations, colors)
- AI article summarization toggle
- Auto-save articles when finishing RSVP reading
- Comprehensive settings system across 6 dedicated screens:
  - Reading Settings (RSVP, grounding, summarization, speed, font size)
  - Digest Settings (summary modes, timing, notifications)
  - Customization Settings (colors, fonts, animations, grounding)
  - Sources Settings (RSS feed management)
  - Tab Bar Settings (layout switching, tab reordering)
  - Debug Settings (data management, developer tools)
- Tab bar customization with add/remove/reorder capabilities
- Profile system structure for future multi-user support
- Comprehensive error handling with user-friendly messages

## [1.0.0] - 2026-01-15
- Initial engineering standards document published
- Standards governance process established
- Added debug logging for navigation and tab rendering
- Fixed bottom tab bar visibility by removing deprecated tabBarVisible option
- Improved settings button debug output and touch handling
- Updated tab layout switching logic and persistence

## 2026-01-13
- Fixed settings button navigation and touch area
- Enhanced tab navigation with NYT-style minimal layout
- Added ability to switch between minimal and comprehensive tab layouts
- Improved repository organization and build scripts
- Updated tab bar icons and touch targets

## 2026-01-12
- Initial implementation of tab layout switching
- Added custom tab configurations for minimal and comprehensive modes
- Refactored navigation types and context

## 2026-01-11
- Major refactor of navigation structure
- Added onboarding and settings screens
- Improved AsyncStorage persistence for user preferences

## 2026-01-10
- Initial project setup
- Basic tab navigation and article screens
- Added support for RSS feeds and mock articles

---

> For each new update, add a new section with the date, a summary of changes, and a list of features and fixes.
