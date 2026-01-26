# Development Documentation

Guides, standards, and best practices for developing Abridged.

## Documents

### [Development Guide](development.md)
Complete development setup and workflow:
- Prerequisites and installation
- Running the development server
- Available npm scripts
- Project structure overview
- Common development tasks

### [Debugging Guide](debugging.md)
Debugging tips and troubleshooting:
- React Native debugging tools
- Common error messages
- Performance profiling
- Network request inspection
- Platform-specific debugging (iOS/Android)

### [Engineering Standards](engineering-standards.md)
Code quality standards and best practices:
- TypeScript guidelines
- React/React Native patterns
- Testing requirements
- Git workflow
- Documentation standards
- Code review process

### [awesome-ios → RN/Expo Mapping](awesome-ios-mapping.md)
Quick reference translating `awesome-ios` themes into Expo/React Native equivalents:
- Analytics, routing, state management
- Caching/persistence choices
- UI/animation, forms/validation, localization, onboarding
- Testing, logging/observability

### [Preferred Libraries](preferred-libraries.md)
Our recommended library choices and rationale (Analytics, Navigation, State, Networking, Storage, Forms, Animations)

### [Dependency Evaluation Checklist](../standards/dependency-evaluation.md)
Policy and checklist to follow before adding or upgrading third-party dependencies

### [Observability Baseline](observability.md)
Crash reporting and monitoring recommendations (Sentry, Flipper, CI smoke tests)

### Proofs of Concept
- `src/shared/api/httpClient.ts` — A lightweight `fetch` wrapper demonstrating timeouts, JSON parsing, and typed error handling. Includes unit tests at `src/shared/__tests__/httpClient.test.ts`.
- `src/shared/hooks/useApi.ts` — Small `useApi` hook PoC for simple fetch-driven queries; consider replacing with TanStack Query when adding that dependency.
- `src/shared/api/apiClient.ts` — Higher-level API client with retries/backoff, optional auth injection via `authService`, 401 refresh handling, and `ApiError` mapping. Unit tests in `src/shared/__tests__/apiClient.test.ts`.
- `src/screens/ApiDemoScreen.tsx` — Small example screen showing how to call `apiRequest` and view results/errors.
### Related deep-dive docs
- [Branching & PRs](../process/branching-and-prs.md)
- [Dependency Evaluation — Details](../standards/dependency-evaluation-details.md)
- [API Client — Advanced](api-client-advanced.md)



### [Standards Governance](standards-governance-agent.md)
Process for maintaining and evolving standards:
- Standards review cycle
- Proposing standard changes
- Governance responsibilities
- Drift detection and correction

---

**Related Documentation:**
- [Standards Directory](../standards/) — Detailed standards and checklists
- [iOS 26 Components](../ios26/) — UI component system documentation
- [Build Troubleshooting](../build/) — Build-specific issues and solutions
