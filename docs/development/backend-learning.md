# Backend Learning Path (Abridged)

Version: 1.0

Last Updated: 2026-01-20

A pragmatic path to get comfortable building and deploying backend features that pair well with our Expo/React Native app.

## Goals
- Understand HTTP fundamentals and REST-ish API design.
- Build small Node/TypeScript services with tests.
- Deploy lightweight server code (Expo Router API Routes or a minimal Node service).
- Handle auth, persistence, and observability at a basic level.

## Suggested progression
1) **Foundations (HTTP + JSON)**
   - Requests, responses, status codes, headers, caching, CORS.
   - Practice: Write a tiny fetch client in-app hitting a public JSON API; log status/headers.

2) **TypeScript + Node essentials**
   - Modules, env vars, async/await, error handling.
   - Practice: CLI script that fetches data, validates shape with `zod`, exits non-zero on failure.

3) **Minimal APIs**
   - Pick one: Expo Router API Routes (`web.output: "server"`) or Express/Fastify.
   - Practice: Build a `GET /health` and `POST /echo` with validation and structured errors.

4) **Data layer**
   - Start with SQLite + Prisma or simple file-backed storage for prototypes.
   - Practice: Create/read/update a small resource (e.g., notes). Add unique constraints and 404/409 handling.

5) **Auth and security basics**
   - Concepts: sessions vs. tokens, password hashing, rate limiting, input validation, logging hygiene.
   - Practice: Protect one route with a shared secret header; reject missing/invalid; add tests.

6) **Testing**
   - Use Jest + supertest (or Expo Router’s built-in fetch) for request-level tests.
   - Practice: Cover happy path + validation + auth failure.

7) **Deployment options**
   - **Expo Router API Routes**: Keep server code in `app/*+api.ts`, deploy via EAS Hosting (`web.output: "server"`).
   - **Standalone Node**: Minimal Express/Fastify on a small host (Railway/Fly/Render). Add start script and health checks.
   - Practice: Deploy a “hello” route; hit it from the app; log response.

8) **Observability (starter)**
   - Structured logs, request IDs, basic metrics (latency, error rate), uptime checks.
   - Practice: Add request logging middleware and a simple `/metrics` JSON payload.

## How to practice inside this repo
- For server-in-repo work, prefer Expo Router API Routes so deployments stay unified.
- Keep secrets out of client bundles; only reference sensitive env vars in server files.
- Add tests under `src/**/__tests__/` when you create new fetchers or parsers.

## Resources
- HTTP: MDN (status codes, caching, CORS)
- Expo Router API Routes: https://docs.expo.dev/router/web/api-routes/
- Static vs. server output: https://docs.expo.dev/versions/latest/config/app/#output
- Prisma + SQLite (for quick local persistence): https://www.prisma.io/docs/orm/overview/databases/sqlite
- Validation: https://github.com/colinhacks/zod
- Fastify (if you go standalone): https://fastify.dev/
