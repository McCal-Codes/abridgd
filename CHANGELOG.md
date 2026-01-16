# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-01-16

### Added
- iOS prebuild configuration to support EAS Build
- `.easignore` file to exclude build artifacts from EAS uploads
- Branding standards documentation (`docs/standards/branding.md`)
- EAS Build workflows documentation (`docs/eas-workflows.md`)
- Documentation linting script (`docs/scripts/doc-lint.js`)

### Changed
- **BREAKING**: App display name changed from "abridged" to "Abridgd"
- **BREAKING**: iOS bundle identifier changed from `com.mccal.abridged` to `com.mccalmedia.abridged`
- Updated app icon to 1024x1024 PNG format
- Removed iOS folder from git tracking (now generated via `expo prebuild`)
- Android project added via prebuild for cross-platform support

### Fixed
- App icon loading issues resolved by clearing caches and regenerating assets
- EAS Build sandbox permission errors addressed

## [1.0.0] - 2026-01-15

### Added
- **Standards Governance**: Complete standards documentation system
  - Standards Governance Agent documentation (`docs/standards/standards-governance-agent.md`)
  - Preflight checklist (`docs/standards/preflight.md`)
  - Afterflight checklist (`docs/standards/afterflight.md`)
  - Engineering standards (`docs/standards/engineering.md`)
  - Design standards (`docs/standards/design-standards.md`)
  - Testing baseline (`docs/standards/testing-baseline.md`)
  - Repo organization standards (`docs/standards/repo-organization.md`)
  - Standards drift check automation (`docs/standards/standards-drift-check.md`)
- **Architecture Decision Records (ADRs)**:
  - Navigation model (ADR-0001)
  - RSS parsing approach (ADR-0002)
  - State management (ADR-0003)
  - Theming and semantic colors (ADR-0004)
- **Context Providers**:
  - `ProfileContext` for user profile management
  - `SavedArticlesContext` for managing saved articles
  - `SettingsContext` for app settings and preferences
  - `ScrollContext` for scroll state management
- **Features**:
  - AI summarization with Perplexity API integration
  - Fun loading indicator with rotating facts
  - Tab bar customization (icon visibility, ordering, labels)
  - Dark mode support
  - Custom liquid tab bar animations
  - Article saving and bookmarking
  - RSS feed aggregation and parsing
- **Components**:
  - `AbridgedReader` - Article reading interface
  - `ArticleCard` - Feed item display
  - `ErrorBoundary` - Error handling wrapper
  - `FunLoadingIndicator` - Loading state with facts
  - `GroundingOverlay` - Modal overlay component
  - `LiquidTabBar` - Animated tab navigation
  - `ScaleButton` - Pressable with scale animation
- **Screens**:
  - `HomeScreen` - Main feed view
  - `ArticleScreen` - Full article reading
  - `SavedScreen` - Bookmarked articles
  - `TabBarSettingsScreen` - Tab bar customization
  - `DebugSettingsScreen` - Developer tools and diagnostics
- **Documentation**:
  - Project vision (`docs/vision.md`)
  - Architecture overview (`docs/architecture.md`)
  - Development guide (`docs/development.md`)
  - Deployment guide (`docs/deployment.md`)
  - Debugging guide (`docs/debugging.md`)
  - Roadmap (`docs/roadmap.md`)
  - iOS IPA/TestFlight guide (`docs/ios-ipa-testflight.md`)
  - Build troubleshooting guides
- **Testing**:
  - Jest configuration with React Native preset
  - Test setup with mocking for React Navigation, Safe Area Context, Lucide icons
  - Initial test suites for key components
- **CI/CD**:
  - GitHub Actions workflow for automated testing
  - EAS Build configuration for iOS/Android
  - TestFlight deployment pipeline

### Changed
- Replaced emoji icons with Lucide React Native icons for better consistency
- Increased tab bar height for better touch targets (meets 44pt iOS minimum)
- Updated theme tokens to use semantic color naming
- Improved settings screens with collapsible sections and better organization

### Fixed
- React Native Worklets version mismatch resolved
- Tab bar customization persistence issues
- Safe Area Context mocking in tests
- Lucide icons mocking for Jest tests

### Security
- Added `.env` file for API key management (excluded from git)
- Configured Perplexity API key as environment variable
- Set `ITSAppUsesNonExemptEncryption: false` in iOS Info.plist

## [0.1.0] - 2026-01-12

### Added
- Initial project structure with Expo SDK 52
- React Navigation setup with tab-based navigation
- Basic theming system with light mode support
- TypeScript configuration
- ESLint and Prettier setup
- Git repository initialization
- README with project overview
- Basic feed configuration for RSS sources

### Dependencies
- expo ~52.0.29
- react-native 0.76.6
- @react-navigation/native 7.0.11
- react-native-reanimated 3.16.6
- lucide-react-native ^0.468.0

---

## Version History Summary

| Version | Release Date | Key Changes |
|---------|--------------|-------------|
| Unreleased | TBD | Rebranding to "Abridgd", iOS build fixes, EAS Build setup |
| 1.0.0 | 2026-01-15 | Complete standards framework, AI summarization, settings overhaul, comprehensive documentation |
| 0.1.0 | 2026-01-12 | Initial release, basic navigation and theming |

---

## Upgrade Guide

### From 0.1.0 to 1.0.0
- No breaking changes to public APIs
- New context providers available (ProfileContext, SavedArticlesContext)
- Settings screens significantly redesigned
- Added Perplexity API integration (requires API key in `.env`)

### To Unreleased
- **BREAKING**: App display name changed to "Abridgd" - update any external references
- **BREAKING**: iOS bundle identifier changed - may require re-registering with Apple Developer account
- Run `npx expo prebuild --clean` to regenerate native folders
- Android support now available via prebuild
