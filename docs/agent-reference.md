# Agent Reference — rules the agent follows when working on this repo
Last Updated: 2026-01-26

Location: `docs/agent-reference.md`

Purpose

This file is the canonical instruction set the project's automation/agent (e.g., GitHub Copilot/automation scripts) uses when making changes. It is intentionally short, prescriptive, and editable so you can fine-tune behavior over time. The agent must read this file at the start of each task.

High-level goals

- Preserve repository stability: prefer PRs, small incremental changes, and passing tests.
- Be explicit: include clear PR descriptions, testing steps, and links to related docs/ADRs.
- Be reversible: prefer small commits and feature flags for risky changes.

What the agent must do (required)

1. Always create a feature branch for any change: use prefixes `feat/`, `fix/`, `chore/`, `docs/`, `ci/`, `test/`.
2. Run the repo's validation steps locally before opening a PR:
   - `npm ci` (or `npm install` if CI cache not available)
   - `npm test` (or a targeted test command)
   - `npm run lint` (if defined)
   - `npm run lint:docs`
3. Use the docs linter and fix obvious doc issues automatically (dates, headings) if safe.
4. Produce a compact todo list for multi-step tasks and mark progress (this repo uses `docs/scripts/doc-lint.js` and the agent's todo system).
5. When editing files, prefer smallest possible diffs and preserve existing style and line endings.
6. Do not push directly to `master` unless the change is an emergency hotfix and the exception is recorded in `docs/push-policy.md`.
7. Open a PR with a clear title, a description including testing steps, and tag requested reviewers.
8. Run the repo linter and unit tests; if tests fail, do not request a review until fixed.

Escalation / blocking

- If blocked by missing credentials, unclear requirements, or failing CI that cannot be resolved, add a comment to the PR describing the block and notify the repository owner (see `CODEOWNERS` or `README.md`).

Editable knobs

- `ALLOW_DIRECT_MASTER_PUSH`: when set by a human in `docs/push-policy.md` this overrides default behavior for specific users/roles.
- `AGENT_AUTO_FIX_DOCS`: whether the agent should auto-fix doc issues. Default: true.

How to update this reference

- Edit `docs/agent-reference.md` directly and commit to a branch. Agent should re-load this file on the next task run.

Signature

This is the agent's runtime policy for the abridged repository. Treat it as authoritative unless a newer version appears in `docs/`.
