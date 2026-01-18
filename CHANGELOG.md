# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

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
