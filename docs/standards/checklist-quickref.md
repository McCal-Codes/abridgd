# Checklists Quick Reference — Abridged
Last Updated: January 19, 2026

Use this one-pager to jump to the right guardrails before and after changes.

- **Preflight (before coding):** `docs/standards/preflight.md` — scope, rationale, acceptance, blast radius; standards alignment.  
- **Afterflight (before merge/release):** `docs/standards/afterflight.md` — PR signals, changelog, docs/ADR updates, regression checks, accessibility, versioning.  
- **Testing baseline:** `docs/standards/testing-baseline.md` — what’s covered by default, commands (`npm test`, `npx jest --runInBand`), mocks.  
- **Design standards:** `docs/standards/design-standards.md` — Lucide-only icons, 44pt hits, tab rules, semantic colors, HIG alignment.  
- **AI usage:** `docs/standards/ai-usage.md` — local-only AI prompts, treat outputs as drafts, run `npm run audit:ai-leak`.  
- **Repository organization:** `docs/standards/repo-organization.md` — where new files live; use `src/shared/` or `src/features/<domain>/`.

Suggested flow: Preflight → code/tests → `npm run audit:ai-leak` (if AI used or new secrets touched) → Afterflight → PR.
