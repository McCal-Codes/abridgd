# Abridged App — Standards Home
Version 1.0
Last Updated: January 15, 2026

Welcome to the authoritative source for all standards, workflows, and decision records for the Abridged app.

This folder (`docs/standards/`) is the **single source of truth** for how we build, ship, and govern this project.

---

## Quick Start: Which Doc to Read?

### I'm about to start working on a change
→ Read [**Preflight**](preflight.md)
*Scope, standards alignment, repo health, accessibility/perf checks before you begin.*

### I'm about to merge a PR or ship a release
→ Read [**Afterflight**](afterflight.md)
*Code review gates, changelog, regression tests, release metadata before merge.*

### I want to understand how we make engineering decisions
→ Read [**Standards Governance Agent**](standards-governance-agent.md)
*Roles, responsibilities, acceptance criteria, how to propose standards changes.*

### I'm building or changing the UI
→ Read [**UI & Design Standards**](design-standards.md)
*Navigation, layout, visual hierarchy, dark mode, typography.*

### I'm working with app branding or naming
→ Read [**Branding Standards**](branding.md)
*App name, display name, bundle identifiers, technical vs. user-facing naming conventions.*

### I need to write or run tests
→ Read [**Testing Baseline**](testing-baseline.md)
*Jest setup, test suites, mocking strategy, how to run tests.*

### I'm architecting a feature or refactoring
→ Read [**Architecture Decisions (ADRs)**](adr/)
*Load-bearing decisions: navigation model, state management, RSS parsing, theming.*

### I want to know the project's engineering principles
→ Read [**Engineering Standards**](engineering.md)
*Versioning, git strategy, code quality gates, testing, dependencies, observability.*

---

## Files in this folder

| Doc | Purpose | Audience |
|-----|---------|----------|
| [Preflight](preflight.md) | Pre-change checklist | All developers |
| [Afterflight](afterflight.md) | Pre-merge/release checklist | All developers, reviewers, release engineer |
| [Branding Standards](branding.md) | App naming, display names, bundle IDs | All developers, product, marketing |
| [Standards Governance Agent](standards-governance-agent.md) | How standards evolve | Tech lead, standards steward |
| [Standards Drift Check](standards-drift-check.md) | CI automation and PR label enforcement | DevOps, tech lead |
| [Testing Baseline](testing-baseline.md) | Jest test harness + baseline tests | All engineers, QA |
| [UI & Design Standards](ui-design.md) | Design principles, HIG alignment | Product designers, frontend engineers |
| [Engineering Standards](engineering.md) | Versioning, quality gates, dependencies | All engineers |
| [Accessibility Audit](a11y-audit.md) | Dark mode, Dynamic Type, VoiceOver test matrix | QA, frontend engineers, designers |

---

## How we use these docs

### Before you code
1. Read **Preflight** (2 min)
2. Skim the relevant standard (UI, engineering, architecture)
3. Check if an ADR exists for your area

### Before you merge
1. Run **Afterflight** checklist (5 min)
2. Ensure changelog entry is present
3. Confirm peer review + owner approval

### When proposing a standards change
1. See **Standards Governance Agent** (process + acceptance criteria)
2. Add a changelog entry
3. Link ADR or architecture update if appropriate

---

## Standards evolution

Standards live in this folder and are versioned alongside the code.
Significant changes are recorded in:
- `CHANGELOG.md` (root level) — user-facing summaries
- `adr/` — architectural decisions
- Inline in the standard doc itself

**Golden rule**: If a standard does not serve the project's goals (predictable releases, reviewable changes, fast rollback), question it. We update standards to match reality, not the other way around.

---

## Contact & Ownership

- **Primary steward**: Engineering lead (see `README.md` at project root)
- **Secondary**: Rotating steward from engineering team
- **Policy questions**: Open an issue or PR referencing the relevant standard

---

## Next Steps

- [ ] Skim Preflight and Afterflight (5 min)
- [ ] Add to your PR template: "Run Afterflight before merging"
- [ ] Review the ADRs in `adr/` for decisions affecting your work
- [ ] Bookmark this page; send to new team members

---

## Architecture Decision Records (ADRs)

Load-bearing decisions are documented in `adr/`:

| ADR | Title | Status |
|-----|-------|--------|
| [0001](adr/0001-navigation-model.md) | Navigation Model (Tabs + Settings) | Accepted |
| [0002](adr/0002-rss-parsing-approach.md) | RSS Parsing and Content Extraction | Accepted |
| [0003](adr/0003-state-management.md) | State Management (React Context API) | Accepted |
| [0004](adr/0004-theming-and-semantic-colors.md) | Theming and Semantic Colors | Accepted |

Each ADR includes context, decision, consequences, and alternatives considered.
