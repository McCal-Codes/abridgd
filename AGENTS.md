# Agent Instructions — Abridged
Last updated: 2026-01-21

## Purpose
Operating notes for AI/automation working in this repo. Follow these to stay aligned with project standards and avoid regressions.

### When in doubt (micro-checklist)
1) Run Preflight (scope, rationale, acceptance, blast radius)
2) Use short-lived branch (`feature/`, `fix/`, `chore/`)
3) Follow priority order: Fix/Stability → Accessibility → Offline/Loading → Features → Delight
4) Update `todo.md` (priority fixes) + `updates/todo.md` (numbered) + `[Unreleased]` in `CHANGELOG.md`
5) Keep docs in sync (standards links below)

### Recent learnings (living list)
- Priority-first sequencing: Fix/Stability → Accessibility → Offline/Loading → Features → Delight.
- Onboarding/What’s New: micro-adjustments only; preserve Caleb voice; no dead buttons; Reduced Motion safe; trust/reversibility language.
- Backlog sources must stay consistent (`todo.md` priority list + `updates/todo.md` numbered tasks); user-facing changes land in `[Unreleased]` of `CHANGELOG.md`.
- Trust/Intent features (Trust Panel, Follow system) and Reader Studio are scoped for 1.4; Smart Suggestions deferred until after follow + trust.

## Quick Facts
- Stack: Expo 54, React Native 0.81, React 19, TypeScript.
- Entry: `index.ts` → `src/App.tsx`.
- Node: prefer 20.x (see `.nvmrc`/README). Install with `npm install`.
- Common scripts: `npm start` (Expo), `npm test`, `npm run test:watch`, `npm run test:coverage`, `npm run build:ipa`, `npm run build:ipa:quick`, `npm run repo:health`, `npm run lint:docs`.

### Standards quicklinks
- Standards home: `docs/standards/README.md`
- Design: `docs/standards/design-standards.md`
- Onboarding & What’s New: `docs/standards/onboarding-whats-new.md`
- Preflight: `docs/standards/preflight.md`
- Afterflight: `docs/standards/afterflight.md`
- Governance: `docs/standards/standards-governance-agent.md`

## How to Work
- Run the Preflight checklist intent first (scope, rationale, acceptance, blast radius); see `docs/standards/preflight.md`.
- Create short-lived branches `feature/<name>` | `fix/<name>` | `chore/<name>`; trunk-based flow.
- Keep components functional, typed, and small; prefer context over prop drilling.
- Use the theme tokens in `src/theme/`; styling via `StyleSheet.create`.
- Icons: **Lucide React Native only; no emojis** in UI. Preserve 44pt hit targets and safe areas.
- Navigation follows React Navigation tabs + stacks; no tabs for settings/modals; 3–5 tabs only.
- Accessibility is mandatory: Dynamic Type, VoiceOver labels for icon-only controls, Reduce Motion friendly.
- Persisted state lives in AsyncStorage helpers and contexts (`SavedArticlesContext`, settings). Changing shapes requires migration notes/tests.
- Place new shared UI/utilities in `src/shared/` or feature-specific code under `src/features/<domain>/` when possible; avoid adding files to random roots. Scripts belong in `scripts/<folder>/` (never scripts/ root).
- Document deviations from Apple HIG or standards in the PR and update relevant docs.
- Backlog sources: `todo.md` (priority fixes first) and `updates/todo.md` (numbered TODOs). Keep changes aligned with the priority-first ordering.

## Tests & Quality Gates
- Baseline tests exist; run `npm test` (Jest + RNTL). For speed: `npx jest --runInBand`.
- If tests touch reanimated/navigation/icons/etc., rely on existing mocks in `jest.setup.js`.
- For UI/data changes add/adjust tests when feasible; otherwise provide a manual test plan.
- Before merge, run the Afterflight gate in spirit: PR summary, rationale, test steps, screenshots (if UI), accessibility note, changelog entry. See `docs/standards/afterflight.md`.

## Changelog, Versioning, Releases
- Use SemVer in `package.json`; bump when shipping. Build number must monotonically increase for actual releases.
- Add user-facing entries to `CHANGELOG.md` under `[Unreleased]` using `- [Added|Changed|Fixed] …`.
- Tag releases as `vMAJOR.MINOR.PATCH` when applicable.

## UX & Visual Standards (must keep)
- Follow `docs/standards/design-standards.md`: clarity over cleverness, content over chrome.
- Respect safe areas, system spacing, semantic colors (`label`, `background`, `tint`, etc.); avoid hard-coded brand colors for surfaces.
- Prefer system-like motion/curves; honor Reduce Motion; keep animations purposeful.
- Onboarding/What’s New: follow `docs/standards/onboarding-whats-new.md` (Caleb voice-preserving, micro-adjustments only; iOS 26 fit; no dead buttons; trust + reversibility language).
- No dead buttons; Reduced Motion must not break meaning.

## Security/Privacy
- No secrets or tokens in source or logs. Do not log article payloads with identifiers. Prefer structured debug logs only in development.
- AI tooling (Copilot/GPT/etc.): keep generations local-only; do not paste repo content into external chats or cloud prompts. If AI assists, review outputs manually and treat them as drafts—never commit sensitive data or unvetted code.

## Documentation Touchpoints
- Update or cross-link: `README.md`, `docs/standards/` indexes, relevant feature docs, and ADRs if architecture changes.
- For new standards/process changes, follow `docs/standards/standards-governance-agent.md` expectations.
- For onboarding/What’s New changes, consult `docs/standards/onboarding-whats-new.md` and keep original copy visible when auditing; create copy files for code changes (e.g., `WhatsNewScreen.v2.tsx`).
- When modifying backlog/priorities, ensure `todo.md` and `updates/todo.md` stay consistent; reflect user-facing changes in `CHANGELOG.md` under `[Unreleased]`.
- If you add or revise a standard, also update `docs/standards/README.md` (last updated date + table/link) so it remains the index of truth.

## Stop Conditions
- Missing acceptance criteria, HIG deviation without justification, accessibility plan absent for interactive changes, or added dependency without maintenance rationale.
- App fails to launch in Expo, or baseline tests fail.

## Handy Paths
- Tests: `src/utils/__tests__/`, `src/context/__tests__/`.
- UI components (shared): `src/components/`, `src/shared/ui/`.
- Settings & saved flows: `src/screens/ReadingSettingsScreen.tsx`, `src/context/SavedArticlesContext.tsx`.
- Scripts documentation: `scripts/README.md`.

Keep changes small, documented, and testable. If unsure, default to system patterns and update the docs alongside code.
