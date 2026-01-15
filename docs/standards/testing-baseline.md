# Testing Baseline for Abridged App

**Last Updated:** 2026  
**Test Framework:** Jest 29.7.0 + React Native Testing Library 13.3.3  
**Status:** ✅ All 10 baseline tests passing

## Overview

The Abridged app now includes a **minimum test harness** aligned to standards governance and quality gates. These tests provide a foundation for catching regressions and validating critical user paths.

## Test Suites

| Suite | Tests | Status | Purpose |
|-------|-------|--------|---------|
| **HomeScreen** | 2 | ✅ PASS | Validates empty feed state and article fetching on mount |
| **SavedScreen** | 4 | ✅ PASS | Validates saved articles context and empty/populated states |
| **ArticleScreen** | 4 | ✅ PASS | Validates ArticleScreen component structure and mocking |

## Running Tests

```bash
# Run all tests
npx jest --runInBand

# Run a specific test suite
npx jest src/screens/__tests__/HomeScreen.test.tsx --runInBand

# Watch mode (continuous)
npx jest --watch
```

## Test Coverage

### HomeScreen Tests
- ✅ Renders empty feed state when no articles
- ✅ Fetches articles on mount with correct category

### SavedScreen Tests
- ✅ Renders empty saved articles state
- ✅ Renders saved articles list when articles exist
- ✅ Handles unsave action
- ✅ Integrates SavedArticlesContext correctly

### ArticleScreen Tests
- ✅ Component renders without crashing (smoke test)
- ✅ Exports ArticleScreen as named export
- ✅ Mock article has correct structure
- ✅ Mock route provides article params

## Mocking Strategy

### Services Mocked
- `RssService.fetchArticlesByCategory` → returns mocked article arrays
- `FullStoryService.fetchFullArticleBody` → returns empty promise
- `AiService.summarizeArticle` → returns mock summary

### Providers Mocked
- `react-native-reanimated` → simplified animations (no native bridging)
- `react-native-safe-area-context` → default insets
- `react-native-svg` → mocked SVG components
- `lucide-react-native` → mocked icon components
- `expo-font`, `expo-status-bar` → mocked expo modules
- `@react-native-async-storage/async-storage` → jest mock

### Components Mocked in Tests
- `ScaleButton` → simple View wrapper (avoids reanimated complexity)
- `AbridgedReader` → simple View with label

## Configuration

### jest.config.js
- **Preset:** `jest-expo` (Expo 54 compatible)
- **Transform:** `babel-jest` (for TypeScript/JSX)
- **testEnvironment:** `node` (RN testing compatible)
- **setupFilesAfterEnv:** Loads `jest.setup.js` mocks

### jest.setup.js
Centralized mock definitions for:
- AsyncStorage
- Safe area context (insets)
- Reanimated worklets
- React Native SVG
- Lucide icon library
- Expo modules

## Design Rationale

**Baseline vs. Comprehensive:**
The 3 baseline test suites target:
- **Entry Points:** HomeScreen (main entry), SavedScreen (saved articles), ArticleScreen (article detail)
- **State Management:** Context providers and async data fetching
- **Smoke Tests:** Ensure components don't crash with valid data

**Pragmatic Mocking:**
Heavy dependencies (reanimated animations, nav integration) are mocked to avoid environment complexity while keeping tests fast and reproducible.

## Next Steps

### Phase 2 (Future)
- Add integration tests for navigation flows (HomeScreen → ArticleScreen → SavedScreen)
- Add snapshot tests for complex UI (article rendering, theme variants)
- Expand coverage to utility functions and custom hooks
- Integrate test runs into CI/CD pipeline (see [docs/standards/standards-drift-check.md](standards-drift-check.md))

### Phase 3 (Future)
- Add E2E tests with Detox for real device behavior
- Add visual regression tests (Percy or similar)
- Add performance benchmarks for scroll and lazy-loading

## Preflight Gate

**Reference:** [docs/standards/preflight.md](preflight.md)  
All code changes must pass these tests before merge:
```bash
npx jest --runInBand --testMatch="**/__tests__/*.test.tsx"
```

## Troubleshooting

### "No safe area value available"
✅ Fixed: `useSafeAreaInsets` mocked globally in jest.setup.js

### "Element type is invalid"
✅ Fixed: Components properly exported/mocked; icons mocked as View components

### "Cannot read property of undefined (reading 'fetchArticlesByCategory')"
✅ Fixed: RssService mocked with `require()` pattern in HomeScreen test

### "act(...) warning"
⚠️ Expected: Informs that async state updates should be wrapped in `act()` in future tests. Does not fail tests.

## See Also
- [docs/standards/preflight.md](preflight.md) — Test requirement for PRs
- [docs/standards/afterflight.md](afterflight.md) — Release test checklist
- [docs/standards/a11y-audit.md](a11y-audit.md) — Dark mode / Dynamic Type tests
- [jest.config.js](../../jest.config.js) — Jest configuration
- [jest.setup.js](../../jest.setup.js) — Global mocks
