# Dependency Evaluation — Detailed Guidance

This page expands the quick checklist with concrete steps, examples, and CLI helpers for auditing a package before adding it to the repo.

## Pre-proposal research
- Check repository health: commits, issues, PR cadence, open PRs. Watch for abandoned projects.
- Check issues for security advisories or unaddressed bugs.
- Confirm license compatibility (`MIT`, `Apache-2.0` usually OK).
- Search for alternatives and compare trade-offs (maintenance, bundle size, feature set).

## Evaluation matrix (scorecard)
- Maintenance (0–3): Frequency of releases, PR merges.
- Security (0–3): Known advisories; vulnerability history.
- Size/Perf (0–3): Estimated code footprint & runtime cost.
- Platform compatibility (0–3): Works with Expo/RN versions we support.
- Accessibility (0–3): Accessibility support or override hooks.
- Observability (0–3): Can be instrumented for logging/metrics easily.
- Total: Favor packages scoring ≥12 for heavy use; 8–12 require careful review.

## Practical checks
- Try local install in a temporary branch and run `npm run build` + `npm run test`.
- Bundle size: run `npx source-map-explorer` or `webpack-bundle-analyzer` for web portions.
- Native modules: check iOS Podspec and Android Gradle targets for conflicts.

## Documentation to include in PR
- Short rationale: Why this package vs our preferred selection (cite `docs/development/preferred-libraries.md`).
- Security/Privacy: What data the package collects or sends.
- Migration: Any required code changes and upgrade path.
- Acceptance Criteria: Tests, perf measurements, and owner for long-term maintenance.

## Example: Adding `@tanstack/react-query`
- Pros: best-in-class server-state caching, retries, background refetching.
- Cons: adds another dependency; requires learning curve for devs.
- Checklist for adding:
  - [ ] Run the repo health checks and test locally.
  - [ ] Add wrapper module `src/shared/data/reactQueryClient.ts` + typed adapters.
  - [ ] Add sample screen and unit tests showing offline and retry behavior.
  - [ ] Document in `docs/development/preferred-libraries.md` if adopted.

## Optional automation ideas
- Github Action: detect changes to `package.json` and require a checklist file or PR label (e.g., `dep-eval-needed`).
- Script to compute rough bundle size for web (CI step) and fail if it exceeds threshold.

## Rollback plan
- Pin the package to a patch-level version in `package.json` for at least the first release.
- Add a migration note in `CHANGELOG.md` and keep the old code behind a feature flag for easier rollback.

---

If you want, I can add a GitHub Action stub that enforces the checklist for PRs that change `package.json` (won't auto-block, but will leave a comment and label the PR).
