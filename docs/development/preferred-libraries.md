# Preferred Libraries — Abridged

This file lists recommended libraries for common concerns when building Abridged. These are our go-to, well-maintained choices that align with Expo 54 / React Native 0.81 / TypeScript and our engineering standards.

Principles
- Prefer cross-platform, actively maintained packages with good test coverage and small bundle size.
- Favor solutions that integrate cleanly with Expo and do not require heavy native configuration unless justified.
- Document rationale for any divergence from these recommendations in PRs and `CHANGELOG.md` when user-facing.

Core categories

- Analytics & Monitoring
  - Preferred: `@sentry/react-native` (error/reporting + performance), `expo-firebase-analytics` (optional analytics)
  - Rationale: Sentry provides crash & performance tracing with minimal setup; Firebase analytics integrates with Expo well.

- Navigation & Deep Linking
  - Preferred: `@react-navigation/native` + `@react-navigation/native-stack` + `expo-linking`
  - Rationale: Robust, well-supported navigation with linking support and lots of migration/recipe docs.

- State Management
  - Preferred: `Redux Toolkit` for global structured state, `Zustand` or `Jotai` for lightweight localized state
  - Rationale: Reduce boilerplate, keep slices small and testable. Use context & hooks for small, encapsulated state.

- Networking & Data
  - Preferred: `axios` or `fetch` + `@tanstack/react-query` (caching, retries, background refresh)
  - Rationale: `react-query` simplifies server state management and resilience.

- Persistence / Caching
  - Preferred: `@react-native-async-storage/async-storage` for simple storage, `react-native-mmkv` for performance-sensitive use cases, `expo-sqlite` for structured local DB needs.
  - Rationale: Balance simplicity and performance; pick as appropriate based on data size and access patterns.

- Testing
  - Preferred: `jest`, `@testing-library/react-native`, `@testing-library/jest-native` for unit and component testing. E2E: `Detox` or `Maestro` if needed.

- Forms & Validation
  - Preferred: `react-hook-form` + `zod` (or `yup`)
  - Rationale: `react-hook-form` reduces re-renders, `zod` provides static typing-friendly validation.

- Animations
  - Preferred: `react-native-reanimated` (v3+), `react-native-gesture-handler`; vector animations: `lottie-react-native` if needed.

- Images & Media
  - Preferred: `expo-image`, `react-native-fast-image` (if native build), `expo-camera` for capture workflows.

- Localization
  - Preferred: `react-i18next` + `expo-localization`

- Utilities
  - Preferred: `date-fns` (small, tree-shakeable), `clsx`, `lodash-es` (only specific functions)

How to use
- Reference this doc when proposing a dependency—if proposing a different package, include clear rationale against the preferred suggestion.
- Maintainers should update this list when a preferred library changes due to maintenance, security, or platform shifts.
