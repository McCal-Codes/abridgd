# awesome-ios → Abridged (React Native/Expo) mapping

A quick reference that translates themes from the `awesome-ios` list into equivalents that fit our stack (Expo 54, React Native 0.81, React 19, TypeScript). Use it as inspiration, not as a dependency source.

## Guiding principles
- Prefer Expo/React Native first; only consider native iOS-specific ideas when there is a clear gap and we can maintain it.
- Preserve accessibility, Reduced Motion safety, and theme tokens from `src/theme/`.
- Avoid adding dependencies without rationale; reuse existing tooling when possible.

## Category mapping
- **Analytics / Monitoring** → `@sentry/react-native`, `expo-firebase-analytics`, Crashlytics; keep minimal logging in production.
- **App routing / Deep links** → React Navigation + `expo-linking` for deep links and universal links; coordinate with `Linking` helpers.
- **Architecture patterns** (TCA/MVVM/VIPER) → Unidirectional data flow with Redux Toolkit, Zustand/Jotai, or React context modules. Keep slices small and typed.
- **Caching / Persistence** → `@react-native-async-storage/async-storage` for simple needs; `react-native-mmkv` for perf-sensitive state; `expo-sqlite` or WatermelonDB for structured/offline data.
- **Networking** (Alamofire/Moya analogs) → Fetch or Axios + interceptors; pair with TanStack Query (`@tanstack/react-query`) for caching, retries, and mutations.
- **Concurrency / Promises** → JavaScript `async/await` with `AbortController` for cancellation; avoid ad-hoc promise chains. Use react-query request scoping where possible.
- **UI components** (controls, layouts) → Build with React Native core primitives; compose with `react-native-gesture-handler`, `react-native-reanimated` (for perf), `expo-image`, `react-native-svg`. Respect safe areas and 44pt hit targets.
- **Animations** (Lottie, transitions) → `lottie-react-native` where vector playback is required; otherwise prefer Reanimated 3 or the native Animated API for lightweight cases. Honor Reduce Motion.
- **Forms / Validation** → `react-hook-form` + `zod` (or `yup`) schemas; centralize error copy and accessibility labels.
- **Logging / Debugging** → Dev logging via Flipper/Metro; production observability through Sentry breadcrumbs/performance. Keep noisy logs out of release builds.
- **Localization** → `react-i18next` or `expo-localization` + ICU messages; avoid hardcoded strings; keep keys stable.
- **Onboarding / Walkthrough** → Use existing screen components; no “dead buttons.” Include reversibility/trust language and Reduced Motion-friendly affordances.
- **Testing** → Jest + React Native Testing Library for units/integration; Detox/Maestro for E2E if needed. Snapshot sparingly.

## When to reach for native iOS inspiration
- Platform UX polish (haptics, gestures, accessibility hints) that can be mirrored in RN.
- Performance patterns (caching, batching, layout strategies) that translate to RN equivalents.
- Avoid pulling iOS-only libraries unless there is a justified, maintained RN bridge and a clear owner.

## How to use this doc
- As a quick mapping when someone suggests an `awesome-ios` item—find the RN/Expo analogue here first.
- When proposing new dependencies, cite this mapping and document rationale in PR notes and `CHANGELOG.md` if user-facing.
