# Abridged

A focused, calm, and distraction-free news reader for Pittsburgh.

![Abridged App Concept](https://via.placeholder.com/800x400?text=Abridged+App+Concept)

## Overview

Abridged is a mobile application built with React Native and Expo that aims to rethink how local news is consumed. Instead of infinite feeds and gamified engagement, Abridged offers a finite, daily edition of curated stories.

It features two distinct reading modes:
1.  **Classic Mode:** A clean, typography-focused reading experience.
2.  **Abridged Mode:** An RSVP (Rapid Serial Visual Presentation) reader for high-speed information ingestion.

## Features

✨ **iOS 26-Inspired Glass UI** — Modern glass morphism effects with blur and transparency
📱 **Light & Dark Modes** — Automatic theme switching with colorblind-friendly accent colors
👆 **Intuitive Gestures** — Swipe right to go back, swipe left to save articles
⚡ **RSVP Speed Reader** — Read articles faster with Abridged Mode
🗂️ **Organized Navigation** — Clean tab bar with enhanced blur effects
📰 **Curated Content** — Daily digest of Pittsburgh news stories
🔖 **Save for Later** — Bookmark articles with a simple swipe
♿ **Accessible Design** — Safe area handling and haptic feedback throughout

## Tech Stack

*   **Framework:** React Native (Expo SDK 54)
*   **Language:** TypeScript
*   **Navigation:** React Navigation
*   **State:** Context API (ThemeProvider, SettingsProvider, SavedArticlesProvider)
*   **Animations:** React Native Reanimated with spring physics
*   **Gestures:** React Native Gesture Handler
*   **UI Effects:** Expo Blur, Expo Haptics
*   **Backend:** Mocked Data (RSS feeds coming soon)

## Getting Started

### Prerequisites
- Node.js 20.19.4 or higher
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Studio
- Xcode (for iOS development)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/McCal-Codes/abridged.git
    cd abridged
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm start
    ```
4.  Run on platform:
    - iOS: Press `i` or `npm run ios`
    - Android: Press `a` or `npm run android`
    - Web: Press `w` or `npm run web`

### Available Scripts

- `npm start` — Start Expo development server
- `npm test` — Run Jest test suite
- `npm run test:watch` — Run tests in watch mode
- `npm run test:coverage` — Generate test coverage report
- `npm run build:ipa` — Build iOS IPA for TestFlight
- `npm run repo:health` — Run repository health audit
- `npm run lint:docs` — Validate documentation formatting

## Project Structure

*   `src/`: Main source code.
    *   `src/App.tsx`: Main application component.
*   `src/screens/`: Feature screens (Home, Section, Article).
*   `src/components/`: Reusable UI components.
*   `src/navigation/`: Navigation configuration.
*   `src/theme/`: Design tokens (Colors, Typography).
*   `src/data/`: Mock data sources.
*   `scripts/`: Active maintenance and testing scripts.
*   `_archive/`: Deprecated scripts and experiments.
*   `docs/`: Project documentation and architecture decisions.

## Documentation

### Core Documentation
*   [Vision](./docs/product/vision.md) — Product vision and philosophy
*   [Architecture](./docs/product/architecture.md) — Technical architecture overview
*   [Roadmap](./docs/product/roadmap.md) — Feature roadmap and priorities
*   [Features](./docs/product/FEATURES.md) — Complete feature list

### Development Guides
*   [Development Setup](./docs/development/development.md) — Getting started with development
*   [Debugging Guide](./docs/development/debugging.md) — Debugging tips and tools
*   [Engineering Standards](./docs/development/engineering-standards.md) — Code quality standards

### iOS 26 UI Components
*   [iOS 26 Components](./docs/ios26/ios26-ui-components.md) — Complete technical documentation
*   [Quick Reference](./docs/ios26/ios26-quick-reference.md) — Code examples and patterns
*   [Implementation Summary](./docs/ios26/ios26-implementation-summary.md) — Implementation overview
*   [Installation Guide](./docs/ios26/ios26-installation.md) — Setup instructions

### Deployment
*   [Deployment Guide](./docs/deployment/deployment.md) — Production deployment process
*   [EAS Workflows](./docs/deployment/eas-workflows.md) — Expo Application Services setup
*   [iOS IPA Build](./docs/deployment/ios-ipa-testflight.md) — TestFlight build guide
*   [TestFlight Testing](./docs/deployment/TESTFLIGHT_TESTING_GUIDE.md) — Beta testing guide

### Research & Standards
*   [RSVP Research](./docs/research/rsvp-notes.md) — Speed reading research notes
*   [Standards Directory](./docs/standards/) — Complete standards documentation
*   [Standards Governance](./docs/development/standards-governance-agent.md) — Standards maintenance process

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:
- Development workflow
- Code standards
- Pull request process
- Testing requirements

See also:
- [Security Policy](SECURITY.md) — Reporting vulnerabilities
- [Code of Conduct](docs/standards/engineering.md) — Community guidelines

## License

This project is proprietary software. See beta license agreement in [docs/NDA/](docs/NDA/).

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Email**: contact@mcc-cal.com
- **Beta Testing**: TestFlight (invite required)

---

Built with ❤️ for Pittsburgh | Version 1.1.0
