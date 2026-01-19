# Codex Context Base — Abridged
Last updated: 2026-01-19

Use this as the minimal boot-up context for Codex/agents working in the repo.

## Must-read anchors
- `AGENTS.md` — operating rules, standards pointers, AI-local-only note.
- `config.toml` — canonical project facts (paths, commands, standards links).
- `docs/standards/ai-usage.md` — AI usage policy (local-only, no secrets).
- `docs/standards/checklist-quickref.md` — links to Preflight/Afterflight/testing/design.

## Commands to know
- Start: `npm start`
- Tests: `npm test` (or `npx jest --runInBand`)
- AI leak scan: `npm run audit:ai-leak`
- Repo health: `npm run repo:health`

## Guardrails (quick)
- Icons: Lucide React Native only; no emojis in UI.
- Hit targets: ≥44pt; respect safe areas.
- Tabs: 3–5, distinct nouns; settings not in tabs.
- SemVer + changelog entry for user-facing or standards changes.
- Accessibility required (VoiceOver labels, Dynamic Type, Reduce Motion friendly).

## File placement
- Shared UI/utilities: `src/shared/`
- Feature-specific: `src/features/<domain>/` when available; otherwise existing structure.
- Scripts: under `scripts/<folder>/` (never in `scripts/` root).

## When using AI
- Keep prompts/local generations offline; do not paste repo content to external services.
- Treat AI output as drafts; run tests and `npm run audit:ai-leak` before commit.
