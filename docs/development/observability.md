# Observability Baseline — Abridged

This page documents our recommended baseline for monitoring and observability.

Goals
- Catch crashes, performance regressions, and critical errors in the wild.
- Have lightweight dev-time tooling for debugging (Flipper, local logs).

Recommended tools
- Sentry (`@sentry/react-native`) for crash reports, breadcrumbs, and performance traces.
- Flipper for local debugging and plugin-based inspection.
- CI smoke tests and release health checks (basic smoke test on each release).

Quick setup notes
- Sentry: configure DSN via environment; only enable detailed traces in production when budgeted.
- Flipper: keep plugins documented in `docs/` and add a short setup snippet in `docs/development/debugging.md`.

What to observe
- Crash rates, new issue volume, key performance metrics (cold starts, screen render times), and feature flags errors.

On-call & triage
- Document the channel/owner to notify for production issues (Slack/Teams), and record triage steps in `docs/development/oncall.md`.
