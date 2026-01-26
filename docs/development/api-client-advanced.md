# API Client — Advanced Usage & Best Practices

This document details usage patterns, instrumentation points, testing recommendations, and migration options for the `ApiClient` PoC.

## Core features (recap)
- Exponential backoff + jitter for transient failures.
- Optional Authorization header injection using `AuthService`.
- 401 handling: refresh token flow via `AuthService.refreshToken` and immediate retry.
- Error mapping to `ApiError` for easier downstream handling.

## Instrumentation (Sentry breadcrumbs & timing)
- Add a Sentry breadcrumb on each request start/stop and any retry/refresh events.
- Capture timing: startTime, endTime, duration, and HTTP status.
- Example snippet:

```ts
// pseudocode
import * as Sentry from '@sentry/react-native';

Sentry.addBreadcrumb({
  category: 'api',
  message: `GET /posts/1`,
  data: { url, attempt },
});

Sentry.captureMessage('api.request.failed', { level: 'error', extra: { url, status }});
```

## Observability & metrics
- Track: request latency histogram, error rate, 401 refresh rate, and retry counts.
- Use lightweight counters exported to metrics provider (if any). A Sentry tag or metric is fine for early rollout.

## Testing strategy
- Unit tests for all code paths: 2xx success, non-OK (4xx/5xx), network errors, abort handling.
- Integration test: example screen `ApiDemoScreen` in dev build ensuring header injection and retry flows work.
- Consider E2E test for a critical flow that uses the real backend or a stubbed server.

## Migration to `react-query` (if chosen)
- Keep `ApiClient` as the low-level transport layer.
- Add a `reactQuery` adapter that leverages `apiRequest` for fetching and configures global retry/backoff logic to match our strategy.
- Benefits: caching, background refetch, optimistic updates for mutations.

## Security considerations
- Store tokens in secure storage for non-demo flows (e.g., Keychain/Keystore via `react-native-mmkv` or other secure store). Avoid persisting secrets in cleartext.
- Sanitize error messages before showing to users.

## Example recipes
- Auth-protected GET:
  - Use `apiRequest(baseUrl, '/me', {}, { includeAuth: true })`.
- Retry policy tuning:
  - For idempotent requests (GET), allow higher retry count; for non-idempotent (POST) prefer conservative retries or server-based idempotency tokens.

## Future improvements
- Circuit breaker pattern for service stability under repeated failures.
- Bulkhead isolation per service endpoint if one remote backend is unreliable.
- Request coalescing for frequent identical requests.

---

If you'd like, I can add Sentry breadcrumbs to the client and a tiny metrics hook (non-production-safe default) as a follow-up commit.
