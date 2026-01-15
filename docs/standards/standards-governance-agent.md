# Standards Governance Agent — Abridged App

Version: 0.1  
Last updated: 2026-01-15

## Purpose

This document defines the role, responsibilities, and operating model for the Standards Governance Agent: a lightweight, living authority that creates, maintains, and evolves the project's engineering and release standards.

## Scope

- Project-level standards and policies stored under `docs/standards/` and top-level policy files (e.g., `CHANGELOG.md`, `VERSION_HISTORY.md`).
- Processes that affect release safety, versioning, and documentation quality.
- Recommendations for automation and checks to keep standards enforceable.

## What the agent does

- Codifies intent into durable documentation (standards, ADRs, changelog rules).
- Reviews and curates inbound standards changes (PR review guidance and acceptance criteria).
- Maintains the authoritative list of required documents and their expected formats.
- Proposes CI checks and labels that help prevent regressions in process (e.g., missing changelog entry, missing version bump).
- Acts as the single source of truth for where standards live and how they evolve.
- Maintains Preflight and Afterflight checklists (`preflight.md`, `afterflight.md`) to enforce consistent change quality gates.

## Operating model

- **Ownership**: The agent is maintained by the engineering owner(s) listed in the project README (technical lead or rotating steward).
- **Change requests**: All changes to standards or ADRs MUST be via a PR with: summary, reason, how to test, and accessibility considerations (if UI-related).
- **Review cadence**: Non-trivial changes require at least one peer review and one approver (owner). Minor edits (typo, formatting) may be merged by the owner.
- **Versioning**: Standards documents are living text files. Significant changes should be recorded in `adr/` with an ADR and reflected in `CHANGELOG.md` under an appropriate category.

## Acceptance criteria for changes

Before merging a standards change PR the following should be satisfied:

- **Rationale provided**: Why the change is needed and what problem it solves.
- **Backwards impact**: Describe migration or rollout steps if the change affects processes or tooling.
- **Tests or validation steps**: If applicable, include tests or manual validation steps.
- **Changelog entry**: Add a short entry to `CHANGELOG.md` under `Unreleased` (see template below).
- **Documentation cross-links**: Update `README.md` or other index files if the change introduces new docs or moves files.

### Changelog entry template (example)
```
- [Added] Standards Agent: published Preflight and Afterflight checklists.
```

## Automation and recommended CI checks

Suggested signals the agent recommends to be enforced in CI (design first; implementation later):

- PR must include a changelog entry if the PR affects user-facing behavior or project policies.
- Version bump check for releases (ensure `package.json` or iOS marketing version updated when appropriate).
- Documentation link check: PRs that add/remove files under `docs/standards/` should update `README.md`.
- Linting for Markdown (optional): ensure consistent formatting for docs and ADR templates.
- PR label requirement: If UI files changed, require `standards:ui` + `needs:accessibility-check` labels.

## How to propose changes

1. Create a branch `chore/standards/<short-desc>` or `docs/<short-desc>`.
2. Edit the target doc in `docs/standards/` and add an ADR in `docs/standards/adr/` if the change is a decision.
3. Add a `CHANGELOG.md` entry under `Unreleased` summarizing the change.
4. Open a PR and include the testing steps and owner(s) as reviewers.

## Living document lifecycle

- Keep documents concise and actionable.
- Archive or move obsolete docs to `docs/archive/` and note the reason in an ADR.
- Update `README.md` (in this folder) if docs are added/removed.

## Owner and contacts

- **Primary owner**: Engineering lead (record in repository metadata or README).
- **Secondary owner**: Rotating steward from the engineering team.

## Minimal governance checklist (for quick reference)

- PR summary present
- Why it changed (rationale)
- How to test (steps)
- Changelog entry added
- Owner review completed
