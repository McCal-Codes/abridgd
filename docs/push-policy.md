# Push & Pull Request Policy

Purpose

This document defines when to create a pull request (PR) vs push directly to `master`, branching and naming conventions, and the emergency hotfix process. It is the single-source policy used by contributors and any automation/agent working on this repository.

Default rule

- Use feature branches and open a pull request for all non-trivial changes. Do NOT push directly to `master` except for emergency hotfixes (see below).

Branching & naming

- Branch from `master` for new work.
- Use descriptive, kebab-case branch names prefixed by type: `feat/`, `fix/`, `chore/`, `docs/`, `test/`, `ci/`.
  - Examples: `feat/article-reader-pagination`, `fix/crash-on-open`, `docs/eas-workflows`.

Pull request requirements

- Title should be concise and follow Conventional Commits style (e.g., `feat: add EAS workflow docs`).
- PR body should include: summary, testing steps, any migration or rollout notes, and link to related issues/ADRs.
- At least one approving review from a repository maintainer is required before merge.
- All CI checks (lint, tests, doc-lint) must pass before merging.
- Squash commits on merge unless preserving history is required.

When to push directly to `master`

- Emergency hotfix that must be deployed immediately (e.g., production-broken bug). Follow the hotfix process:
  1. Create a short-lived branch `hotfix/<short-desc>` from `master`.
  2. Make the minimal fix, run tests locally, and run `npm run lint:docs` and relevant linters/tests.
  3. Open a PR and request an expedited review. If you truly cannot wait for review and you are a repo maintainer, you may merge directly.
  4. After merging, create a post-merge PR to revert any temporary elevated permissions or to perform follow-up cleanup if needed.

Agent/automation rules

- The project's agent must follow this policy by default.
- The agent should create branches and PRs rather than pushing directly to `master` unless explicitly authorized in a documented exception in this file.
- When the agent opens a PR it must include a clear description and testing steps, and run the repo's CI.

Commit message guidelines

- Use Conventional Commits (type(scope): short summary). Examples:
  - `feat(reader): add infinite scroll`
  - `fix(api): handle empty responses`
  - `docs: add EAS workflows document`

Enforcement and protections

- Protect the `master` branch with required status checks and required reviews.
- Use the CI workflows to enforce `npm run lint:docs` and other linters/tests on PRs.

Fine-tuning

- Update this file when team conventions change. The agent will re-read it at the start of tasks.
