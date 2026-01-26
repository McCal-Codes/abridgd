# Branching & Pull Request (PR) Guidelines — Abridged

This document expands on the repo's branching model and PR workflow with practical examples, checklist items, and common gotchas.

## Branching model
Use short-lived, focused branches. Name branches with this pattern:
- feature/<name> — for new features (e.g., `feature/api-client`)
- fix/<name> — for bug fixes (e.g., `fix/article-search`)
- chore/<name> — repository or infra work (e.g., `chore/update-deps`)
- release/<version> — release preparation branches (e.g., `release/1.4.0`)
- hotfix/<name> — urgent fixes to a release branch

Keep branches small and single-purpose. If a change looks large, split into multiple PRs that can be reviewed independently.

## Creating a PR — best practices
1. Branch off `master` (or the active release branch) and make focused commits.
2. Push and open a PR with: clear title, concise description, testing steps, and impact notes.
3. Add reviewers: include the owner for the area you are changing (e.g., `@frontend-team` or the module owner).
4. Mark draft PRs while still iterating; convert to Ready when tests and docs are complete.
5. Address feedback with small commits and, if needed, rebase/squash to keep history tidy.
6. Merge only when CI passes, approvals met, and changelog/docs updated (when user-facing).

## PR description template
- Summary: One-line change summary.
- Motivation: Why this change is needed.
- Changes: High-level list of changes (files, modules).
- Testing: What tests were added/modified and manual verification steps.
- Risk & Rollback: Potential risks and how to revert if needed.

## Review checklist (for reviewers)
- Does the PR title and description explain the 'why' and 'what'? ✅
- Are tests included and passing? ✅
- Are docs updated (if behaviour, APIs, or public-facing UI changed)? ✅
- Is the change scoped to the stated purpose and small enough to review effectively? ✅
- Any accessibility implications? (labels, hit targets, keyboard navigation) ✅
- Any new dependencies? Run through `docs/standards/dependency-evaluation.md`. ✅
- Performance or binary size impacts considered (for native)? ✅

## Merge strategy & history hygiene
- Use **Squash merge** for features and fixes to keep the main branch history concise.
- Use **Rebase + merge** only when preserving per-commit history is essential.
- Always run the Afterflight checklist (see `docs/standards/afterflight.md`) before merging.

## Common PR types & examples
- Small fix: `fix/header-alignment` — single file change + test. Good for quick review.
- Feature with infra: `feature/api-client` — include unit tests, docs, and a `PoC` example screen. Mark draft until docs and tests are in place.
- Dep upgrade: `chore/upgrade-react-native` — include `dependency-evaluation` notes, test plan, and rollout strategy.

## PR templates & automation
- Use `.github/PULL_REQUEST_TEMPLATE.md` as the default PR body. This repo already includes a template that enforces a dependency checklist when adding packages.
- Consider GitHub Actions to block merges for PRs that modify `package.json` without an attached dependency-evaluation file in the PR description (see `docs/standards/dependency-evaluation.md` for the checklist).

---

_Short tip:_ Attach a short gif or screenshot for UI changes — it speeds up reviews and reduces back-and-forth.
