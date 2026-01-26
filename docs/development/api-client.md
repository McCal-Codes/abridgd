# API Client — Design & Usage

This doc describes the `ApiClient` PoC and how to use it.

Overview
- `src/shared/api/httpClient.ts`: low-level `fetch` wrapper handling timeouts and JSON parsing.
- `src/shared/api/apiClient.ts`: higher-level client with:
  - Retry with exponential backoff + jitter
  - Optional Authorization header injection using `authService`
  - Transparent 401 handling via `authService.refreshToken()`
  - Error mapping to `ApiError` for easier downstream handling

Usage
- Call `apiRequest(baseUrl, path, options, { includeAuth: true })` to enable auth header injection and refresh handling.

Testing & Examples
- Unit tests are in `src/shared/__tests__/apiClient.test.ts`.
- Example UI: `src/screens/ApiDemoScreen.tsx` demonstrates a simple fetch with auth injection and retry logic.

Next steps
- Instrument with Sentry breadcrumbs and metric hooks for performance tracking.
- Consider adopting TanStack Query (`@tanstack/react-query`) for complex server-state use-cases; follow `docs/standards/dependency-evaluation.md` before adding.
