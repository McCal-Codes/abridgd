Summary:
- Adds a production-ready API client PoC with retries/backoff, auth header injection + refresh flow, and ApiError mapping.
- Adds low-level fetch wrapper with timeout handling.
- Adds `AuthService` PoC (token storage + refresh stub).
- Adds unit tests for http client and api client, and a demo screen `ApiDemoScreen`.

Files of note:
- `src/shared/api/httpClient.ts`
- `src/shared/api/apiClient.ts`
- `src/services/AuthService.ts`
- `src/screens/ApiDemoScreen.tsx`
- `src/shared/__tests__/httpClient.test.ts`
- `src/shared/__tests__/apiClient.test.ts`
- `docs/development/api-client.md`
- `docs/development/preferred-libraries.md`
- `docs/standards/dependency-evaluation.md`

Testing and verification:
- All unit tests for the new modules pass locally (`npx jest src/shared/__tests__/`).
- Manual test: run the app and open the screen `ApiDemoScreen` (or navigate to it) and press "Fetch Post" to exercise auth injection and retry behavior.

Notes for reviewers:
- This is a documentation-first PoC; `AuthService.refreshToken` is a stub for now and should be replaced by the real refresh endpoint flow when available.
- Suggest keeping the PR as a draft until we decide whether to adopt `@tanstack/react-query` for server state (I can follow up with an evaluation PR).

Checklist:
- [x] Tests added and passing for PoC modules
- [x] Docs added explaining design and usage
- [ ] Add Sentry breadcrumb instrumentation (follow-up PR)
- [ ] Evaluate and propose `react-query` adoption (follow-up RFC)
